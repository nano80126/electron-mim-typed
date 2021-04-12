import { CronJob } from 'cron';
import { getLogger } from 'log4js';

import moment from 'moment';
import { hiperClient } from './socket/socket_hiper';
import { vtechClient } from './socket/socket_vtech';

// 主視窗 webContent
import { mainWin } from '@/background';
import { message } from '@/api/line';

const log = getLogger('app');

///
/// 每日 17:30, 22:30 觸發通知
///

log.info('Start daily routine of LINE Notify to inform furnace status');
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
				log.info('Daily routine LINE Notify triggered');
			})
			.catch(err => {
				// mainWin.send
				mainWin?.send('notifyRes', {
					error: true,
					code: err.code,
					message: err.message
				});
				// append to log
				log.error(`${err.code} ${err.message}`);
			});
	},
	null,
	true
);
