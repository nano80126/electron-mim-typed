/* eslint-disable @typescript-eslint/no-use-before-define */

// import net from 'net';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { CronJob } from 'cron';
import { drop, flatten } from 'lodash';
import moment from 'moment';
import { getLogger } from 'log4js';

// 主視窗 webContents
import { mainWin } from '@/background';

// 設備工序狀態 & 工序名稱
import stepName from '@/json/stepName.json';
import stepState from '@/json/stepState.json';

// 自定義引入
import { EwsChannel, EwsFurnaceType, FSocket, IwsConnectedMessasge, IwsSerialMessage } from '@/types/main';
import { message } from '@/api/line';
import { wsServer } from '@/api/express';
// import {  clearInterval } from 'timers';

//
// 配置 log
//
// const appPath = app.getAppPath();
const log = getLogger('hiper');

// log.info('create new log for test, 測試新log');
// // // // // // // // // // // // // // //

/**宣告 client */
let tcpClient: FSocket;

log.info('Start daily notification of Hiper furnace');
new CronJob(
	'0 30 17,22 * * 0-6',
	() => {
		let msg = `\n現在時間: ${moment().format('MM/DD HH:mm:ss')}\n伺服器狀態: 正常`;

		if (tcpClient && tcpClient.connected) {
			msg += `\n工藝狀態: ${tcpClient.stepState} \n工藝名稱: ${tcpClient.stepName}`;
		} else {
			msg += '\n燒結爐狀態: 未連線';
		}

		message(msg)
			.then(res => {
				// mainWin.send
				mainWin?.send('notifyRes', res.data);
				log.info('Daily notification');
			})
			.catch(err => {
				// mainWin.send
				mainWin?.send('notifyRes', {
					error: true,
					code: err.code,
					message: err.message
				});
				// append to log
				log.warn(`${err.code} ${err.message}`);
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
				log.info(`${err.message}, code: ${err.code}`);
				// console.error(err);
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
		/**連驗逾時 */
		const connTimeout = setTimeout(() => {
			const err = new Error(`connect ETIMEDOUT ${ip}:${port}`) as NodeJS.ErrnoException;
			err.code = 'ETIMEDOUT';
			tcpClient.emit('error', err);
		}, 3000);

		// 連線成功事件
		tcpClient.on('connect', () => {
			console.log(`Connect to ${ip}:${port}`);
			log.info(`Connect to ${ip}:${port}`);

			clearTimeout(connTimeout); // 清除連線逾時
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
			// 廣播 clients 燒結爐已連線
			wsServer.clients.forEach(client => {
				const msg: IwsConnectedMessasge = {
					channel: EwsChannel.CONNECT,
					furnace: EwsFurnaceType.HIPER,
					connected: true
				};
				client.send(JSON.stringify(msg));
			});

			// 已設定 OnSample
			if (tcpClient.onSample) {
				// 取樣器不存在
				if (!tcpClient.sampler) {
					startSample(e);
					e.sender.send('sample-change', { sampling: true });
				}
			}

			tcpClient.on('data', str => {
				const strArr = Array.from(str);
				console.log(strArr);

				// 寫coil回傳
				// if (strArr[7] == 5) {
				// 	// 寫線圈回傳
				// 	console.log('Response of writing coil: ', strArr);
				// 	return;
				// }

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
									message: err.message
								});
								// console.warn();
								log.warn(`${err.messaage}, code: ${err.code}`);
							});

						tcpClient.coolState = true;
						tcpClient.coolTimer = setTimeout(() => {
							tcpClient.coolState = false;
						}, 15 * 60 * 1000);
					}

					// 回傳 renderer， 有報警
					e.sender.send('serial', { serial: str, alarm: true });

					// 廣播 web socket clients
					wsServer.clients.forEach(client => {
						const msg: IwsSerialMessage = {
							channel: EwsChannel.SERIAL,
							furnace: EwsFurnaceType.HIPER,
							serial: strArr,
							alarm: true
						};
						client.send(JSON.stringify(msg));
					});
				} else {
					// 正常狀態
					tcpClient.coolState = false;
					// reset cooldown timer
					clearTimeout(tcpClient.coolTimer as NodeJS.Timeout);

					// 回傳 renderer
					e.sender.send('serial', { serial: str, alarm: false });
					// 廣播 web socket clients
					wsServer.clients.forEach(client => {
						const msg: IwsSerialMessage = {
							channel: EwsChannel.SERIAL,
							furnace: EwsFurnaceType.HIPER,
							serial: strArr,
							alarm: false
						};
						client.send(JSON.stringify(msg));
					});
				}
				//
				// on data event end
				//
			});

			resolve({ connected: true, remoteIP: ip, remotePort: port });
			//
			// on connect event end
			//
		});

		// 連線失敗事件
		tcpClient.on('error', (err: NodeJS.ErrnoException) => {
			console.log(`${err.name} ${err.message}`);
			log.error(`${err.name}: ${err.message}`);

			clearTimeout(connTimeout); // 清除連線逾時

			// const { code } = err as NodeJS.ErrnoException;
			// 回傳
			switch (err.code) {
				case 'ECONNREFUSED': // 有IP, port沒開
				case 'ETIMEDOUT': // 沒IP
					// send to renderer
					e.sender.send('conn-error', {
						connected: false,
						error: { message: err.message, code: err.code }
					});
					tcpClient.destroy(); // 確保沒有資料傳輸且關閉連線
					break;
				case 'ECONNRESET': // 被斷線
					// send to renderer
					e.sender.send('conn-error', {
						connected: false,
						error: { message: err.message, code: err.code }
					});

					// 廣播被斷線
					wsServer.clients.forEach(client => {
						const msg: IwsConnectedMessasge = {
							channel: EwsChannel.CONNECT,
							furnace: EwsFurnaceType.HIPER,
							connected: false
						};
						client.send(JSON.stringify(msg));
					});

					if (!tcpClient.handleDisc) {
						// 發出訊息
						message(`\n伺服器狀態: 正常\n警告: 燒結爐連線中斷\nCode: ${err.code}`)
							.then(res => {
								e.sender.send('notifyRes', res.data);
								// console.log();
								log.warn('燒結爐連線中斷。');
							})
							.catch((err: NodeJS.ErrnoException) => {
								e.sender.send('notifyRes', {
									error: true,
									code: err.code,
									message: err.message
								});
								log.warn(`${err.message}, code: ${err.code}`);
							});

						// 啟動重連機制 (僅被斷線情況啟動)
						if (tcpClient.cron) tcpClient.cron.start();

						// 5 秒後重連
						if (tcpClient.reconnect) {
							setTimeout(() => {
								try {
									tcpClient.connect({ host: ip, port: port, family: 4 });
								} catch (err) {
									// console.log(err);
									log.error(`${err.message}, code: ${err.code}`);
								}
							}, 5000);
						}
					}
					tcpClient.destroy(); // 確保沒有資料傳輸且關閉連線
					//
					break;
				default:
					// console.error(`${err.code} ${err}`);
					log.error(`${err.message}, code: ${err.code}`);
					break;
			}

			resolve({
				connected: false,
				error: { message: err.message, code: err.code }
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
	wsServer.clients.forEach(client => {
		const msg: IwsConnectedMessasge = {
			channel: EwsChannel.CONNECT,
			furnace: EwsFurnaceType.HIPER,
			connected: false
		};
		client.send(JSON.stringify(msg));
	});

	return promise;
});

// 執行取樣
const doSample = function(e: IpcMainInvokeEvent) {
	if (tcpClient.writable) {
		//
		tcpClient.samplingTimeoutTimer = setTimeout(() => {
			tcpClient.samplingTimeoutCount++;

			console.log(tcpClient.samplingTimeoutCount);

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
						log.warn('燒結爐無回應。');
					});

				tcpClient.samplingTimeoutCount = 0;
				clearInterval(tcpClient.sampler as NodeJS.Timer);
				tcpClient.sampler = undefined;
			}
		}, (tcpClient.interval as number) * 0.5);

		// const buf = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x01, 0x04, 0x00, 0x00, 0x00, 0x22]);
		// const leng = [0x3c, 0x00]; // 請由資料長度 (2 bytes)
		// 副標頭(2 bytes) + 網路編號(1 byte) + PC 編號(1 byte) + 請求目標模組IO編號(2 bytes) + 請求資料長度(2 bytes) + 監視計時器(2 bytes)
		// const cmd = [0x01, 0x04, 0x00, 0x00, 0x33, 0x01, 0x00, 0xa8, 0x01, 0x00];
		const cmd = [0x03, 0x04, 0x00, 0x00]; // cmd, subcmd
		// const addrW1 = [0x24, 0x01, 0x00, 0xa8, 0x33, 0x01, 0x00, 0xa8, 0x89, 0x01, 0x00, 0xa8, 0x3a, 0x01, 0x00, 0xa8]; // addr of temp
		// const addrW2 = [0x14, 0x00, 0x00, 0xa8]; // addr of presure
		// const addrW3 = [0x17, 0x00, 0x00, 0xa8, 0x18, 0x00, 0x00, 0xa8]; // addr of N2, Ar
		// const addrW4 = [0x51, 0x00, 0x00, 0xa8, 0x23, 0x01, 0x00, 0xa8]; // addr of leave time, step name
		// const addrW5 = [0x70, 0x00, 0x00, 0x90]; // addr of step status
		// const addrW6 = [0x6e, 0x00, 0x00, 0xa8, 0x6f, 0x00, 0x00, 0xa8, 0x70, 0x00, 0x00, 0xa8]; // addr of wait time

		let addrW: number[] | number[][] = [
			[0x24, 0x01, 0x00, 0xa8, 0x33, 0x01, 0x00, 0xa8, 0x89, 0x01, 0x00, 0xa8, 0x3a, 0x01, 0x00, 0xa8], // addr of temp
			[0x14, 0x00, 0x00, 0xa8, 0x15, 0x00, 0x00, 0xa8], // addr of furnace presure, tube presure
			[0x17, 0x00, 0x00, 0xa8, 0x18, 0x00, 0x00, 0xa8], // addr of N2, Ar
			[0x51, 0x00, 0x00, 0xa8, 0x23, 0x01, 0x00, 0xa8], // addr of leave time, step name
			[0x0c, 0x00, 0x00, 0x90], // addr of step status
			[0x6e, 0x00, 0x00, 0xa8, 0x6f, 0x00, 0x00, 0xa8, 0x70, 0x00, 0x00, 0xa8] // addr of wait time
		];
		const addrDw = [0x1f, 0x00, 0x00, 0xa8];
		addrW = flatten(addrW); // 平整化陣列
		// const addrW = addrW1.concat(addrW2, addrW3, addrW4, addrW5, addrW6); // concat addr of word type

		const nb = [addrW.length / 4, addrDw.length / 4]; // word length, dbword length // length of else, length of vacuum

		const l = 2 + cmd.length + nb.length + addrW.length + addrDw.length; // 2 + 4 + 2 + 15 * 4 + 1 * 4
		const leng = [l & 0xff, (l & 0xff00) >> 8];

		// 副標頭(2 bytes) + 網路編號(1 byte) + PC 編號(1 byte) + 請求目標模組IO編號(2 bytes) + 請求資料長度(2 bytes) + 監視計時器(2 bytes)
		const head = [0x50, 0x00, 0x00, 0xff, 0xff, 0x03, 0x00, leng[0], leng[1], 0x01, 0x00];

		const buf = head.concat(cmd, nb, addrW, addrDw); // 合併陣列
		console.log(buf);
		// tcpClient.write(Buffer.from(buf));
		tcpClient.write(Buffer.from(buf));
		///
		// doErrorCatch();
	} else {
		tcpClient.samplingState = false; // set sample state off
		clearInterval(tcpClient.sampler as NodeJS.Timer);
		tcpClient.sampler = undefined;
		// 無法連線，改變取樣狀態
		e.sender.send('sample-change', { sampling: false });
	}
};

