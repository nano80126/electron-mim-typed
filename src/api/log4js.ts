import { configure } from 'log4js';
import path from 'path';
import { app } from 'electron';

const { NODE_ENV } = process.env;
const logPath =
	NODE_ENV == 'development'
		? path.resolve(app.getPath('documents'), 'electron-mim/logs')
		: path.resolve(app.getPath('exe'), '../logs');

// console.log(logPath);

try {
	require('fs').mkdirSync(logPath);
} catch (e) {
	if (e.code != 'EEXIST') {
		console.error(`Unable to create log directory, code: ${e.code}`);
		process.exit(1);
	}
}

configure({
	appenders: {
		app: {
			type: 'file',
			filename: path.resolve(logPath, 'app.log'),
			maxLogSize: 10485760,
			numBackups: 3
		},
		hiper: {
			type: 'file',
			filename: path.resolve(logPath, 'hiper.log'),
			maxLogSize: 10485760,
			numBackups: 3
		},
		vtech: {
			type: 'file',
			filename: path.resolve(logPath, 'vtech.log'),
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
