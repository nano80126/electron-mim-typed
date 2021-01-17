<template>
	<div>
		<v-card-actions>
			<v-list class="py-0" dense width="100%" color="transparent">
				<v-list-item :disabled="!player">
					<v-list-item-content class=" col col-lg-6">
						<div class="d-flex align-center progress-container">
							<span>{{ $moment.utc(progressCurr * 1000).format('mm:ss') }}</span>
							<v-progress-linear
								v-model="progress"
								class="my-0 mx-3"
								height="4"
								@change="progressChange"
								style="cursor: pointer;"
							/>
							<span>{{ $moment.utc(progressMax * 1000).format('mm:ss') }}</span>
						</div>
					</v-list-item-content>

					<!-- <v-spacer v-show="$root.webWidth >= 1264" /> -->

					<!-- random text color -->
					<!-- vuetify lg breakpoint >= 1264  -->
					<v-list-item-content
						v-show="$root.webWidth >= 1264"
						class="col-1 col-lg-2 mx-lg-auto"
						:class="`${randomColor}--text`"
						style="position: relative;"
					>
						<span class="video-title">{{ videoTitle }}</span>
					</v-list-item-content>

					<v-list-item-icon class="mr-3 align-center">
						<v-menu
							open-on-hover
							top
							offset-y
							:close-on-content-click="false"
							nudge-left="42"
							nudge-top="10"
							close-delay="1500"
						>
							<template v-slot:activator="{ on, attrs }">
								<v-btn icon @click="volumeToggle" v-bind="attrs" v-on="on" :disabled="!player">
									<v-icon small v-if="volume > 40">fas fa-volume-up</v-icon>
									<v-icon small v-else-if="volume > 0">fas fa-volume-down</v-icon>
									<v-icon small v-else>fas fa-volume-mute</v-icon>
								</v-btn>
							</template>
							<v-card width="120px" class="px-1 no-drag" style="overflow: hidden;" color="grey darken-2">
								<v-slider v-model="volume" color="grey lighten-2" hide-details />
								<!-- @end="volumeChange"
									@click="volumeChange" -->
							</v-card>
						</v-menu>
					</v-list-item-icon>

					<!-- {{ playState }}
					{{ $store.state.playState }} -->
					<!-- {{ sheet }} -->

					<!-- <v-list-item-icon class="align-center">
					<v-btn icon @click="backward10">
						<v-icon small>fas fa-backward</v-icon>
					</v-btn>
				</v-list-item-icon> -->

					<v-list-item-icon class="align-center">
						<v-btn icon @click="backward10" :disabled="!player">
							<v-icon small>fas fa-backward</v-icon>
						</v-btn>
						<!--  -->
						<v-btn icon v-if="canPlay" @click="videoStart" :disabled="!player">
							<v-icon small v-if="playState == 2 || playState == 5">fas fa-play</v-icon>
							<v-icon small v-else>fas fa-undo</v-icon>
						</v-btn>
						<v-btn icon v-else @click="videoPause" :disabled="!player">
							<v-icon small>fas fa-pause</v-icon>
						</v-btn>
						<!--  -->
						<v-btn icon @click="forward10" :disabled="!player">
							<v-icon small>fas fa-forward</v-icon>
						</v-btn>

						<v-menu top left offset-y nudge-top="10">
							<template v-slot:activator="{ attrs, on }">
								<v-btn icon v-bind="attrs" v-on="on" :disabled="!player">
									<v-icon small> fas fa-ellipsis-h</v-icon>
								</v-btn>
							</template>
							<v-list width="250px" flat class="py-0 grey darken-2">
								<v-list-item @click.prevent="toggleLoop">
									<v-list-item-title class="d-flex">
										<v-icon small class="mr-3">fas fa-retweet</v-icon>
										<span>{{ $t('loop') }}</span>
										<v-icon v-show="loop" class="ml-auto" small>fas fa-check</v-icon>
									</v-list-item-title>
								</v-list-item>
								<v-list-item @click.prevent="toggleShuffle">
									<v-list-item-title class="d-flex">
										<v-icon small class="mr-3">fas fa-random</v-icon>
										<span>{{ $t('shuffle') }}</span>
										<v-icon v-show="shuffle" class="ml-auto" small>fas fa-check</v-icon>
									</v-list-item-title>
								</v-list-item>
							</v-list>
						</v-menu>
					</v-list-item-icon>

					<!-- <v-list-item-icon class="ml-0 align-center">
					<v-btn icon @click="forward10">
						<v-icon small>fas fa-forward</v-icon>
					</v-btn>
				</v-list-item-icon> -->
				</v-list-item>
			</v-list>
		</v-card-actions>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { PlayerModule } from '@/store/modules/player';
