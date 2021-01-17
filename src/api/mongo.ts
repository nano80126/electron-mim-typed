import { MongoClient } from 'mongodb';
import { ipcMain } from 'electron';
import moment from 'moment';
// import { argv } from 'process';

let mongoCLient: MongoClient;

MongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true }, (err, client) => {
	if (err) throw err;
	mongoCLient = client;

	const db = client.db('lyrics');
	const history = db.collection('history');
	const list = db.collection('list');

	// list.insert({ a: 123 }, (err, doc) => {
	// 	console.log(err);
	// 	console.log(doc);
	// });

	// 刪除
	history.deleteMany({
		datetime: {
			$lt: moment()
				.add(-15, 'days')
				.format('YYYY-MM-DD HH:mm:ss')
		}
	});

	ipcMain.handle('historyFind', async (e, args) => {
		return await history
			.find(args.query)
			.sort({ datetime: -1 })
			.limit(5)
			.toArray();
	});

	ipcMain.handle('historySave', async (e, args) => {
		const ret = await history.updateOne(args.query, args.data, { upsert: true });
		return ret.result;
	});

	ipcMain.handle('listFind', async (e, args) => {
		return await list
			.find(args.query)
			.sort(args.sort)
			.toArray();
	});

	ipcMain.handle('listFindOne', async (e, args) => {
		return await list.findOne(args.query);
	});

	ipcMain.handle('listSave', async (e, args) => {
		await list.createIndex({ lyricsKey: 1 }, { unique: true });

		const ret = await list.updateOne(args.query, args.data, { upsert: true });
		return ret.result;
	});

	ipcMain.handle('listRemove', async (e, args) => {
		const ret = await list.deleteMany(args.query);
		return ret.result;
	});

	ipcMain.handle('listRemoveOne', async (e, args) => {
		const ret = await list.deleteOne(args.query);
		return ret.result;
	});
	// ipcMain.handle('listAdd', (e, args) => {
	// 	list.createIndex({ uniqueKey: 1 }, { unique: true }, err => {
	// 		if (err) console.log(err);
	// 	});

	// 	list.update(args.query, args.data, { upsert: true }, err => {
	// 		console.log(err);
	// 	});

	ipcMain.on('mongoDisc', () => {
		client.close();
	});
});

export { mongoCLient };
