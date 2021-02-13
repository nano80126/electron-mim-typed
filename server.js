const net = require('net');

const listener = net.createServer();

listener.listen(3000, () => {
	console.log('Server start at port: 3000.');
});

listener.on('connection', socket => {
	console.log('connected');

	socket.on('data', data => {
		console.log(data);

		socket.write(Buffer.from([0x00, 0x01, 0x02]));
	});

	socket.on('error', e => {
		console.log(e);
	});

	socket.on('close', () => {
		console.log('socket disconnected');
	});
});

listener.on('close', () => {
	console.log('server closed');
});
