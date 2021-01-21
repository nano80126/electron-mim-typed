// import net from 'net';
import { ipcMain, IpcMainEvent } from 'electron';
import { CronJob } from 'cron';
import { drop } from 'lodash';
import moment from 'moment';
import { configure, getLogger } from 'log4js';

// import { mainWin } from '../background';

// 設備工序狀態 & 工序名稱
import stepName from '../json/stepName.json';
import stepState from '../json/stepState.json';

// 自定義引入
import { FSocket } from '@/types/main-process';
import { message } from './line';
// import {  clearInterval } from 'timers';

//
// 配置 log
//
configure('./logs/filename');
const logger = getLogger();
logger.level = 'debug';
logger.debug('Some debug messages');

configure({
	appenders: { cheese: { type: 'file', filename: 'cheese.log' } },
	categories: { default: { appenders: ['cheese'], level: 'error' } }
});

logger.error('Some error messages');
// // // // // // // // // // // // // // //

/**宣告 client */
let tcpClient: FSocket = new FSocket();

new CronJob(
	'0 30 17,22 * * 0-6',
	() => {
		let msg = `\n現在時間: ${moment().format('MM/DD HH:mm:ss')}\n伺服器狀態: 正常`;

		if (tcpClient && tcpClient.connected) {
			msg += `\n工藝狀態: ${tcpClient.stepState} \n工藝名稱${tcpClient.stepName}`;
		} else {
			msg += '\n燒結爐狀態: 未連線';
		}

		message(msg)
			.then(res => {
				// mainWin.send
			})
			.catch(err => {
				// mainWin.send
				logger.warn(err);
			});
	},
	null,
	true
);

ipcMain.on('data', (e, args) => {
	console.log(args);
	e.sender.send('reply', 'this is a reply msg');
});

// reconnect at each 5 minutes if disconnect
const cronReconn = new CronJob(
	'0 */5 * * * 0-6',
	() => {
		if (!tcpClient.connected && tcpClient.reconnect) {
			try {
				tcpClient.connect({
					host: tcpClient.ip as string,
					port: tcpClient.port as number,
					family: 4
				});
			} catch (err) {
				console.error(err);
			}
		}
	},
	null,
	false
);

/**connect 要求 */
ipcMain.handle('conn', async (e, args) => {
	const ip = args.ip as string;
	const port = args.port as number;
	const interval = args.interval as number;
	const reconnect = args.reconnect as boolean;

	console.log(args);

	tcpClient = new FSocket();
	// Object.assign(tcpClient, furnace);

	tcpClient.cron = cronReconn;

	tcpClient.on('close', () => {
		console.log('Connection closed');
		//
		tcpClient.removeAllListeners('data');
		tcpClient.connected = false;
		tcpClient.destroy();
		//
		console.log(tcpClient.eventNames());
	});

	tcpClient.connect({ host: ip, port: port, family: 4 });

	const promise = await new Promise(resolve => {
		// 連線成功事件
		tcpClient.on('connect', () => {
			console.log(`Connect to ${ip}:${port}`);
			// Object.assign(tcpClient.furnace, {
			// 	//
			// });
			// // // // 新增
			tcpClient.handleDisc = false;
			tcpClient.connected = true;
			tcpClient.reconnect = reconnect;
			tcpClient.ip = ip;
			tcpClient.port = port;
			tcpClient.interval = interval;
			//

			// response connection successful
			e.sender.send('conn-success', { connected: true, remoteIP: ip, remotePort: port });

			//
			// WsServer
			//

			if (tcpClient.onSample) {
				if (!tcpClient.sampler) {
					//
				}
			}

			tcpClient.on('data', str => {
				const strArr = Array.from(str);
				console.log(strArr);

				if (strArr[7] == 5) {
					// 寫線圈回傳
					console.log('Response of writing coil: ', strArr);
					return;
				}

				// 有回應，清除Timeout notify
				clearTimeout(tcpClient.samplingTimeoutTimer as NodeJS.Timeout);

				const arr = drop(strArr, 9);
				tcpClient.stepName = stepName[arr[67]];
				tcpClient.stepState = stepState[arr[49]];

				// 報警狀態
				if (arr[49] != 0 && arr[49] <= 5) {
					// 先確認是否在冷卻
					if (!tcpClient.coolState) {
						// 若不在冷卻中
						const msg =
							'\n伺服器狀態: 正常' +
							'\n警告: 報警產生' +
							`\n工藝狀態: ${tcpClient.stepState}` +
							`\n工藝名稱: ${tcpClient.stepName}`;

						message(msg)
							.then(res => {
								e.sender.send('notifyRes', res.data);
							})
							.catch(err => {
								e.sender.send('notifyRes', {
									error: true,
									code: err.code,
									message: err.message,
									errno: err.errno
								});
								console.warn(err.data);
							});

						tcpClient.coolState = true;
						tcpClient.coolTimer = setTimeout(() => {
							tcpClient.coolState = false;
						}, 15 * 60 * 1000);
					}

					// 回傳 renderer
					e.sender.send('serial', { serial: str, alarm: true });

					// 廣播 web socket clients
					// wsServer
				} else {
					// 正常狀態
					tcpClient.coolState = false;
					// reset cooldown timer
					clearTimeout(tcpClient.coolTimer as NodeJS.Timeout);

					// 回傳 renderer
					e.sender.send('serial', { serial: str, alarm: false });

					// 廣播 web socket clients
					// wsServer
				}
				//
				// on data event end
				//
			});

			resolve({ connected: true, remoteIp: ip, remotePort: port });
			//
			// on connect event end
			//
		});

		// 連線失敗事件
		tcpClient.on('error', (err: NodeJS.ErrnoException) => {
			console.log(`${err.name} ${err.message}`);

			// const { code } = err as NodeJS.ErrnoException;
			// 回傳
			switch (err.code) {
				case 'ECONNREFUSED': // 有IP, port沒開
				case 'ETIMEOUT': // 沒IP
					// send to renderer
					e.sender.send('conn-error', {
						connected: false,
						error: { message: err.message, code: err.code, errno: err.errno }
					});
					break;
				case 'ECONNRESET': // 被斷線
					// send to renderer
					e.sender.send('conn-error', {
						connected: false,
						error: { message: err.message, code: err.code, errno: err.errno }
					});

					// 廣播被斷線
					// wsServer.
					if (!tcpClient.handleDisc) {
						// 發出訊息
						message(`\n伺服器狀態: 正常\n警告: 燒結爐連線中斷\nCode: ${err.code}`)
							.then(res => {
								e.sender.send('notifyRes', res.data);
								console.log();
							})
							.catch((err: NodeJS.ErrnoException) => {
								e.sender.send('notifyRes', {
									error: true,
									code: err.code,
									message: err.message,
									errno: err.errno
								});
							});

						// 啟動重連機制
						if (tcpClient.cron) tcpClient.cron.start();

						// 5 秒後重連
						if (tcpClient.reconnect) {
							setTimeout(() => {
								try {
									tcpClient.connect({ host: ip, port: port, family: 4 });
								} catch (err) {
									console.log(err);
								}
							}, 5000);
						}
					}
					//
					break;
				default:
					console.error(`${err.code} ${err}`);
					break;
			}

			resolve({
				connected: false,
				error: { message: err.message, code: err.code, errno: err.errno }
			});

			//
			// on error event end
			//
		});
	});

	return promise;
});

