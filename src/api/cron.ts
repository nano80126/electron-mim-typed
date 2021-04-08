import { CronJob } from 'cron';
import { getLogger } from 'log4js';

import moment from 'moment';
import { hiperClient } from './socket/socket_hiper';
import { vtechClient } from './socket/socket_vtech';

// 主視窗 webContent
import { mainWin } from '@/background';
import { message } from '@/api/line';

const log = getLogger('app');

log.info('Start daily notification of furnace');
new CronJob(
	'0 30 17,22 * * 0-6',
	() => {
		let msg = `\n現在時間: ${moment().format('MM/DD HH:mm:ss')}\n伺服器狀態: 正常`;

		msg += '\n\n『 恆普 』';
		if (hiperClient && hiperClient.connected) {
			msg += `\n工藝狀態: ${hiperClient.stepState} \n工藝名稱: ${hiperClient.stepName}`;
		} else {
			msg += '\n燒結爐狀態: 未連線';
		}
		msg += '\n\n『 宏倫 』';
		if (vtechClient && vtechClient.connected) {
			msg += `\n工藝狀態: ${vtechClient.stepState} \n工藝名稱: ${vtechClient.stepName}`;
		} else {
			msg += '\n燒結爐狀態: 未連線';
		}

		message(msg)
			.then(res => {
				// mainWin.send
				mainWin?.send('notifyRes', res.data);
				log.info('Daily notification');
			})
			.catch(err => {
				// mainWin.send
				mainWin?.send('notifyRes', {
					error: true,
					code: err.code,
					message: err.message
				});
				// append to log
				log.warn(`${err.code} ${err.message}`);
			});
	},
	null,
	true
);
