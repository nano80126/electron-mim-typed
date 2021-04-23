/* eslint-disable @typescript-eslint/no-use-before-define */

// import net from 'net';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { CronJob } from 'cron';
import { drop, flatten } from 'lodash';
import { getLogger } from 'log4js';

// 主視窗 webContents

// 設備工序狀態 & 工序名稱
import stepName from '@/json/vtech/stepName.json';
import stepState from '@/json/vtech/stepState.json';
import { M700, M732 } from '@/json/vtech/errros';

// 自定義引入
import {
	EsocketVtechHandle,
	EsocketVtechSend,
	EwsChannel,
	EwsFurnaceType,
	FSocket,
	IwsConnectedMessasge,
	IwsSerialMessage
} from '@/types/main';
import { message } from '@/api/line';
import { wsServer } from '@/api/express';
// import {  clearInterval } from 'timers';

//
// 配置 log
//
// const appPath = app.getAppPath();
const log = getLogger('vtech');

/**宣告 client */
let tcpClient: FSocket;

/**搬移至cron.ts */
// log.info('Start daily notification of Vtech furnace');
// new CronJob(
// 	'0 30 17,22 * * 0-6',
// 	() => {
// 		let msg = `\n現在時間: ${moment().format('MM/DD HH:mm:ss')}\n伺服器狀態: 正常`;

// 		if (tcpClient && tcpClient.connected) {
// 			msg += `\n工藝狀態: ${tcpClient.stepState} \n工藝名稱: ${tcpClient.stepName}`;
// 		} else {
// 			msg += '\n燒結爐狀態: 未連線';
// 		}

// 		message(msg)
// 			.then(res => {
// 				// mainWin.send
// 				mainWin?.send('notifyRes', res.data);
// 				log.info('Daily notification');
// 			})
// 			.catch(err => {
// 				// mainWin.send
// 				mainWin?.send('notifyRes', {
// 					error: true,
// 					code: err.code,
// 					message: err.message
// 				});
// 				// append to log
// 				log.warn(`${err.code} ${err.message}`);
// 			});
// 	},
// 	null,
// 	true
// // );

/**待刪 */
// ipcMain.on('data', (e, args) => {
// 	console.log(args);
// 	e.sender.send('reply', 'this is a reply msg');
// });

/**reconnect at each 5 minutes if disconnect */
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
				log.warn(`${err.message}, code: ${err.code}`);
			}
		}
	},
	null,
	false
);