import { AppModule } from '@/store/modules/app';

@Component
export default class Embed extends Vue {
	/**YouTUbe 影片ID */
	@Prop() videoID?: string;

	/**是否以sheet為容器(App.vue) */
	@Prop() sheet?: boolean;

	/**音樂目前播放時間 */
	private progressCurr = 0;
	/**音樂最大播放時間 */
	private progressMax = 0;

	/**音量 */
	// private volume = 75;
	/**音量(backup) */
	private volumeBack = 75;

	/**文字顏色，移除末項黑色 */
	private colors: Readonly<Array<string>> = this.$root.$data.colors;

	/**播放狀態 */
	private playState = -1;
	// private s = stata.a;

	get videoTitle() {
		return AppModule.videoTitle;
	}

	get randomColor() {
		// 長度-1及不包含黑色
		const r = this.$lodash.random(this.colors.length - 2);
		return this.colors[r];
	}

	/**播放器 */
	get player() {
		return PlayerModule.player;
	}

	/**播放器是否可播放 */
	get canPlay() {
		return this.playState == 0 || this.playState == 2 || this.playState == 5;
	}

	/**循環狀態 */
	get loop(): boolean {
		return PlayerModule.playerLoop;
	}

	set loop(value) {
		PlayerModule.videoLoop(value);
	}

	/**隨機播放狀態 */
	get shuffle(): boolean {
		return PlayerModule.playerShuffle;
	}

	set shuffle(value) {
		PlayerModule.videoShuffle(value);
	}

	/**播放進度條 */
	get progress() {
		return (this.progressCurr / this.progressMax) * 100;
	}

	set progress(value) {
		this.progressCurr = (this.progressMax * value) / 100;
	}

	get volume() {
		return PlayerModule.volume;
	}

	set volume(value) {
		PlayerModule.videoSetVolume(value);
	}

	@Watch('$store.getters.playState')
	onPlayStateChange(state: number) {
		this.playState = state;

		PlayerModule.clearIntervalArr();
		switch (state) {
			case -1:
				this.progress = 0;
				this.$nextTick(() => (this.progressMax = 0));
				break;
			case 0:
				this.progressCurr = this.progressMax;
				break;
			case 1:
				PlayerModule.pushIntervalArr(
					setInterval(() => {
						this.progressCurr = PlayerModule.player?.getCurrentTime() || this.progressCurr;
					}, 250)
				);
				this.progressMax = this.player?.getDuration() || this.progressMax;
				break;
			case 5:
				this.progressMax = this.player?.getDuration() || this.progressMax;
				break;
		}
	}

	/**if sheet changed, trigger when user operating in Search.vue */
	@Watch('sheet')
	onSheetChange(value: boolean) {
		if (value) this.CheckPlayer();
	}

	/**if videoID changed, trigger when user operating in List.vue*/
	@Watch('videoID')
	onVideoIDChange(value?: string) {
		if (value?.length == 11) {
			if (!PlayerModule.player) {
				this.IframeAPIReady(value);
			} else {
				this.progressCurr = 0;
				PlayerModule.cuePlayerByID(value);
			}
		}
	}

	mounted() {
		if (!PlayerModule.player && this.videoID) {
			this.IframeAPIReady(this.videoID);
		} else {
			this.CheckPlayer();
		}
	}

