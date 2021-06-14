import express from 'express';
import webSocket from 'ws';
import path from 'path';
import crypto from 'crypto';
import { getLogger } from 'log4js';

import { hiperClient } from '@/api/socket/socket_hiper';
import { vtechClient } from '@/api/socket/socket_vtech';
// import { app as electron } from 'electron';

import {
	EwsChannel,
	EwsCommand,
	EwsFurnaceType,
	IwsCommandMessage,
	IwsCommandResMessage,
	IwsConnectedMessasge,
	IwsOpenMessage
} from '@/types';
import { ipcMain } from 'electron';

const appLog = getLogger('app');
const hiperLog = getLogger('hiper');
const vtechLog = getLogger('vtech');

const app = express();
const router = express.Router();

// import crypto from crypto
const port = ((process.env.VUE_APP_PORT as unknown) as number) || 4000;

const { NODE_ENV } = process.env;
const frontPath = NODE_ENV == 'development' ? path.resolve(__dirname, '../dist') : path.resolve('../..', 'dist');

// console.log('frontPath', frontPath);
// log.info(frontPath);

app.use('/', router);
// externals js and css need this, in this project is iframe_api.js
app.use('/', express.static(frontPath));
// app.use('/electron/', express.static(__dirname));
// settings for cross-site
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
	// res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
	res.header('Access-Control-Allow-Methods', 'POST, GET');

	next();
});

router
	.get('/', (req, res) => {
		res.sendFile(path.resolve(frontPath, 'index.html'));
	})
	.get('/root', (req, res) => {
		res.send(frontPath);
	})
	.get('/:route', (req, res) => {
		console.log(req.params);

		// 重轉向首頁
		if (/.ico$/.test(req.params.route)) {
			res.sendStatus(404);
		} else {
			res.redirect(303, '/');
		}
	});

// router.get('/root', (req, res) => {
// 	res.send(frontPath);
// });

// router.get('/:route', (req, res) => {
// 	console.log(req.params);

// 	// 重轉向首頁
// 	if (/.ico$/.test(req.params.route)) {
// 		res.sendStatus(404);
// 	} else {
// 		res.redirect(303, '/');
// 	}
// });

/// /// ///
// router.get('/panel', (req, res) => {
// 	res.sendFile(path.resolve(frontPath, 'panel.html'));
// });

// router.get('*', (req, res) => {
// 	console.log(123);
// });

const server = app.listen(port, () => {
	console.log(`Http and WebSocket Server Started On Port ${port} :)`);
});

const wsServer = new webSocket.Server({ server });

