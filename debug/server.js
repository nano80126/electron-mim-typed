/* eslint-disable @typescript-eslint/no-var-requires */
const net = require('net');

const port = 3000;
const port2 = 3001;

const listener = net.createServer();
const listener2 = net.createServer();

// listener.listen(3000, () => {
// 	console.log('Server start at port: 3000.');
// });

// listener
// 	.on('connection', socket => {
// 		console.log(`port ${port} has been connected`);

// 		socket.on('data', data => {
// 			console.log(Array.from(data));

// 			socket.write(Buffer.from([0x00, 0x01, 0x02]));
// 		});

// 		socket.on('error', e => {
// 			console.log(e);
// 		});

// 		socket.on('close', () => {
// 			console.log('socket disconnected');
// 		});
// 	})
// 	.on('close', () => {
// 		console.log('Server closed');
// 	})
// 	.listen(port, () => {
// 		console.log(`Server start at port: ${port}.`);
// 	});

listener2
	.on('connection', socket => {
		console.log(`port ${port2} has been connected`);

		socket.on('data', data => {
			console.log(Array.from(data));

			socket.write(Buffer.from([0x00, 0x01, 0x02]));
		});

		socket.on('error', e => {
			console.log(e);
		});

		socket.on('close', () => {
			console.log('socket disconnected');
		});
	})
	.on('close', () => {
		console.log('Server closed');
	})
	.listen(port2, () => {
		console.log(`Server start at port: ${port2}.`);
	});

// listener.on('close', () => {
// 	console.log('server closed');
// });

// listener2.lis
