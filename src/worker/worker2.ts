import registerPromiseWorker from 'promise-worker/register';

registerPromiseWorker(msg => {
	if (msg.type === 'message') {
		msg.message = msg.message.toUpperCase();
		return msg;
	}
});