let count = 0;
wsServer.on('connection', (socket, req) => {
	count++;
	console.log(`One client connected. Count: ${count}`);

	let ip = req.socket.remoteAddress;
	ip = ip?.replace(/^::ffff:/, '');

	appLog.info(`One client connected from IP address ${ip}`);

	// new client connect
	const helloMsg: IwsOpenMessage = {
		channel: EwsChannel.OPEN,
		text: 'Hello, new client',
		id: crypto.randomBytes(8).toString('hex') // Socket id, not used now
	};
	socket.send(JSON.stringify(helloMsg));

	// send to clients if hiper furnace is connceted
	const msg: IwsConnectedMessasge = {
		channel: EwsChannel.CONNECT,
		furnace: EwsFurnaceType.HIPER,
		connected: hiperClient ? hiperClient.connected : false
	};
	socket.send(JSON.stringify(msg));
	//

	// send to clients if vtech furnace is connected
	const msg2: IwsConnectedMessasge = {
		channel: EwsChannel.CONNECT,
		furnace: EwsFurnaceType.VTECH,
		connected: vtechClient ? vtechClient.connected : false
	};
	socket.send(JSON.stringify(msg2));

	socket.on('message', msg => {
		const data = JSON.parse(msg.toString()) as IwsCommandMessage;

		// channel = COMMAND;
		// furnace = hiper | vtech
		// commnad = response | reset

		if (data.channel == EwsChannel.COMMAND) {
			switch (data.command) {
				case EwsCommand.ALARMRESPONSE:
					//
					if (data.furnace == EwsFurnaceType.HIPER) {
						// HIPER 燒結爐
						if (hiperClient && hiperClient.connected) {
							const arr = [0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x01, 0x05, 0x00, 0x01, 0xff, 0x00];
							hiperClient.write(Buffer.from(arr));
							setTimeout(() => {
								// 關閉應答 // 等待 1.5 秒
								/// -- -- -- -- -- -- header -- -- -- -- //長度//機台//功能// start addr// data
								const arr = [0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x01, 0x05, 0x00, 0x01, 0x00, 0x00];
								hiperClient.write(Buffer.from(arr));
							}, 1500);
						} else {
							//
							const cmdRes: IwsCommandResMessage = {
								channel: EwsChannel.COMMANDRES,
								furnace: EwsFurnaceType.HIPER,
								text: 'HIPER furnace is not connected'
							};
							socket.send(JSON.stringify(cmdRes));
							hiperLog.warn('HIPER farnace is not connected');
						}
					} else if (data.furnace == EwsFurnaceType.VTECH) {
						// VTECH 燒結爐
						// vtech 不支援此功能
						const cmdRes: IwsCommandResMessage = {
							channel: EwsChannel.COMMANDRES,
							furnace: EwsFurnaceType.VTECH,
							text: 'This commnad of VTECH furance can not be supported'
						};
						socket.send(JSON.stringify(cmdRes));
						vtechLog.warn('This commnad of VTECH furance can not be supported');
					}
					break;
				case EwsCommand.ALARMRESET:
					//
					if (data.furnace == EwsFurnaceType.HIPER) {
						// HIPER 燒結爐
						if (hiperClient && hiperClient.connected) {
							const arr = [0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x01, 0x05, 0x00, 0x02, 0xff, 0x00];
							hiperClient.write(Buffer.from(arr));
							setTimeout(() => {
								// 關閉重置 // 等待 1.5 秒
								/// -- -- -- -- -- -- header -- -- -- -- //長度//機台//功能// start addr// data
								const arr = [0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x01, 0x05, 0x00, 0x02, 0x00, 0x00];
								hiperClient.write(Buffer.from(arr));
							}, 1500);
						} else {
							//
							const cmdRes: IwsCommandResMessage = {
								channel: EwsChannel.COMMANDRES,
								furnace: EwsFurnaceType.HIPER,
								text: 'HIPER furnace is not connected'
							};
							socket.send(JSON.stringify(cmdRes));
							hiperLog.warn('HIPER farnace is not connected');
						}
					} else if (data.furnace == EwsFurnaceType.VTECH) {
						// VTECH 燒結爐
						if (vtechClient && vtechClient.connected) {
							// const arr = [0x00];
							const cmd = [0x01, 0x14, 0x01, 0x00];
							const addr = [0x09, 0x00, 0x00, 0x90, 0x01, 0x00, 0x1];
							const l = 2 + cmd.length + addr.length;
							const leng = [l & 0xff, (l & 0xff00) >> 8];

							// 副標頭(2 bytes) + 網路編號(1 byte) + PC 編號(1 byte) + 請求目標模組IO編號(2 bytes) + 請求資料長度(2 bytes) + 監視計時器(2 bytes)
							const head = [0x50, 0x00, 0x00, 0xff, 0xff, 0x03, 0x00, leng[0], leng[1], 0x01, 0x00];

							const buf = head.concat(cmd, addr);
							vtechClient.write(Buffer.from(buf));
							setTimeout(() => {
								// 關閉重置 // 等待 1.5 秒
								const addr2 = [0x09, 0x00, 0x00, 0x90, 0x01, 0x00, 0x0];

								const buf2 = head.concat(cmd, addr2);
								vtechClient.write(Buffer.from(buf2));
							}, 1500);
						} else {
							//
							const cmdRes: IwsCommandResMessage = {
								channel: EwsChannel.COMMANDRES,
								furnace: EwsFurnaceType.VTECH,
								text: 'VTECH furnace is not connected'
							};
							socket.send(JSON.stringify(cmdRes));
							vtechLog.warn('VTECH furnace is not connected');
						}
					}
					break;
			}
		}
		console.log(data);
	});

	socket.on('close', code => {
		count--;
		console.log(`One client disconnected. Code: ${code}`);
	});
});

wsServer.on('error', err => {
	appLog.error(`ws server error occurred, ${err.message}`);
});

//
// Web socket 廣播事件
ipcMain.on('broadcast', (e, args) => {
	const { msg, color } = args;
	wsServer.clients.forEach(client => {
		client.send(JSON.stringify({ msg, color }));
	});
});

export { wsServer };