// 處理斷線請求
ipcMain.handle('disc', async () => {
	tcpClient.handleDisc = true; // 手動斷線

	const promise = await new Promise(resolve => {
		tcpClient.end(Buffer.from([]), () => {
			//
			resolve({ connected: false });
		});
	});

	// wsServer

	return promise;
});

// 執行取樣
const doSample = function(e: IpcMainEvent) {
	if (tcpClient.writable) {
		//
		tcpClient.samplingTimeoutTimer = setTimeout(() => {
			tcpClient.samplingTimeoutCount++;

			if (tcpClient.samplingTimeoutCount >= 3) {
				message(`\n伺服器狀態: 正常\n警告: 燒結爐無回應`)
					.then(res => {
						e.sender.send('notifyRes', res.data);
					})
					.catch(err => {
						e.sender.send('notifyRes', {
							error: true,
							code: err.code,
							message: err.message,
							errno: err.errno
						});
					});

				tcpClient.samplingTimeoutCount = 0;
				clearInterval(tcpClient.sampler as NodeJS.Timer);
				tcpClient.sampler = undefined;
			}
		}, (tcpClient.interval as number) * 1.5);

		const buf = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x01, 0x04, 0x00, 0x00, 0x00, 0x22]);
		tcpClient.write(buf);
	} else {
		tcpClient.samplingState = false; // set sample state off
		clearInterval(tcpClient.sampler as NodeJS.Timer);
		tcpClient.sampler = undefined;
	}
};

/**開始取樣 */
const startSample = function(e: IpcMainEvent) {
	tcpClient.samplingState = true;
	tcpClient.sampler = setInterval(() => doSample(e), tcpClient.interval as number);
	doSample(e);
};

// 處理取樣命令
ipcMain.on('sampling', (e, args) => {
	const { sampling } = args;

	if (sampling) {
		// 開始取樣
		tcpClient.onSample = true;
		startSample(e);
	} else {
		// 停止取樣
		tcpClient.onSample = false;
		// 若 sampler 存在
		if (tcpClient.sampler) {
			tcpClient.samplingTimeoutCount = 0;
			clearInterval(tcpClient.sampler); // 停止取樣sampler
			tcpClient.sampler = undefined;
		}
	}
});

// 處理 notify 發送命令
ipcMain.on('notifySend', (e, args) => {
	const { msg } = args;
	message(msg)
		.then(res => {
			e.sender.send('notifyRes', res.data);
		})
		.catch((err: NodeJS.ErrnoException) => {
			e.sender.send('notifyRes', { error: true, code: err.code, message: err.message, errno: err.errno });
		});
});

// Number.prototype.toHex = function() {
// 	return this.toString(16).padStart(2, '0');
// };

export { tcpClient };
