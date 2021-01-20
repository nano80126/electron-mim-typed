import axios from 'axios';
import qs from 'qs';

const token =
	process.env.NODE_ENV == 'development' ? process.env.VUE_APP_LINE_DEV_TOKEN : process.env.VUE_APP_LINE_TOKEN;

export function message(msg: string) {
	return axios.post(
		'https://notify-api.line.me/api/notify',
		qs.stringify({
			message: msg
		}),
		{
			headers: {
				// Authorization: 'Bearer EGQtXZpACF1QbLY1ELWrZBzeFpik0BWz9CYyujHaTqo',
				// Authorization: `Bearer ${process.env.LINE_TOKEN}`,
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		}
	);
}
