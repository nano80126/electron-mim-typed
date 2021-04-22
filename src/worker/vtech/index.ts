import registerPromiseWorker from 'promise-worker/register';
import moment from 'moment';
import { drop } from 'lodash';

registerPromiseWorker(msg => {
	console.log('vtech', msg);
	if (msg.type === 'csv') {
		const array: { datetime: number; data: number[] }[] = [];
		let names: string[] = [];
		const txt = msg.data;
		const lines = txt.split('\n');
		// console.log(lines);

		let isValid = false;
		let datetime = 0; // 紀錄 datetime，避免 xAxis重疊

		for (let i = 0; i < lines.length; i++) {
			const items = lines[i].split(',');

			// Reg format = YYYY/MM/DD HH:mm
			const reg = new RegExp(/^[1-9]{2,4}\/\d{2}\/\d{2} \d{2}:\d{2}$/);

			if (!isValid) {
				if (items[0] == ':DEV_COMMENT') {
					names = drop(items);
					names = names.map(element => {
						return element.replace(/"/g, '');
					});
					continue;
				} else if (!reg.test(items[0])) {
					continue;
				} else {
					isValid = true;
				}
			}

			// if (items.length >= 9) {
			const m = moment(items[0], 'YYYY/MM/DD HH:mm');
			if (m.isValid()) {
				// array.push({
				// 	datetime: m.valueOf(),
				// 	PG: parseInt(items[1]) / 100,
				// 	UpperTemp: parseInt(items[2]) / 10,
				// 	LowerTemp: parseInt(items[3]) / 10,
				// 	Flow: parseInt(items[4]) / 10,
				// 	PTVO: parseInt(items[5]) / 10,
				// 	PTVT: parseInt(items[6]) / 10,
				// 	PTVI: parseInt(items[7]) / 10,
				// 	Other: parseInt(items[8]) / 10
				// });
				if (datetime != m.valueOf()) {
					const data: number[] = (drop(items) as string[]).map((ele: string) => parseFloat(ele));
					array.push({
						datetime: m.valueOf(),
						data: data
					});
					datetime = m.valueOf();
				}
			}
			// }
		}
		return { type: 'csv', names, series: array };
	}
});
