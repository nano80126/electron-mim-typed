import { Module, Mutation, VuexModule, getModule } from 'vuex-module-decorators';
import store from '@/store/index';
import { IlyricsDisplayObj } from '@/types/renderer';
import { ItextConfig } from '@/types/main-process';

type LyricsObject = IlyricsDisplayObj;

// interface LyricsObject {
// 	key: string;
// 	url: string;
// 	title: string;
// 	artist: string;
// 	lyric: string;
// 	image?: string;
// 	imageSize?: { width: number; height: number };
// }

export type LyricsTxtConf = ItextConfig;

// export interface LyricsTxtConf {
// 	main: string;
// 	sub: string;
// 	align: string;
// }

export interface LyricsState {
	lyricObj: LyricsObject | null;
	lyricText: LyricsTxtConf | null;
}

@Module({ dynamic: true, store, name: 'lyrics' })
class Lyrics extends VuexModule implements LyricsState {
	public lyricObj: LyricsObject | null = null;
	public lyricText: LyricsTxtConf | null = null;
	///

	@Mutation
	saveLyric(obj: LyricsObject) {
		this.lyricObj = obj;
	}

	@Mutation
	clearLyric() {
		this.lyricObj = null;
	}

	@Mutation
	saveText(txt: LyricsTxtConf) {
		this.lyricText = txt;
	}
}

export const LyModule = getModule(Lyrics);
