import PromiseWorker from 'promise-worker';
import HiperWorker from 'worker-loader!./hiper/';

// const promiseWorker = new PromiseWorker(worker);
const worker = new HiperWorker();
const hiperPromiseWorker = new PromiseWorker(worker);

// leave for example
// const send = (msg: string) => {
// 	return promiseWorker.postMessage({
// 		type: 'message',
// 		message: msg
// 	});
// };

// // const analyzeCSV = async (file: File) => {
const analyzeCSV = (data: string) => {
	return hiperPromiseWorker.postMessage({
		type: 'csv',
		data: data
	});
};

export default { analyzeCSV };
