import { configure } from 'log4js';
import path from 'path';
import { app } from 'electron';
// import { log } from 'util';

const { IS_ELECTRON, NODE_ENV } = process.env;
const logPath = IS_ELECTRON
	? NODE_ENV == 'development'
		? path.resolve(app.getPath('documents'), 'electron-min')
		: path.resolve(app.getPath('exe'), '../log')
	: undefined;

if (logPath) {
	try {
		require('fs').mkdirSync(logPath);
	} catch (e) {
		if (e.code != 'EEXIST') {
			console.error(`Unable to create log durectory, code: ${e.code}`);
			process.exit(1);
		}
	}

	console.log(__dirname);
	// configure('src/config/log4js.json');

	configure({
		appenders: {
			app: {
				type: 'file',
				filename: path.resolve(logPath, 'log/app.log'),
				maxLogSize: 10485760,
				numBackups: 3
			},
			hiper: {
				type: 'file',
				filename: path.resolve(logPath, 'log/hiper.log'),
				maxLogSize: 10485760,
				numBackups: 3
			},
			vtech: {
				type: 'file',
				filename: path.resolve(logPath, 'log/vtech.log'),
				maxLogSize: 10485760,
				numBackups: 3
			}
		},
		categories: {
			default: {
				appenders: ['app'],
				level: 'DEBUG'
			},
			hiper: {
				appenders: ['hiper'],
				level: 'INFO'
			},
			vtech: {
				appenders: ['vtech'],
				level: 'INFO'
			}
		}
	});
	//
}
