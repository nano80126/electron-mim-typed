import axios from 'axios';
import sharp from 'sharp';
import { ipcMain, dialog } from 'electron';
import { picPath } from './fs';

ipcMain.handle('videoCover', async (e, args) => {
	const imgUrl = `http://img.youtube.com/vi/${args.ID}/maxresdefault.jpg`;
	console.log(imgUrl);

	try {
		const res = await axios({ url: imgUrl, responseType: 'arraybuffer' });

		let image = sharp(Buffer.from(res.data));

		const { width } = await image.metadata();
		if (width && width > 1440) image = image.resize({ width: 1440 });

		return image.toBuffer({ resolveWithObject: true });
	} catch (error) {
		return { Error: true, message: error.message };
	}
});

ipcMain.handle('dialogImage', async () => {
	try {
		const path = await dialog.showOpenDialog({ filters: [{ name: 'Images', extensions: ['jpg', 'png', 'bmp'] }] });
		// path.then(res => {}).catch(err)

		if (!path.canceled) {
			const filePath = path.filePaths[0];
			let image = sharp(filePath);

			const { width } = await image.metadata();
			if (width && width > 1400) image = image.resize({ width: 1440 });

			return image.toBuffer({ resolveWithObject: true });
		} else {
			return {};
		}
	} catch (error) {
		throw new Error(error);
		// return { Error: true, message: error.message };
	}
});

ipcMain.handle('loadBuffer', async (e, args) => {
	const { path } = args;

	try {
		// 先判斷是否為 Array
		if (!Array.isArray(path)) {
			return sharp(path).toBuffer({ resolveWithObject: true });
		} else {
			const promiseArr = path.map((p: string) => {
				if (p) {
					return sharp(p).toBuffer({ resolveWithObject: true });
				} else {
					return undefined;
				}
			});
			return Promise.all(promiseArr);
		}
	} catch (error) {
		throw new Error(error);
	}
});

ipcMain.handle('toBuffer', async (e, args) => {
	const { buffer, path } = args;

	try {
		let image = buffer ? sharp(Buffer.from(buffer)) : sharp(path);
		const { width } = await image.metadata();
		if (width && width > 1440) image = image.resize({ width: 1440 });

		return image.toFormat('jpeg').toBuffer({ resolveWithObject: true });
	} catch (error) {
		throw new Error(error);
		// return { Error: true, message: error.message };
	}
});

ipcMain.handle('saveImage', async (e, args) => {
	const { buffer, key, size } = args;
	// size = {left: x, top: y, width: w, height: h}
	try {
		const image = sharp(Buffer.from(buffer));

		const promise = [];
		promise.push(
			image
				.clone()
				.toFormat('jpeg')
				.toFile(`${picPath}\\${key}.jpg`)
		);

		if (size.width > 0 && size.height > 0) {
			promise.push(
				image
					.clone()
					.extract(size)
					.resize(128, 128, { fit: sharp.fit.outside, withoutEnlargement: true })
					.toFormat('jpeg')
					.toFile(`${picPath}\\${key}.icon.jpg`)
			);
		}
		return Promise.all(promise);
	} catch (error) {
		throw new Error(error);
		// return { Error: true, message: error.message };
	}
});
