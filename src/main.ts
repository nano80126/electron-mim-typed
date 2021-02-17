import Vue from 'vue';
import App from '@/App.vue';
import router from '@/router';
import store from '@/store';
import { AppModule, Colors } from '@/store/modules/app';
// import { PlayerModule } from '@/store/modules/player';
import vuetify from '@/plugins/vuetify';
// import i18n from '@/plugins/i18n';

// import path from 'path';
// import * as fs from 'fs';
// import { remote, IpcRenderer, Shell } from 'electron';
import { IpcRenderer } from 'electron';
// const { /*remote,*/ /*IpcRenderer,*/ ipcRenderer, shell } = window.require('electron');

import moment, { Moment, MomentInput, MomentFormatSpecification } from 'moment';
import lodash, { LoDashStatic } from 'lodash';
import axios from 'axios';
// import qs from 'qs';

import {
	EwsChannel,
	EwsFurnaceType,
	IwsMsg,
	IwsOpenMsg,
	IwsConnMsg,
	IwsSerialMsg,
	IwsCmdResMsg
} from '@/types/renderer';

import { HiperModule } from './store/modules/hiper';
import '@/style.scss';

const { VUE_APP_ADDRESS, VUE_APP_PORT } = process.env;
const wsUrl = `ws://${VUE_APP_ADDRESS}:${VUE_APP_PORT}`;

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
	// $shell: {
	// 	value: process.env.IS_ELECTRON ? window.require('electron').shell : undefined
	// },
	$ipcRenderer: {
		value: process.env.IS_ELECTRON ? window.require('electron').ipcRenderer : undefined
	},
	$ws: {
		value: process.env.IS_ELECTRON ? undefined : new WebSocket(wsUrl),
		writable: process.env.IS_ELECTRON ? false : true
	},
	$wsUrl: {
		value: process.env.IS_ELECTRON ? undefined : wsUrl,
		writable: process.env.IS_ELECTRON ? false : true
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
		$moment(input?: MomentInput, format?: MomentFormatSpecification): Moment;
		// $axios: AxiosStatic;
		$lodash: LoDashStatic;
		// $qs: { stringify: typeof stringify };
		// $sharp(input: Buffer | string): Sharp;
		// $sharpFit: FitEnum;
		// $fs: { readdirSync: Function; unlink: Function; exists: Function; mkdir: Function };
		$ipcRenderer: IpcRenderer;
		// $shell: Shell;
		// $picPath: string;
		$ws: WebSocket;
		$wsUrl: string;
	}
}

new Vue({
	router,
	store,
	vuetify,
	// i18n,
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

		if (process.env.IS_ELECTRON) {
			//
		}
	},

	mounted() {
		if (process.env.NODE_ENV == 'development') console.warn('env', process.env);
		// ////
		/**註冊 resize 事件 */
		window.onresize = async () => {
			this.webWidth = window.innerWidth;
			this.webHeight = window.innerHeight;

			if (process.env.IS_ELECTRON) this.windowIsMax = await this.$ipcRenderer.invoke('isMaxmized');
		};

		if (process.env.IS_ELECTRON) {
			// IN ELECTRON env
			/**trigger if line notify failed  */
			this.$ipcRenderer.on('notifyRes', (e, args) => {
				if (args.error) {
					console.error(`%c${JSON.stringify(args)}`, 'color: #F44336');
					AppModule.snackbar({ text: args.message, color: Colors.Warning });
				} else {
					console.info(`%c${JSON.stringify(args)}`, 'color: #4CAF50');
				}
			});
		} else {
			// IN BROWSER ENV
			this.wsInitialize();
		}

		// this.loadUrlInList();
	},

	methods: {
		/**ws 初始化 */
		wsInitialize() {
			this.$ws.addEventListener(
				'open',
				() => {
					// HiperModule
					AppModule.changeWsOpened(true);

					this.$ws.addEventListener('message', msg => {
						const wsMsg = JSON.parse(msg.data) as IwsMsg;
						let openMsg;

						console.log(msg);
						console.log(wsMsg);

						switch (wsMsg.channel) {
							case EwsChannel.OPEN:
								openMsg = `%c${(wsMsg as IwsOpenMsg).text} ID: ${(wsMsg as IwsOpenMsg).id}`;
								console.info(openMsg, 'color: #4CAF50;');
								break;
							case EwsChannel.CONNECT:
								if (wsMsg.furnace == EwsFurnaceType.HIPER) {
									HiperModule.changeConnected((wsMsg as IwsConnMsg).connected);
								} else if (wsMsg.furnace == EwsFurnaceType.VTECH) {
									//
								}
								break;
							case EwsChannel.SERIAL:
								//
								if (wsMsg.furnace == EwsFurnaceType.HIPER) {
									this.$emit('hiperSerial', wsMsg as IwsSerialMsg);
								} else if (wsMsg.furnace == EwsFurnaceType.VTECH) {
									//
								}
								break;
							case EwsChannel.COMMANDRES:
								//
								openMsg = (wsMsg as IwsCmdResMsg).text;
								AppModule.snackbar({ text: openMsg, color: Colors.Warning });
								break;
							default:
						}
					});

					this.$ws.addEventListener('close', e => {
						AppModule.changeWsOpened(false);
						AppModule.snackbar({ text: `與伺服器連線中斷。 CODE: ${e.code}`, color: Colors.Warning });
						//
						this.wsRetry();
					});
				},
				{ once: true }
			);

			this.$ws.addEventListener('error', () => {
				AppModule.snackbar({ text: '與伺服器連線失敗。', color: Colors.Error });
				this.wsRetry();
			});
		},

		/**ws 重新連線 */
		wsRetry() {
			setTimeout(() => {
				this.$ws = new WebSocket(this.$wsUrl);
				this.wsInitialize();
			}, 5000);
		}

		/**建立圖片資料夾 */
		//
		/**載入Config, text color and align */
		//
		/**載入Url List, 比對用 */
		//
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
