'use strict';

import Vue from 'vue';
import Vuex from 'vuex';
// import { resolve } from 'core-js/fn/promise';

// import mymod from './mymodule';

Vue.use(Vuex);

import { AppState } from './modules/app';
import { LyricsState } from './modules/lyrics';
import { PlayerState } from './modules/player';

export interface RootState {
	commom: AppState;
	lyrics: LyricsState;
	player: PlayerState;
}

export default new Vuex.Store<RootState>({
	// state: {},
	// getters: {},
	// mutations: {},
	// actions: {},
	// modules: {}
});
