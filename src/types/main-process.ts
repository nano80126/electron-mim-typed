import net from 'net';
import { CronJob } from 'cron';

/**燒結爐連線client interface  */
export class FSocket extends net.Socket {
	ip?: string = '';
	port?: number = 0;
	interval?: number = 3000;
	///
	/**是否已連線 */
	connected = false;
	/**是否開啟自動重連 */
	reconnect = false;
	/**自動重連CronJob物件 */
	cron?: CronJob;
	//
	/**手動斷線 */
	handleDisc = false;
	/**當前工序名稱 */
	stepName?: string;
	/**當前工序狀態 */
	stepState?: string;
	/**LINE 通知CD */
	coolState = false;
	/**冷卻計時器 */
	coolTimer?: NodeJS.Timeout;
	//
	/**取樣器 */
	sampler?: NodeJS.Timeout; // interval
	/**取樣器 ON */
	onSample = false;
	/**取樣狀態 */
	samplingState = false;
	/**取樣timeout計時器 */
	samplingTimeoutTimer?: NodeJS.Timeout;
	/**取樣timeout次數 */
	samplingTimeoutCount = 0;
}

//
//
// 以下待刪
//
//

/**interface of text config  */
export interface ItextConfig {
	mainColor: string;
	subColor: string;
	textAlign: string;
}

/**interface of text config and start window position */
export interface Iconfig {
	x?: number;
	y?: number;
}

/**interface of song list crawled */
export interface IlistCrawled {
	id: number;
	artist: string;
	title: string;
	lyricsUrl: string;
	lyricsFront: string;
}

/**interface of lyrics object crawled */
export interface IlyricsObjCrawled {
	artist: string;
	title: string;
	lyricsUrl: string;
	lyricsKey: string;
	lyrics: string;
}

/**interface of lyrics object pass through main process */
export interface IchannelLyricsObj {
	artist: string;
	title: string;
	lyricsKey: string;
	lyricsUrl: string;
}
