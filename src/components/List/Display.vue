<template>
	<div>
		<!-- <v-card v-if="lyric" flat shaped width="100%"> -->
		<v-card-title>
			<span class="ellipsis" v-text="lyricsObj.title" style="max-width: 500px" />
		</v-card-title>
		<v-card-subtitle style="position: relative;">
			<span v-text="lyricsObj.artist" />
		</v-card-subtitle>

		<v-divider />

		<!-- height = 32+48+38+2+52+12    -->
		<v-card-text
			class="text-darken-2 font-weight-bold lyric-body py-0"
			style="position:relative;"
			:style="{ height: `${$root.webHeight - 241}px` }"
		>
			<!-- :style="{ height: `${$root.webHeight - 184}px` }" -->

			<!-- <v-img class="back-card my-4 red" contain :src="image" /> -->
			<transition name="fadeIn" mode="out-in">
				<v-img
					v-if="image"
					class="back-card my-4"
					contain
					:width="fullImg ? '100%' : null"
					position="center center"
					:src="`data:image/jpeg;base64,${image.toString('base64')}`"
					:style="{ opacity: bkOpacity }"
				/>
				<!-- :width="backSize ? backSize.width : null"
						:height="backSize ? backSize.height : null" -->
			</transition>

			<div
				class="mr-n4 py-4 pr-4 min-scroll y info-scroll lyric-content"
				:class="`${mainColor}--text ${subColor}--subtext text-${textAlign}`"
				style="position:relative; overflow-y: auto; height: 100%;"
			>
				<span class="text-center" v-html="lyricsObj.lyrics || `<span>${$('noLyricsExist')}</span>`"></span>
				<span class="grey--text text-lighten-2 px-4 mt-10" style="float: right;"> -- {{ $t('end') }} </span>
			</div>
		</v-card-text>

		<v-divider />
		<v-card-actions>
			<v-menu top offset-y nudge-top="16px" transition="scale-transition" origin="bottom left">
				<template v-slot:activator="{ on, attrs }">
					<v-btn text outlined class="rounded-xl mr-3" v-bind="attrs" v-on="on">
						<v-icon :color="mainColor">fas fa-square</v-icon>
					</v-btn>
				</template>

				<v-btn-toggle v-model="mainColor" color="grey lighten-3" dense group class="grey darken-2" mandatory>
					<v-btn v-for="(c, k) in colors" :key="`m${k}`" :value="c" text>
						<v-icon :color="c">fas fa-square</v-icon>
					</v-btn>
				</v-btn-toggle>
			</v-menu>

			<v-menu top offset-y nudge-top="16px" transition="scale-transition" origin="bottom left">
				<template v-slot:activator="{ on, attrs }">
					<v-btn text outlined class="rounded-xl mr-3" v-bind="attrs" v-on="on">
						<v-icon :color="subColor">fas fa-square</v-icon>
					</v-btn>
				</template>

				<v-btn-toggle v-model="subColor" color="grey lighten-3" dense group class="grey darken-2" mandatory>
					<v-btn v-for="(c, k) in colors" :key="`m${k}`" :value="c" text>
						<v-icon :color="c">fas fa-square</v-icon>
					</v-btn>
				</v-btn-toggle>
			</v-menu>

			<v-btn-toggle v-model="textAlign" mandatory dense class="mr-3">
				<v-btn value="lelt" min-width="0" width="48">
					<v-icon size="18">fas fa-align-left</v-icon>
				</v-btn>

				<v-btn value="center" min-width="0" width="48">
					<v-icon size="18">fas fa-align-center</v-icon>
				</v-btn>

				<v-btn value="right" min-width="0" width="48">
					<v-icon size="18">fas fa-align-right</v-icon>
				</v-btn>
			</v-btn-toggle>

			<v-btn icon outlined @click="fullImg = !fullImg">
				<v-icon size="18" :color="fullImg ? 'info' : 'grey darken-1'">fas fa-expand-arrows-alt</v-icon>
				<!-- <v-icon style="position:absolute; top:0; left: 0;">fas fa-search</v-icon> -->
			</v-btn>

			<v-spacer />

			<input
				v-model="bkOpacity"
				max="1"
				min="0.2"
				step="0.02"
				type="range"
				class="slider"
				style="width:12%; min-width: 120px"
			/>
		</v-card-actions>

		<!-- <v-card-actions>
				<embedPlayer :videoID="this.lyric.ytID" style="width:100%;" />
			</v-card-actions> -->
		<!-- </v-card> -->
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import { LyModule, LyricsTxtConf } from '@/store/modules/lyrics';
import { AppModule, Colors } from '@/store/modules/app';
import { IlyricsDisplayObj } from '@/types/renderer';

