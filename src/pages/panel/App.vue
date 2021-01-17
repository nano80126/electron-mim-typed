<template>
	<div v-show="SHOW">
		<v-app>
			<v-app-bar app height="32" color="blue-grey darken-4">
				<div class="window-drag header ml-n4" />

				<v-spacer />

				<v-btn min-width="24" width="36" text class="no-drag mr-n4" small @click="windowHide">
					<v-icon small>fas fa-times</v-icon>
				</v-btn>
			</v-app-bar>

			<v-main class="pl-3">
				<transition name="slideInOut" mode="out-in">
					<lyricMedia v-if="lyricsObj" :panelWindow="true" :extendImage="false" :lyricsObj="lyricsObj" />
				</transition>
			</v-main>

			<!--  snackbar  -->
			<transition-group name="slideRight">
				<template v-for="(n, idx) in snackbars">
					<v-snackbar
						app
						:key="`snack${idx}`"
						v-if="n.show"
						v-model="n.show"
						right
						bottom
						:color="n.color"
						:timeout="n.timeout"
						:style="{ top: `-${5 + (10 + 50) * (idx - barsHidden)}px` }"
					>
						{{ n.text }}
						<template v-slot:action="{ attrs }">
							<v-btn text v-bind="attrs" @click="n.show = false">閉じる</v-btn>
						</template>
					</v-snackbar>
				</template>
			</transition-group>
		</v-app>
	</div>
</template>

<script lang="ts">
import media from '@/components/Search/Media.vue';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { AppModule } from '@/store/modules/app';

import { IlyricsObjSearched } from '@/types/renderer';

@Component({
	components: {
		lyricMedia: media
	}
})
export default class App extends Vue {
	/**show after mounted */
	private SHOW = false;
	/**歌詞物件 */
	private lyricsObj: IlyricsObjSearched | null = null;
	/**當前使用語言 */
	private language = this.$i18n.locale;

	get snackbars() {
		return AppModule.snackbars;
	}

	get barsHidden(): number {
		return AppModule.barsHidden;
	}

	@Watch('$store.getters.barsVisible')
	onBarsVisibleChange(value: number) {
		if (value == 0) AppModule.emptySnackbars();
	}

	@Watch('language')
	onLanguageChange(value: string) {
		this.$i18n.locale = value;
	}

	created() {
		this.$ipcRenderer.on('lyricObj', (e, args) => {
			this.lyricsObj = null;
			this.$nextTick(() => {
				setTimeout(() => {
					this.lyricsObj = {
						obj: Object.freeze({
							artist: args.artist,
							title: args.song,
							lyricsKey: args.key,
							lyricsUrl: args.url,
							lyrics: ''
						}),
						exist: true
					};
				}, args.delay);
			});
		});

		this.$ipcRenderer.on('syncLanguage', (e, locale) => {
			this.language = locale;
		});
	}

	mounted() {
		this.SHOW = true;
	}

	private windowHide() {
		this.$ipcRenderer.send('panelHide');
	}
}
</script>

<style lang="scss" scoped>
.slideRight-enter-active,
.slideRight-leave-active {
	transition: all 0.5s;
}

.slideRight-enter {
	opacity: 0;
	transform: translateY(-30px);
}

.slideRight-leave-to {
	opacity: 0;
	transform: translateX(60px);
}

.slideInOut-enter-active,
.slideInOut-leave-active {
	transition: all 0.5s;
}

.slideInOut-enter {
	opacity: 0.3;
	transform: translateX(-100%);
}

.slideInOut-leave-to {
	opacity: 0;
	transform: translateX(100%);
}
</style>