	beforeDestroy() {
		PlayerModule.clearIntervalArr();
	}

	// methods
	private IframeAPIReady(id: string) {
		if (!id) return;

		const youtube = window.YT;
		// new youtube.Player(,)

		const py = new youtube.Player('youtube-audio', {
			// height: 20,
			// width: 500,
			videoId: id,
			playerVars: {
				enablejsapi: 1,
				autoplay: 0,
				controls: 0,
				loop: 0,
				fs: 0,
				rel: 0,
				disablekb: 1,
				origin: 'https://www.youtube.com',
				playsinline: 1,
				modestbranding: 1,
				// eslint-disable-next-line @typescript-eslint/camelcase
				cc_load_policy: 0,
				// eslint-disable-next-line @typescript-eslint/camelcase
				iv_load_policy: 0
			},
			events: {
				onReady: e => {
					e.target.setPlaybackQuality('small');
					e.target.setVolume(this.volume);
					// this.$store.state.player.playerState = 5;
					// PlayerModule.playerState = 5;
					PlayerModule.changeState(5); // 5: 可播放
					AppModule.setVideoID(id); // 更新video id
				}
			}
		});
		PlayerModule.creatPlayer(py);
	}

	/**確認播放器狀態、參數 */
	private CheckPlayer() {
		// const player = this.$store.state.player.player;
		const player = PlayerModule.player;
		if (player) {
			this.playState = player.getPlayerState();
			this.volumeBack = player.getVolume();
			this.progressCurr = player.getCurrentTime();
			this.progressMax = player.getDuration();

			switch (this.playState) {
				case 0:
					this.progressCurr = this.progressMax;
					break;
				case 1:
					PlayerModule.pushIntervalArr(
						setInterval(() => {
							this.progressCurr = PlayerModule.player?.getCurrentTime() || this.progressCurr;
						}, 250)
					);
					break;
			}
		}
	}

	/**切換靜音 */
	private volumeToggle() {
		if (!this.player) return;

		// 0 or BackVolume切換
		if (this.volume > 0) {
			this.volumeBack = this.volume;
			PlayerModule.videoSetVolume(0);
		} else {
			PlayerModule.videoSetVolume(this.volumeBack);
		}
	}

	/**變更音量, 保留待刪 */
	// private volumeChange() {
	// 	if (!this.player) return;

	// 	if (this.volume > 0) this.volumeBack = this.volume;
	// 	PlayerModule.videoSetVolume(this.volume);
	// }

	/**開始播放 */
	private videoStart() {
		PlayerModule.playVideo();
	}
	/**暫停播放 */
	private videoPause() {
		PlayerModule.pauseVideo();
	}
	/**倒退10sec */
	private backward10() {
		PlayerModule.backward10();
	}
	/**快進10sec */
	private forward10() {
		PlayerModule.forward10();
	}
	/**切換Loop */
	private toggleLoop() {
		this.shuffle = false;
		this.loop = !this.loop;
	}
	/**切換Shuffle */
	private toggleShuffle() {
		this.loop = false;
		this.shuffle = !this.shuffle;
	}

	/**進度條變更 */
	private progressChange(e: number) {
		PlayerModule.videoProgress((this.progressMax * e) / 100);
		// this.$root.$player.seekTo((this.progressMax * e) / 100);
	}
}
</script>

<style lang="scss" scoped>
.v-list--disabled {
	// 進度調
	.progress-container {
		opacity: 0.3 !important;
	}

	// 控制按鈕
	button > span > i {
		color: rgba(255, 255, 255, 0.3) !important;
	}
}

.video-title {
	position: absolute;
	// width: 100%;
	white-space: nowrap;
	animation: marqee 5s linear infinite;
}

@keyframes marqee {
	0% {
		margin-left: 100%;
		transform: translateX(0%);
	}
	100% {
		margin-left: 0;
		transform: translateX(-100%);
	}
}
</style>
