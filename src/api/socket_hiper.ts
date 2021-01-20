import net from 'net';
import { ipcMain } from 'electron';
import { CronJob } from 'cron';
import { drop } from 'lodash';
import moment from 'moment';
// import { setTimeout, setInterval, clearTimeout, clearInterval } from 'timers';

// import { mainWin } from '../background';

import stepName from '../json/stepName.json';
import stepState from '../json/stepState.json';
import { FSocket } from '@/types/main-process';
import { stringify } from 'qs';
import { message } from './line';
import { DH_CHECK_P_NOT_SAFE_PRIME } from 'constants';

/**宣告 client */
let tcpClient: FSocket = new FSocket();

const furnace = {};

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
		tcpClient.on('error', (err: Error) => {
			console.log(`${err.name} ${err.message}`);

			const { code } = err as NodeJS.ErrnoException;
			// 回傳
			switch (code) {
				case 'ECONNREFUSED':
				case 'ETIMEOUT':
					//
					break;
				case 'ECONNRESET':
					//
					break;
				default:
					console.error(`${code} ${err}`);
					break;
			}
		});
	});
});
