import net from 'net';
import { ipcMain } from 'electron';
import { CronJob } from 'cron';
import { drop } from 'lodash';
import moment from 'moment';
// import { mainWin } from '../background';

/**宣告 client */
let tcpClient: net.Socket;

import workName from '../json/workNowName.json';
import workState from '../json/workNowState.json';
import { Socket } from 'dgram';

const furnace = {};

ipcMain.on('data', (e, args) => {
	console.log(args);
	e.sender.send('reply', 'this is a reply msg');
});

/**connect 要求 */
ipcMain.handle('conn', async (e, args) => {
	const ip = args.ip;
	const port = args.port;
	const interval = args.interval;

	console.log(args);

	tcpClient = new net.Socket();
	Object.assign(tcpClient, furnace);

	tcpClient.furnace.cron = cronRecon;

	tcpClient.on('close', () => {
		console.log('Connection closed');

		tcpClient.removeAllListeners('data');
		tcpClient.furnace.connected = false;
		tcpClient.destroy();
		console.log(tcpClient.eventNames());
	});

	tcpClient.connect({ host: ip, port: port, family: 4 });

	const promise = await new Promise(resolve => {
		tcpClient.on('connect', () => {
			console.log(`Connect to ${ip}:${port}`);
			Object.assign(tcpClient.furnace, {
				//
			});

			// response connection successful
			e.sender.send('conn-success', { connected: true, remoteIP: ip, remotePort: port });

			//
			// WsServer
			//

			// if (tcpClient.furnace.onSample) {
			//
			// }
		});
	});
});
