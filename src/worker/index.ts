import PromiseWorker from 'promise-worker';
import PromiseWorker2 from 'promise-worker';
import HiperWorker from 'worker-loader!./hiper/';
import VtechWorker from 'worker-loader!./vtech/';

// const promiseWorker = new PromiseWorker(worker);

const hiperWorker = new HiperWorker();
const hiperPromiseWorker = new PromiseWorker(hiperWorker);

const vtechWorker = new VtechWorker();
const vtechPromiseWorker = new PromiseWorker2(vtechWorker);

console.log(hiperPromiseWorker);
console.log(vtechPromiseWorker);

// Leave for example
// const send = (msg: string) => {
// 	return promiseWorker.postMessage({
// 		type: 'message',
// 		message: msg
// 	});
// };

// // const analyzeCSV = async (file: File) => {
const analyzeCSV = (data: string, furnace: string) => {
	if (furnace == 'hiper') {
		return hiperPromiseWorker.postMessage({
			type: 'csv',
			data: data
		});
	} else if (furnace == 'vtech') {
		return vtechPromiseWorker.postMessage({
			type: 'csv',
			data: data
		});
	}
};

// const analyzeVtechCSV = (data: string) => {
// 	console.log('Vtech');
// 	return vtechPromiseWorker.postMessage({
// 		type: 'csv',
// 		data: data
// 	});
// };

export default { analyzeCSV };