@Component
export default class Display extends Vue {
	/**歌詞物件 */
	@Prop({ required: false, type: Object }) lyricsObj?: IlyricsDisplayObj;

	/**圖片Buffer */
	private image: Buffer | null = null;
	private mainColor = 'primary';
	private subColor = 'grey';
	private textAlign = 'left';

	/**文字顏色 */
	private colors: Readonly<Array<string>> = this.$root.$data.colors;

	/**是否展開大圖 */
	private fullImg = true;
	/**背景透明度 */
	private bkOpacity = 0.36;

	/** */
	// get backSize(): {} | null {
	// 	return this.lyric ? this.lyric.imageSize : null;
	// }
	// get backOpacity(): number {
	// 	return this.bkOpacity;
	// }
	// set backOpacity(val) {
	// 	this.$lodash.debounce(() => {
	// 		this.bkOpacity = val;
	// 	}, 300);
	// }

	@Watch('lyricsObj.imagePath')
	changeLyricImage(img: string) {
		this.image = null;
		if (img) this.backimgLoad();
	}

	@Watch('mainColor')
	changeMainColor(val: string) {
		this.$ipcRenderer.invoke('writeConfig', { mainColor: val }).then(res => {
			if (process.env.NODE_ENV == 'development') {
				console.info(`%c${JSON.stringify(res)}`, `color: ${this.$vuetify.theme.themes.dark.info}`);
			}
		});
	}

	@Watch('subColor')
	changeSubColor(val: string) {
		this.$ipcRenderer.invoke('writeConfig', { subColor: val }).then(res => {
			if (process.env.NODE_ENV == 'development') {
				console.info(`%c${JSON.stringify(res)}`, `color: ${this.$vuetify.theme.themes.dark.info}`);
			}
		});
	}

	@Watch('textAlign')
	changeTextAlign(val: string) {
		this.$ipcRenderer.invoke('writeConfig', { textAlign: val }).then(res => {
			if (process.env.NODE_ENV == 'development') {
				console.info(`%c${JSON.stringify(res)}`, `color: ${this.$vuetify.theme.themes.dark.info}`);
			}
		});
	}

	created() {
		const { mainColor, subColor, textAlign } = LyModule.lyricText as LyricsTxtConf;
		this.mainColor = mainColor || this.mainColor;
		this.subColor = subColor || this.subColor;
		this.textAlign = textAlign || this.textAlign;
	}

	mounted() {
		if (this.lyricsObj?.imagePath) {
			this.backimgLoad();
		}
	}

	beforeDestroy() {
		if (this.lyricsObj) LyModule.saveLyric(this.lyricsObj);
		LyModule.saveText({ mainColor: this.mainColor, subColor: this.subColor, textAlign: this.textAlign });
	}

	/**載入背景圖 */
	private backimgLoad() {
		this.$ipcRenderer
			.invoke('loadBuffer', { path: this.lyricsObj?.imagePath })
			.then(res => {
				this.image = Buffer.from(res.data);
			})
			.catch(err => {
				AppModule.snackbar({ text: err, color: Colors.Error });
			});
	}
}
</script>

<style lang="scss" scoped>
.lyric-body {
	font-family: 'メイリオ', 'ＭＳ Ｐゴシック', sans-serif;
	font-weight: 600;
}

.back-card {
	position: absolute;
	top: 0;
	bottom: 0;
	max-width: calc(100% - 32px);

	left: 50%;
	transform: translate(-50%);
	// margin: 0 auto;
	// width: calc(100% - 32px);
	// margin: auto;
}

.fadeIn-enter-active,
.fadeIn-leave-active {
	transition: all 0.5s;
}

.fadeIn-enter {
	opacity: 0.3;
	transform: translateX(-125%);
}

.fadeIn-leave-to {
	opacity: 0.12;
	transform: translateX(125%);
}

input[type='range'] {
	-webkit-appearance: none; /* Hides the slider so that custom slider can be made */
	position: relative;
	height: 2px;
	background: transparent;
	// background-color: red; /* Otherwise white in Chrome */

	&:focus {
		outline: none;
	}

	&::-webkit-slider-runnable-track {
		height: 2px;
		background: linear-gradient(
			to right,
			transparent 0,
			transparent 7px,
			grey 7px,
			grey calc(100% - 7px),
			transparent calc(100% - 7px),
			transparent 100%
		);
		opacity: 0.75;
		cursor: pointer;
	}

	&::-webkit-slider-thumb {
		-webkit-appearance: none;
		position: relative;
		height: 14px;
		width: 14px;
		border-radius: 50%;
		margin: -6px 0;
		border: 2px outset darkgreen;
		background: #ffffff;
		cursor: pointer;
	}
}
</style>
