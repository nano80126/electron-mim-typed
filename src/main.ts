import Vue from 'vue';
import App from '@/App.vue';
import router from '@/router';
import store from '@/store';
import { AppModule, Colors } from '@/store/modules/app';
// import { PlayerModule } from '@/store/modules/player';
import vuetify from '@/plugins/vuetify';
import i18n from '@/plugins/i18n';

// import path from 'path';
// import * as fs from 'fs';
// import { remote, IpcRenderer, Shell } from 'electron';
import { IpcRenderer, Shell } from 'electron';
// const { /*remote,*/ /*IpcRenderer,*/ ipcRenderer, shell } = window.require('electron');

import moment, { Moment, MomentInput } from 'moment';
import lodash, { LoDashStatic } from 'lodash';
import axios, { AxiosStatic } from 'axios';
import qs, { stringify } from 'qs';

import { LyModule } from '@/store/modules/lyrics';
import { IdisplayTxt, IlyricsDisplayObj, IlyricsObj, IsongList } from '@/types/renderer';
import '@/style.scss';

/// ///
Object.defineProperties(Vue.prototype, {
	$moment: {
		value: moment
	},
	$lodash: {
		value: lodash
	},
	$axios: {
		value: axios
	},
	$qs: {
		value: qs
	},
	$shell: {
		value: process.env.IS_ELECTRON ? window.require('electron').shell : undefined
	},
	$ipcRenderer: {
		value: process.env.IS_ELECTRON ? window.require('electron').ipcRenderer : undefined
	}
});

declare global {
	/**window add YT interface */
	// interface Window {
	// 	YT: YT.Player;
	// }
}

declare module 'vue/types/vue' {
	/**Vue add some module interfaces */
	interface Vue {
		// $moment(input?: MomentInput): Moment;
		// $axios: AxiosStatic;
		$lodash: LoDashStatic;
		// $qs: { stringify: typeof stringify };
		// $sharp(input: Buffer | string): Sharp;
		// $sharpFit: FitEnum;
		// $fs: { readdirSync: Function; unlink: Function; exists: Function; mkdir: Function };
		$ipcRenderer: IpcRenderer;
		// $shell: Shell;
		// $picPath: string;
	}
}

new Vue({
	router,
	store,
	vuetify,
	i18n,
	render: h => h(App),

	///
	data() {
		return {
			windowIsMax: false, // used in app.vue for changing icon
			///
			webWidth: window.innerWidth,
			webHeight: window.innerHeight,
			screenWidth: window.screen.width,
			screenHeight: window.screen.height,
			//

			colors: Object.freeze([
				'primary',
				'cyan',
				'success',
				'teal',
				'error',
				'warning',
				'yellow',
				'purple',
				'white',
				'grey',
				'black'
			])
		};
	},

	watch: {},

	created() {
		// set theme dark
		this.$vuetify.theme.dark = true;
	},

	mounted() {
		if (process.env.NODE_ENV == 'development') console.warn('env', process.env);
		// ////
		/**註冊 resize 事件 */
		window.onresize = async () => {
			this.webWidth = window.innerWidth;
			this.webHeight = window.innerHeight;
			this.windowIsMax = await this.$ipcRenderer.invoke('isMaxmized');
		};

		// this.loadUrlInList();
	},

	methods: {
		/**建立圖片資料夾 */
		/**載入Config, text color and align */
		/**載入Url List, 比對用 */
		/**註冊 Hotkey  */
		// registerGlobalHotkey() {
		// 	this.$ipcRenderer.on('playVideo', () => {
		// 		if (PlayerModule.player) {
		// 			PlayerModule.playVideo();
		// 		}
		// 	});
		// 	this.$ipcRenderer.on('pauseVideo', () => {
		// 		if (PlayerModule.player) {
		// 			PlayerModule.pauseVideo();
		// 		}
		// 	});
		// 	this.$ipcRenderer.on('volumePlus', () => {
		// 		if (PlayerModule.player) {
		// 			PlayerModule.videoPlusVolume(5);
		// 		}
		// 	});
		// 	this.$ipcRenderer.on('volumeMinus', () => {
		// 		if (PlayerModule.player) {
		// 			PlayerModule.videoMinusVolume(5);
		// 		}
		// 	});
		// 	this.$ipcRenderer.on('videoLoop', (e, args) => {
		// 		console.log(args);
		// 		PlayerModule.videoLoop(args.loop);
		// 	});
		// 	this.$ipcRenderer.on('videoShuffle', (e, args) => {
		// 		console.log(args);
		// 		PlayerModule.videoShuffle(args.shuffle);
		// 	});
		// }
	}
}).$mount('#app');
