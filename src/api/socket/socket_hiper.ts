/* eslint-disable @typescript-eslint/no-use-before-define */

// import net from 'net';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { CronJob } from 'cron';
import { drop } from 'lodash';
import { getLogger } from 'log4js';

// 主視窗 webContents

// 設備工序狀態 & 工序名稱
import stepName from '@/json/hiper/stepName.json';
import stepState from '@/json/hiper/stepState.json';
import { R30028, R30030, R30032 } from '@/json/hiper/errros';

// 自定義引入
import {
	EsocketHiperHandle,
	EsocketHiperSend,
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
const log = getLogger('hiper');

/**宣告 client */
let tcpClient: FSocket;

/**搬移至cron.ts */
// log.info('Start daily notification of Hiper furnace');
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
// );

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

/**處理連線要求 */
ipcMain.handle(EsocketHiperHandle.CONNECT, async (e, args) => {
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
			tcpClient.connected = true;
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
			e.sender.send(EsocketHiperSend.CONNECTIONSUCCESS, { connected: true, remoteIP: ip, remotePort: port });
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
					e.sender.send(EsocketHiperSend.SAMPLINGCHANGED, { sampling: true });
				}
			}

			tcpClient.on('data', str => {
				const strArr = Array.from(str);
				console.log(strArr);
				// 回報結構
				// [0x00, 0x00, 0x00, 0x00, 0x00, 0x47] => header
				// [0x01, 0x04, 0x44] => slave, fnCode, length
				// [0x17, 0x70, 0x17, 0x70, 0x17, 0x70] => 設定溫度, 上部溫度, 下部溫度
				// [0x00, 0x30, 0x82, 0x55, 0x00, 0x07] => 爐內壓力, 爐內真空(32bits)
				// [0x01, 0x25, 0x02, 0x26] => 流量計(0.1), 步剩餘時間()
				// [0x00, 0x00, 0x45, 0x48, 0x32, 0x59, 0x20, 0x20, ...] => 工藝段名
				// [0x00, 0x11, 0x00, 0x00, 0x00, 0x00] => 工藝狀態, 等待時間(32bits)
				// [0x00, 0x00, 0x00, 0x00, ... x4] => 報警狀態
				// [0x00, 0x0E] => 工藝名稱

				if (strArr[7] == 5) return; // 寫線圈回傳，可以直接忽略

				// 有回應，清除Timeout notify
				clearTimeout(tcpClient.samplingTimeoutTimer as NodeJS.Timeout);

				const arr = drop(strArr, 9); // 移除多餘 header
				tcpClient.stepName = stepName[arr[67]];
				tcpClient.stepState = stepState[arr[49]];

				// 報警狀態
				if (arr[49] !== 0 && arr[49] <= 5) {
					// 先確認是否在冷卻
					if (!tcpClient.coolState) {
						// 若不在冷卻中

						// // // 處理錯誤 // // //
						let errMsg1 = '';
						let errMsg2 = '';
						let errMsg3 = '';
						const err1 = arr[55] + (arr[56] << 8) + (arr[57] << 16) + (arr[58] << 24); // 報警 1 // 30028
						const err2 = arr[59] + (arr[60] << 8) + (arr[61] << 16) + (arr[62] << 24); // 報警 2 // 30030
						const err3 = arr[63] + (arr[64] << 8) + (arr[65] << 16) + (arr[66] << 24); // 報警 3 // 30032
						for (let bit = 0; bit < 32; bit++) {
							if (Number.isInteger(err1) && err1 > 0)
								if (((err1 >> bit) & 0b1) === 0b1) {
									errMsg1 += `\n${R30028[bit]}`;
								}
							if (Number.isInteger(err2) && err2 > 0) {
								if (((err2 >> bit) & 0b1) === 0b1) {
									errMsg2 += `\n${R30030[bit]}`;
								}
							}
							if (Number.isInteger(err3) && err3 > 0) {
								if (((err3 >> bit) & 0b1) === 0b1) {
									errMsg3 += `\n${R30032[bit]}`;
								}
							}
						}

						// 合併訊息 + 錯誤(如果有)
						const msg =
							'\n伺服器狀態: 正常' +
							'\n\n『 恆普 』' +
							`\n工藝狀態: ${tcpClient.stepState}` +
							`\n工藝名稱: ${tcpClient.stepName}` +
							'\n警告: 報警產生' +
							(errMsg1 != '' ? errMsg1 : '') +
							(errMsg2 != '' ? errMsg2 : '') +
							(errMsg3 != '' ? errMsg3 : '');

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

						tcpClient.coolState = true;
						tcpClient.coolTimer = setTimeout(() => {
							// 等待 15 分鐘
							tcpClient.coolState = false;
						}, 15 * 60 * 1000);
					}

					// 回傳 renderer， 有報警
					e.sender.send(EsocketHiperSend.SERIAL, { serial: strArr, alarm: true });

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
					// Clear cooldown state
					// tcpClient.coolState = false;
					// // CLear cooldown timer
					// clearTimeout(tcpClient.coolTimer as NodeJS.Timeout);

					// 回傳 renderer
					e.sender.send(EsocketHiperSend.SERIAL, { serial: strArr, alarm: false });

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
			log.warn(`${err.name}: ${err.message}`);

			clearTimeout(connTimeout); // 清除連線逾時

			// const { code } = err as NodeJS.ErrnoException;
			// 回傳
			switch (err.code) {
				case 'ECONNREFUSED': // 有IP, port沒開
				case 'ETIMEDOUT': // 沒IP
					// send to renderer
					e.sender.send(EsocketHiperSend.CONNECTIONERROR, {
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
					e.sender.send(EsocketHiperSend.CONNECTIONERROR, {
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
						message(`\n伺服器狀態: 正常\n\n『 恆普 』\n警告: 燒結爐連線中斷\nCode: ${err.code}`)
							.then(res => {
								e.sender.send('notifyRes', res.data);
								// 連線中斷，紀錄LOG
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
							// trigger tick function immediately
							if (tcpClient.cron) tcpClient.cron.fireOnTick();
						}, 5000);
					}
					tcpClient.destroy(); // 確保沒有資料傳輸且關閉連線
					//
					break;
				default:
					console.log('4');
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
ipcMain.handle(EsocketHiperHandle.DISCONNECT, async () => {
	// 手動斷線
	tcpClient.handleDisc = true;
	// 若 cron 執行中，則停止
	if (tcpClient.cron?.running) tcpClient.cron.stop();

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

// 處理變更重連請求
ipcMain.handle(EsocketHiperHandle.ALTERRECONNECT, (e, args) => {
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
				message(`\n伺服器狀態: 正常\n\n『 恆普 』\n警告: 燒結爐無回應`)
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
				clearInterval(tcpClient.sampler as NodeJS.Timer);
				tcpClient.sampler = undefined;
			}
		}, (tcpClient.interval as number) * 0.5);

		// const buf = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x01, 0x04, 0x00, 0x00, 0x00, 0x22]);

		const slave = [0x01]; // addr of slave
		const fnCode = [0x04]; // function code
		const addr = [0x00, 0x00, 0x00, 0x22]; // addr of start register & data length
		const cmd = slave.concat(fnCode, addr); // concat above for calculate length

		const head = [0x00, 0x00, 0x00, 0x00, 0x00, cmd.length];

		const buf = head.concat(cmd);
		tcpClient.write(Buffer.from(buf));
	} else {
		tcpClient.samplingState = false; // set sample state off
		clearInterval(tcpClient.sampler as NodeJS.Timer);
		tcpClient.sampler = undefined;
		// 無法連線，改變取樣狀態
		e.sender.send(EsocketHiperSend.SAMPLINGCHANGED, { sampling: false });
	}
};

/**開始取樣 */
const startSample = function(e: IpcMainInvokeEvent) {
	tcpClient.samplingState = true;
	tcpClient.sampler = setInterval(() => doSample(e), tcpClient.interval as number);
	doSample(e);
};

// 處理取樣命令
ipcMain.handle(EsocketHiperHandle.SAMPLE, (e, args) => {
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

/**處理警報回應命令 */
ipcMain.handle(EsocketHiperHandle.ALARMRES, () => {
	log.info('Manual response alarm');
	if (tcpClient && tcpClient.writable) {
		// 報警應答
		const slave = [0x01]; // addr of slave
		const fnCode = [0x05]; // function code // write coil
		const addr = [0x00, 0x01]; // addr of start register
		const data = [0xff, 0x00]; // data
		const cmd = slave.concat(fnCode, addr, data);

		const head = [0x00, 0x00, 0x00, 0x00, 0x00, cmd.length];

		const buf = head.concat(cmd);
		// const arrW = [0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x01, 0x05, 0x00, 0x01, 0xff, 0x00];
		tcpClient.write(Buffer.from(buf));
		// 等待 1500 ms
		setTimeout(() => {
			// 關閉應答
			const data2 = [0x00, 0x00];
			const cmd2 = slave.concat(fnCode, addr, data2);

			const buf2 = head.concat(cmd2);
			// const arrW = [0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x01, 0x05, 0x00, 0x01, 0x00, 0x00];
			tcpClient.write(Buffer.from(buf2));
		}, 1500);
		return { response: true, reset: false };
	} else {
		return { error: 'Hiper furnace is not connected' };
	}
});

/**處理警報重置命令 */
ipcMain.handle(EsocketHiperHandle.ALARMRST, () => {
	log.info('Manual reset alarm');
	if (tcpClient && tcpClient.writable) {
		// 報警重置
		const slave = [0x01]; // addr of slave
		const fnCode = [0x05]; // function code // write coil
		const addr = [0x00, 0x02]; // addr of start register
		const data = [0xff, 0x00]; // data
		const cmd = slave.concat(fnCode, addr, data);

		const head = [0x00, 0x00, 0x00, 0x00, 0x00, cmd.length];

		const buf = head.concat(cmd);
		// const arrW = [0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x01, 0x05, 0x00, 0x02, 0xff, 0x00];
		tcpClient.write(Buffer.from(buf));

		setTimeout(() => {
			// 關閉報警重置
			const data2 = [0x00, 0x00];
			const cmd2 = slave.concat(fnCode, addr, data2);

			const buf2 = head.concat(cmd2);
			// const arrW = [0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x01, 0x05, 0x00, 0x02, 0x00, 0x00];
			tcpClient.write(Buffer.from(buf2));
		}, 1500);
		return { response: false, reset: true };
	} else {
		return { error: 'Hiper furnace is not connected' };
	}
});

// Number.prototype.toHex = function() {
// 	return this.toString(16).padStart(2, '0');
// };

export { tcpClient as hiperClient };
