import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store/index';

export interface AppState {
	overlay: boolean;
	snackbars: { show: boolean; color: Colors | string; text: string; timeout: number }[];
	isElectron: boolean;
	picPath: string;
	playList: string[];
	urlList: string[];
	videoID: string;
	videoTitle: string;
}

/**snackbar 顏色 */
export enum Colors {
	Info = 'info',
	Primary = 'primary',
	Success = 'success',
	Warning = 'warning',
	Error = 'error'
}

@Module({ dynamic: true, store, name: 'app' })
class Common extends VuexModule implements AppState {
	public overlay = false;
	//
	public snackbars: { show: boolean; color: Colors | string; text: string; timeout: number }[] = [];
	//
	public isElectron = process.env.IS_ELECTRON ? true : false;
	/**圖片路徑 */
	public picPath = '';
	/**播放列表 video ID */
	public playList: string[] = [];
	/**播放中之 video ID */
	public videoID = '';
	/**播放中之 video 標題 */
	public videoTitle = '';
	/**歌詞列表 Lyrics Url */
	public urlList: string[] = [];

	/// getters
	get barsHidden(): number {
		return this.snackbars.filter(x => !x.show).length;
	}

	get barsVisible(): number {
		return this.snackbars.filter(x => x.show).length;
	}

	@Mutation
	emptySnackbars() {
		this.snackbars = [];
	}

	@Mutation
	changeOverlay(bool: boolean) {
		this.overlay = bool;
	}

	@Mutation
	snackbar(bar: { color?: Colors | string; timeout?: number; text?: string }) {
		this.snackbars.push({
			show: true,
			color: bar.color || Colors.Error,
			timeout: bar.timeout || 3000,
			text: bar.text || ''
		});
	}

	@Mutation
	savePicPath(path: string) {
		this.picPath = path;
	}

	/**儲存播放列表 */
	@Mutation
	setPlayList(list: string[]) {
		this.playList = list;
	}

	/**更改播放中影片ID */
	@Mutation
	setVideoID(id: string) {
		this.videoID = id;
	}

	/**更改播放中標題 */
	@Mutation
	setVideoTitle(title: string) {
		this.videoTitle = title;
	}

	/**儲存歌詞URL列表 */
	@Mutation
	setUrlList(list: string[]) {
		this.urlList = list;
	}

	/**新增歌詞URL進列表 */
	@Mutation
	addUrlList(url: string) {
		this.urlList.push(url);
	}
}

export const AppModule = getModule(Common);
