const net = require('net');

const listener = net.createServer();

listener.listen(3000, () => {
	console.log('server start');
});

listener.on('connection', socket => {
	console.log('connected');

	socket.on('data', data => {
		console.log(data);
	});

	socket.on('close', () => {
		console.log('socket disconnected');
	});
});

listener.on('close', () => {
	console.log('server closed');
});
