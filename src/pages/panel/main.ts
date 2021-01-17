import Vue from 'vue';
import App from './App.vue';
// import router from '@/router';
import store from '@/store';
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

import { AppModule, Colors } from '@/store/modules/app';
import '@/style.scss';

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
	$shell: {
		value: process.env.IS_ELECTRON ? window.require('electron').shell : undefined
	},
	$ipcRenderer: {
		value: process.env.IS_ELECTRON ? window.require('electron').ipcRenderer : undefined
	}
});

declare module 'vue/types/vue' {
	interface Vue {
		$moment(input?: MomentInput): Moment;
		$axios: AxiosStatic;
		$lodash: LoDashStatic;
		$ipcRenderer: IpcRenderer;
		$shell: Shell;
	}
}

new Vue({
	// router,
	store,
	vuetify,
	i18n,
	render: h => h(App),

	data() {
		return {
			webWidth: window.innerWidth,
			webHeight: window.innerHeight
		};
	},
	///
	created() {
		// set theme dark
		this.$vuetify.theme.dark = true;

		this.$ipcRenderer
			.invoke('getPicDir')
			.then((res: { path: string }) => {
				console.info(`%c${res.path}`, `color: ${this.$vuetify.theme.themes.dark.success};`);
				AppModule.savePicPath(res.path);
			})
			.catch((err: Error) => {
				// if not path exists
				AppModule.snackbar({ text: err.message, color: Colors.Error });
			});
	},

	mounted() {
		if (process.env.NODE_ENV == 'development') console.warn('env', process.env);
		// // //
		window.onresize = async () => {
			this.webWidth = window.innerWidth;
			this.webHeight = window.innerHeight;
			// this.windowIsMax = await this.$ipcRenderer.invoke('isMaxmized');
		};
	}
}).$mount('#app');
