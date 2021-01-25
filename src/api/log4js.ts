import { configure } from 'log4js';

try {
	require('fs').mkdirSync('log');
} catch (e) {
	if (e.code != 'EEXIST') {
		console.error(`Unable to create log durectory, code: ${e.code}`);
		process.exit(1);
	}
}

console.log(__dirname);

configure('src/config/log4js.json');
