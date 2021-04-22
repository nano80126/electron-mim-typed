import PromiseWorker from 'promise-worker';
import HiperWorker from 'worker-loader!./func.ts';
// import VtechWorker from 'worker-loader!./vtech/';

// const promiseWorker = new PromiseWorker(worker);

const worker = new HiperWorker();
const hiperPromiseWorker = new PromiseWorker(worker);

// const vtechWorker = new VtechWorker();
// const vtechPromiseWorker = new PromiseWorker2(vtechWorker);

console.log(hiperPromiseWorker);

// Leave for example
// const send = (msg: string) => {
// 	return promiseWorker.postMessage({
// 		type: 'message',
// 		message: msg
// 	});
// };

// // const analyzeCSV = async (file: File) => {
const analyzeCSV = (obj: { furnace: string; data: string }) => {
	return hiperPromiseWorker.postMessage({
		type: 'csv',
		furnace: obj.furnace,
		data: obj.data
	});
	// else if (furnace == 'vtech') {
	// 	return vtechPromiseWorker.postMessage({
	// 		type: 'csv',
	// 		data: data
	// 	});
	// }
};

// const analyzeVtechCSV = (data: string) => {
// 	console.log('Vtech');
// 	return vtechPromiseWorker.postMessage({
// 		type: 'csv',
// 		data: data
// 	});
// };

export default { analyzeCSV };
