import express from 'express';
import webSocket from 'ws';
import path from 'path';
import { getLogger } from 'log4js';

import { hiperClient } from './socket_hiper';
// import { app as electron } from 'electron';

const log = getLogger('app');

const app = express();
const router = express.Router();

// import crypto from crypto
const port = ((process.env.VUE_APP_PORT as unknown) as number) || 4000;

const { NODE_ENV } = process.env;
const frontPath = NODE_ENV == 'development' ? path.resolve(__dirname, '../dist') : path.resolve('../..', 'dist');

console.log('frontPath', frontPath);
log.info(frontPath);

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

/// /// ///
router.get('/panel', (req, res) => {
	res.sendFile(path.resolve(frontPath, 'panel.html'));
});

const server = app.listen(port, 'localhost', () => {
	console.log(`Http and WebSocket Server Started On Port ${port} :)`);
});

const wsServer = new webSocket.Server({ server });

let count = 0;
wsServer.on('connection', (socket, req) => {
	count++;
	console.log(`One client connected. Count: ${count}`);

	const ip = req.socket.remoteAddress;

	// new client connect
	socket.send(
		JSON.stringify({
			channel: 'open',
			text: 'Hello, new client'
		})
	);

	// furnace state
	socket.send(
		JSON.stringify({
			channel: 'furnaceConn',
			state: hiperClient ? hiperClient.connected : false
		})
	);

	socket.on('message', msg => {
		const data = JSON.parse(msg.toString());

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
