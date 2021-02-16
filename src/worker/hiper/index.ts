import registerPromiseWorker from 'promise-worker/register';
import moment from 'moment';

registerPromiseWorker(msg => {
	if (msg.type === 'csv') {
		const array: { [key: string]: number }[] = [];
		const txt = msg.data;
		const lines = txt.split('\n');

		for (let i = 0; i < lines.length; i++) {
			const items = lines[i].split(',');

			if (items.length >= 9) {
				const m = moment(items[0], 'YYYY/MM/DD HH:mm:ss');
				if (m.isValid()) {
					array.push({
						datetime: m.valueOf(),
						PG: parseInt(items[1]) / 100,
						UpperTemp: parseInt(items[2]) / 10,
						LowerTemp: parseInt(items[3]) / 10,
						Flow: parseInt(items[4]) / 10,
						PTVO: parseInt(items[5]) / 10,
						PTVT: parseInt(items[6]) / 10,
						PTVI: parseInt(items[7]) / 10,
						Other: parseInt(items[8]) / 10
					});
				}
			}
		}
		return { type: 'csv', series: array };
	}
});