/**connect 要求 */
ipcMain.handle(EsocketVtechHandle.CONNECT, async (e, args) => {
	const ip = args.ip as string;
	const port = args.port as number;
	const interval = args.interval as number;
	const reconnect = args.reconnect as boolean;

	tcpClient = new FSocket();
	// Object.assign(tcpClient, furnace);

	// 初始化
	tcpClient.handleDisc = false;
	tcpClient.connected = false;
	tcpClient.reconnect = reconnect;
	tcpClient.ip = ip;
	tcpClient.port = port;
	tcpClient.interval = interval;
	tcpClient.cron = cronReconn;

	tcpClient.on('close', () => {
		console.log('Connection closed');
		//
		tcpClient.removeAllListeners('data');
		tcpClient.connected = false;
		tcpClient.destroy();
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
			log.info(`Connect to Furnace(${ip}:${port})`);

			clearTimeout(connTimeout); // 清除連線逾時
			// Object.assign(tcpClient.furnace, {
			// 	//
			// });
			// // // // 新增 // 多餘待刪
			// tcpClient.handleDisc = false;
			tcpClient.connected = true; // 設定已連線
			// tcpClient.reconnect = reconnect;
			// tcpClient.ip = ip;
			// tcpClient.port = port;
			// tcpClient.interval = interval;
			//

			// // // // If cron is running, stop it.
			if (tcpClient.cron && tcpClient.cron.running) {
				tcpClient.cron.stop();
			}
			//

			// response connection successful
			e.sender.send(EsocketVtechSend.CONNECTIONSUCCESS, { connected: true, remoteIP: ip, remotePort: port });
			// 廣播 clients 燒結爐已連線
			wsServer.clients.forEach(client => {
				const msg: IwsConnectedMessasge = {
					channel: EwsChannel.CONNECT,
					furnace: EwsFurnaceType.VTECH,
					connected: true
				};
				client.send(JSON.stringify(msg));
			});

			// 已設定 OnSample
			if (tcpClient.onSample) {
				// 取樣器不存在
				if (!tcpClient.sampler) {
					startSample(e);
					e.sender.send(EsocketVtechSend.SAMPLINGCHANGED, { sampling: true });
				}
			}

			tcpClient.on('data', str => {
				const strArr = Array.from(str);
				console.log(strArr);
				// 回報結構
				// [0xD0, 0x00, 0x00, 0xff, 0xff, 0x03, 0x00, 0x00] => 副標頭, 網路編號, PC編號, IO編號, ...
				// [0x2A, 0x00, 0x00, 0x00] => 資料長度, 錯誤碼
				// [0x00, 0x00, 0x18, 0x00, 0x24, 0x00, 0x19, 0x00] => 設定溫度, 上部溫度, 中部溫度, 下部溫度
				// [0xff, 0xff, 0xfe, 0xff, 0x00, 0x00, 0x00, 0x00] => 爐內壓力, 管道壓力, 氮氣流量, 氬氣流量
				// [] => 剩餘時間, 工藝名稱, 工藝狀態
				// [] => 爐內真空(32bits)
				// [] => 報警 1(32bits), 報警 2(32bits), 報警 3(32bits)

				// 寫coil回傳
				// if (strArr[7] == 5) {
				// 	// 寫線圈回傳
				// 	console.log('Response of writing coil: ', strArr);
				// 	return;
				// }

				// 有回應，清除Timeout notify
				clearTimeout(tcpClient.samplingTimeoutTimer as NodeJS.Timeout);

				const arr = drop(strArr, 11);
				tcpClient.stepName = stepName[arr[18] + (arr[19] << 8)];
				tcpClient.stepState = stepState[arr[20]];

				// console.log(tcpClient.stepName);
				// console.log(tcpClient.stepState);

				let errMsg1 = '';
				let errMsg2 = '';
				const err1 = arr[32] + (arr[33] << 8) + (arr[34] << 16) + (arr[35] << 24); // 報警 1 // M700
				const err2 = arr[36] + (arr[37] << 8) + (arr[38] << 16) + (arr[39] << 24); // 報警 2 // M7XX

				for (let bit = 0; bit < 32; bit++) {
					if (Number.isInteger(err1) && err1 > 0)
						if (((err1 >> bit) & 0b1) === 0b1) {
							errMsg1 += `\n${M700[bit]}`;
						}
					if (Number.isInteger(err2) && err2 > 0)
						if (((err1 >> bit) & 0b1) === 0b1) {
							errMsg2 += `\n${M732[bit]}`;
						}
				}

				// 報警狀態
				// err 為整數且大於 0
				if (errMsg1 !== '' || errMsg2 !== '') {
					// 先確認是否在冷卻
					if (!tcpClient.coolState) {
						// 若不在冷卻中
						if (tcpClient.stepState == '自動狀態') {
							// 若為自動狀態，才通知
							const msg =
								'\n伺服器狀態: 正常' +
								'\n\n『 宏倫 』' +
								`\n工藝狀態: ${tcpClient.stepState}` +
								`\n工藝名稱: ${tcpClient.stepName}` +
								'\n警告: 報警產生' +
								(errMsg1 != '' ? errMsg1 : '') +
								(errMsg2 != '' ? errMsg2 : '');

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
									// 通知失敗，紀錄LOG
									log.error(`${err.messaage}, code: ${err.code}`);
								});
						}

						tcpClient.coolState = true;
						tcpClient.coolTimer = setTimeout(() => {
							// 等待 15 分鐘
							tcpClient.coolState = false;
						}, 15 * 60 * 1000);
					}

					// 回傳 renderer， 有報警
					e.sender.send(EsocketVtechSend.SERIAL, { serial: strArr, alarm: true });

					// 廣播 web socket clients
					wsServer.clients.forEach(client => {
						const msg: IwsSerialMessage = {
							channel: EwsChannel.SERIAL,
							furnace: EwsFurnaceType.VTECH,
							serial: strArr,
							alarm: true
						};
						client.send(JSON.stringify(msg));
					});
				} else {
					// 正常狀態
					// Clear cooldown state
					// tcpClient.coolState = false;
					// // CLear cooldown timer
					// clearTimeout(tcpClient.coolTimer as NodeJS.Timeout);

					// 回傳 renderer
					e.sender.send(EsocketVtechSend.SERIAL, { serial: strArr, alarm: false });
					// 廣播 web socket clients
					wsServer.clients.forEach(client => {
						const msg: IwsSerialMessage = {
							channel: EwsChannel.SERIAL,
							furnace: EwsFurnaceType.VTECH,
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
			log.warn(`${err.name}: ${err.message}`);

			clearTimeout(connTimeout); // 清除連線逾時

			// const { code } = err as NodeJS.ErrnoException;
			// 回傳
			switch (err.code) {
				case 'ECONNREFUSED': // 有IP, port沒開
				case 'ETIMEDOUT': // 沒IP
					// send to renderer
					e.sender.send(EsocketVtechSend.CONNECTIONERROR, {
						connected: false,
						error: { message: err.message, code: err.code }
					});

					// 啟動重連機制 (沒開機也可以啟動)
					if (tcpClient.cron && !tcpClient.cron.running) {
						tcpClient.cron.start();
					}

					tcpClient.destroy(); // 確保沒有資料傳輸且關閉連線
					break;
				case 'ECONNRESET': // 被斷線
					// send to renderer
					e.sender.send(EsocketVtechSend.CONNECTIONERROR, {
						connected: false,
						error: { message: err.message, code: err.code }
					});

					// 廣播被斷線
					wsServer.clients.forEach(client => {
						const msg: IwsConnectedMessasge = {
							channel: EwsChannel.CONNECT,
							furnace: EwsFurnaceType.VTECH,
							connected: false
						};
						client.send(JSON.stringify(msg));
					});

					if (!tcpClient.handleDisc) {
						// 發出訊息
						message(`\n伺服器狀態: 正常\n\n『 宏倫 』\n警告: 燒結爐連線中斷\nCode: ${err.code}`)
							.then(res => {
								e.sender.send('notifyRes', res.data);
								// 連線中斷，紀錄log
								log.warn(`Furnace disconnected, CODE: ${err.code}`);
							})
							.catch((err: NodeJS.ErrnoException) => {
								e.sender.send('notifyRes', {
									error: true,
									code: err.code,
									message: err.message
								});
								// 通知失敗，紀錄LOG
								log.error(`${err.message}, code: ${err.code}`);
							});

						// 啟動重連機制 (僅被斷線情況啟動)
						if (tcpClient.cron && !tcpClient.cron.running) {
							tcpClient.cron.start();
						}

						// 5 秒後重連
						// if (tcpClient.reconnect) {
						// 	setTimeout(() => {
						// 		try {
						// 			tcpClient.connect({ host: ip, port: port, family: 4 });
						// 		} catch (err) {
						// 			log.warn(`${err.message}, code: ${err.code}`);
						// 		}
						// 	}, 5000);
						// }
						setTimeout(() => {
							// trigger tick function immediatelly
							if (tcpClient.cron) tcpClient.cron.fireOnTick();
						}, 5000);
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
ipcMain.handle(EsocketVtechHandle.DISCONNECT, async () => {
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
			furnace: EwsFurnaceType.VTECH,
			connected: false
		};
		client.send(JSON.stringify(msg));
	});

	return promise;
});

ipcMain.handle(EsocketVtechHandle.ALTERRECONNECT, (e, args) => {
	const reconnect = args as boolean;
	if (tcpClient) {
		tcpClient.reconnect = reconnect;
		return tcpClient.reconnect;
	} else {
		// client 不存在，回傳 null
		return null;
	}
});

// 執行取樣
const doSample = function(e: IpcMainInvokeEvent) {
	if (tcpClient.writable) {
		//
		tcpClient.samplingTimeoutTimer = setTimeout(() => {
			tcpClient.samplingTimeoutCount++;

			if (tcpClient.samplingTimeoutCount >= 3) {
				message(`\n伺服器狀態: 正常\n\n『 宏倫 』\n警告: 燒結爐無回應`)
					.then(res => {
						e.sender.send('notifyRes', res.data);
						log.warn('Furnace no response');
					})
					.catch(err => {
						e.sender.send('notifyRes', {
							error: true,
							code: err.code,
							message: err.message,
							errno: err.errno
						});
						// 通知失敗，紀錄LOG
						log.error(`${err.message}, code: ${err.code}`);
					});

				tcpClient.samplingTimeoutCount = 0;
				clearInterval(tcpClient.sampler as NodeJS.Timer); // 停止取樣sampler
				tcpClient.sampler = undefined; // 刪除取樣sampler
				// 取樣三次無回應，改變取樣狀態
				e.sender.send(EsocketVtechSend.SAMPLINGCHANGED, { sampling: false });
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
		const addrDw = [0x1f, 0x00, 0x00, 0xa8, 0xbc, 0x02, 0x00, 0x90, 0xdc, 0x02, 0x00, 0x90]; // addr of vacuum
		addrW = flatten(addrW); // 平整化陣列
		// const addrW = addrW1.concat(addrW2, addrW3, addrW4, addrW5, addrW6); // concat addr of word type

		const nb = [addrW.length / 4, addrDw.length / 4]; // word length, dbword length // length of else, length of vacuum

		const l = 2 + cmd.length + nb.length + addrW.length + addrDw.length; // 2 + 4 + 2 + 15 * 4 + 1 * 4
		const leng = [l & 0xff, (l & 0xff00) >> 8];

		// 副標頭(2 bytes) + 網路編號(1 byte) + PC 編號(1 byte) + 請求目標模組IO編號(2 bytes) + 請求資料長度(2 bytes) + 監視計時器(2 bytes)
		const head = [0x50, 0x00, 0x00, 0xff, 0xff, 0x03, 0x00, leng[0], leng[1], 0x01, 0x00];

		const buf = head.concat(cmd, nb, addrW, addrDw); // 合併陣列
		// tcpClient.write(Buffer.from(buf));
		tcpClient.write(Buffer.from(buf));
	} else {
		tcpClient.samplingState = false; // set sample state off
		clearInterval(tcpClient.sampler as NodeJS.Timer); // 停止取樣sampler
		tcpClient.sampler = undefined; // 停止取樣sampler
		// 無法連線，改變取樣狀態
		e.sender.send(EsocketVtechSend.SAMPLINGCHANGED, { sampling: false });
	}
};

/**開始取樣 */
const startSample = function(e: IpcMainInvokeEvent) {
	tcpClient.samplingState = true;
	tcpClient.sampler = setInterval(() => doSample(e), tcpClient.interval as number);
	doSample(e);
};

/**保留，待刪除 */
// const doErrorCatch = function() {
// 	if (tcpClient.writable) {
// 		//
// 		const cmd = [0x01, 0x04, 0x00, 0x00];
// 		const addr = [0xbc, 0x02, 0x00, 0x90, 0x04, 0x00]; // M700 ~ M759 60 bits <= 16 * 4

// 		const l = 2 + cmd.length + addr.length;
// 		const leng = [l & 0xff, (l & 0xff) >> 8];

// 		const head = [0x50, 0x00, 0x00, 0xff, 0xff, 0x03, 0x00, leng[0], leng[1], 0x01, 0x00];

// 		const buf = head.concat(cmd, addr);
// 		console.log(buf);
// 		//
// 		tcpClient.write(Buffer.from(buf));
// 	} else {
// 		// do nothing
// 	}
// };

// 處理取樣命令
ipcMain.handle(EsocketVtechHandle.SAMPLE, (e, args) => {
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
			tcpClient.sampler = undefined; // 刪除取樣sampler
		}
	}
	return { sampling: sampling };
});

/**處理警報回應命令 */
ipcMain.handle(EsocketVtechHandle.ALARMRES, () => {
	log.info('Manual response alarm');
	if (tcpClient && tcpClient.writable) {
		// 報警應答
		// const arrW = [0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x01, 0x05, 0x00, 0x01, 0xff, 0x00];
		// tcpClient.write(Buffer.from(arrW));

		// // 等待 1500 ms
		// setTimeout(() => {
		// 	// 關閉應答
		// 	const arrW = [0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x01, 0x05, 0x00, 0x01, 0x00, 0x00];
		// 	tcpClient.write(Buffer.from(arrW));
		// }, 1500);

		// tcpClient.write(Buffer.from(arrW));
		return { response: true, reset: false };
	} else {
		return { error: 'Vtech furnace is not connected' };
	}
});

/**處理警報重置命令 */
ipcMain.handle(EsocketVtechHandle.ALARMRST, () => {
	log.info('Manual reset alarm');
	if (tcpClient && tcpClient.writable) {
		// const arrW = [0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x01, 0x05, 0x00, 0x02, 0xff, 0x00];
		// tcpClient.write(Buffer.from(arrW));

		// setTimeout(() => {
		// 	// 關閉報警重置
		// 	const arrW = [0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x01, 0x05, 0x00, 0x02, 0x00, 0x00];
		// 	tcpClient.write(Buffer.from(arrW));
		// }, 1500);

		// 報警重置 // 待測試
		const cmd = [0x01, 0x14, 0x01, 0x00]; // cmd, subcmd
		const addr = [0x09, 0x00, 0x00, 0x90, 0x01, 0x00, 0x1]; // addr, device code, nb, data

		const l = 2 + cmd.length + addr.length;
		const leng = [l & 0xff, (l & 0xff00) >> 8];

		// 副標頭(2 bytes) + 網路編號(1 byte) + PC 編號(1 byte) + 請求目標模組IO編號(2 bytes) + 請求資料長度(2 bytes) + 監視計時器(2 bytes)
		const head = [0x50, 0x00, 0x00, 0xff, 0xff, 0x03, 0x00, leng[0], leng[1], 0x01, 0x00];

		const buf = head.concat(cmd, addr);
		tcpClient.write(Buffer.from(buf));

		setTimeout(() => {
			const addr2 = [0x09, 0x00, 0x00, 0x90, 0x01, 0x00, 0x0]; // addr, device code, nb, data

			const buf2 = head.concat(cmd, addr2);
			tcpClient.write(Buffer.from(buf2));
		}, 1500);
		return { response: false, reset: true };
	} else {
		return { error: 'Vtech furnace is not connected' };
	}
});

// Number.prototype.toHex = function() {
// 	return this.toString(16).padStart(2, '0');
// };

export { tcpClient as vtechClient };