/**開始取樣 */
const startSample = function(e: IpcMainInvokeEvent) {
	tcpClient.samplingState = true;
	tcpClient.sampler = setInterval(() => doSample(e), tcpClient.interval as number);
	doSample(e);
};

const doErrorCatch = function() {
	if (tcpClient.writable) {
		//
		const cmd = [0x01, 0x04, 0x00, 0x00];
		const addr = [0xbc, 0x02, 0x00, 0x90, 0x04, 0x00]; // M700 ~ M759 60 bits <= 16 * 4

		const l = 2 + cmd.length + addr.length;
		const leng = [l & 0xff, (l & 0xff) >> 8];

		const head = [0x50, 0x00, 0x00, 0xff, 0xff, 0x03, 0x00, leng[0], leng[1], 0x01, 0x00];

		const buf = head.concat(cmd, addr);
		console.log(buf);
		//
		tcpClient.write(Buffer.from(buf));
	} else {
		// do nothing
	}
};

// 處理取樣命令
ipcMain.handle('sampling', (e, args) => {
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
	return { sampling: sampling };
});

ipcMain.handle('alarm-res', () => {
	log.info('handle alarm response');
	console.log('handle alarm response');
	if (tcpClient && tcpClient.writable) {
		// 報警應答
		const arrW = [0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x01, 0x05, 0x00, 0x01, 0xff, 0x00];
		tcpClient.write(Buffer.from(arrW));

		// 等待 1500 ms
		setTimeout(() => {
			// 關閉應答
			const arrW = [0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x01, 0x05, 0x00, 0x01, 0x00, 0x00];
			tcpClient.write(Buffer.from(arrW));
		}, 1500);

		/**以下 test */
		// const arrW = [
		// 	0x50,
		// 	0x00,
		// 	0x00,
		// 	0xff,
		// 	0xff,
		// 	0x03,
		// 	0x00,
		// 	0x0c,
		// 	0x00,
		// 	0x10,
		// 	0x00,
		// 	0x01,
		// 	0x04,
		// 	0x00,
		// 	0x00,
		// 	0x33,
		// 	0x01,
		// 	0x00,
		// 	0xa8,
		// 	0x02,
		// 	0x00
		// ]; // 讀上部溫度 (D307)
		// tcpClient.write(Buffer.from(arrW));
		return { response: true, reset: false };
	} else {
		return { error: 'Hiper furnace is not connected' };
	}
});

ipcMain.handle('alarm-rst', () => {
	log.info('handle alarm reset');
	if (tcpClient && tcpClient.writable) {
		// 報警重置
		const arrW = [0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x01, 0x05, 0x00, 0x02, 0xff, 0x00];
		tcpClient.write(Buffer.from(arrW));

		setTimeout(() => {
			// 關閉報警重置
			const arrW = [0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x01, 0x05, 0x00, 0x02, 0x00, 0x00];
			tcpClient.write(Buffer.from(arrW));
		}, 1500);
		return { response: false, reset: true };
	} else {
		return { error: 'Hiper furnace is not connected' };
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
			e.sender.send('notifyRes', { error: true, code: err.code, message: err.message });
		});
});

// Number.prototype.toHex = function() {
// 	return this.toString(16).padStart(2, '0');
// };

export { tcpClient as vtechClient };
