import express from 'express';
import webSocket from 'ws';
import path from 'path';
import { getLogger } from 'log4js';

import { hiperClient } from './socket_hiper';
// import { app as electron } from 'electron';

import { EwsChannel, EwsCommand, EwsFurnaceType, IwsCommandMessage, IwsCommandResMessage } from '@/types/main-process';

const log = getLogger('app');
const hiperLog = getLogger('hiper');

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
// settings for cross-site
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
	// res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
	res.header('Access-Control-Allow-Methods', 'POST, GET');

	next();
});

router.get('/', (req, res) => {
	res.sendFile(path.resolve(frontPath, 'index.html'));
});

router.get('/root', (req, res) => {
	res.send(frontPath);
});

router.get('/:route', (req, res) => {
	console.log(req.params);

	// 重轉向首頁
	if (/.ico$/.test(req.params.route)) {
		res.sendStatus(404);
	} else {
		res.redirect(303, '/');
	}
});

/// /// ///
router.get('/panel', (req, res) => {
	res.sendFile(path.resolve(frontPath, 'panel.html'));
});

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

	log.info(`One client connected from IP address ${ip}`);

	// new client connect
	socket.send(JSON.stringify({ channel: EwsChannel.OPEN, text: 'Hello, new client' }));

	// furnace state
	socket.send(JSON.stringify({ channel: EwsChannel.CONNECT, state: hiperClient ? hiperClient.connected : false }));

	socket.on('message', msg => {
		const data = JSON.parse(msg.toString()) as IwsCommandMessage;

		// channel = COMMAND;
		// furnace = hiper | vtech
		// commnad = response | reset

		if (data.channel == EwsChannel.COMMAND) {
			switch (data.command) {
				case EwsCommand.ALARMRESPONSE:
					//
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
							text: 'Hiper furnace is not connected'
						};
						socket.send(JSON.stringify(cmdRes));
						hiperLog.warn('Hiper farnace is not connected');
					}
					break;
				case EwsCommand.ALARMRESET:
					if (hiperClient && hiperClient.connected) {
						const arr = [0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x01, 0x05, 0x00, 0x02, 0xff, 0x00];
						hiperClient.write(Buffer.from(arr));
						setTimeout(() => {
							// 關閉應答 // 等待 1.5 秒
							/// -- -- -- -- -- -- header -- -- -- -- //長度//機台//功能// start addr// data
							const arr = [0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x01, 0x05, 0x00, 0x02, 0x00, 0x00];
							hiperClient.write(Buffer.from(arr));
						}, 1500);
					} else {
						//
						const cmdRes: IwsCommandResMessage = {
							channel: EwsChannel.COMMANDRES,
							furnace: EwsFurnaceType.HIPER,
							text: 'Hiper furnace is not connected'
						};
						socket.send(JSON.stringify(cmdRes));
						hiperLog.warn('Hiper farnace is not connected');
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
	log.error(`ws server error occurred, ${err.message}`);
});

//
// ws server 廣播事件?
//

export { wsServer };
