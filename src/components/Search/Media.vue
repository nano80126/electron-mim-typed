<template>
	<div>
		<v-row no-gutters align="start" justify="start" class="mr-3">
			<v-col cols="12">
				<v-toolbar flat dense height="40" color="transparent" class="px-0">
					<v-btn
						v-if="!panelWindow"
						icon
						small
						class="ml-n4"
						width="36"
						height="36"
						@click="
							() => {
								this.$emit('update:extendImage', !this.extendImage);
								updateRatio();
							}
						"
					>
						<v-icon>{{ extendImage ? 'fas fa-chevron-right' : 'fas fa-chevron-left' }}</v-icon>
					</v-btn>

					<!-- <v-hover v-model="fieldHover"> -->
					<v-text-field
						v-model="activedURL"
						filled
						rounded
						dense
						hide-details
						placeholder="YouTubeのリンク"
						:class="!panelWindow ? 'ml-3' : 'ml-n4'"
						@mousewheel="mouseWheel"
						@blur="fieldBlur"
					>
						<template v-slot:prepend-inner>
							<v-badge :value="badge" :content="urlIndex + 1" overlap left bottom color="orange">
								<v-hover v-model="badge" close-delay="500">
									<v-icon left color="red" style="cursor:default;">fab fa-youtube</v-icon>
								</v-hover>
							</v-badge>
						</template>

						<template v-slot:append>
							<v-tooltip left>
								<template v-slot:activator="{ on }">
									<v-icon right size="24" color="success" v-on="on" @click="addUrl">
										fas fa-plus
									</v-icon>
								</template>
								<span>{{ $t('total') }}: {{ urlObj.length }}</span>
							</v-tooltip>
						</template>
					</v-text-field>
					<!-- </v-hover> -->

					<v-tooltip left open-delay="300">
						<template v-slot:activator="{ on, attrs }">
							<v-btn
								icon
								outlined
								class="ml-2"
								color="primary lighten-2"
								dark
								width="36"
								height="36"
								@click="openWindow(lyricsObj.obj.title)"
								v-bind="attrs"
								v-on="on"
								style="position:relative;"
							>
								<v-icon small>fab fa-chrome</v-icon>
							</v-btn>
						</template>
						<span>{{ $t('externalBrowser') }}</span>
					</v-tooltip>
				</v-toolbar>
			</v-col>

			<v-col cols="12" class="mt-3 d-flex align-center">
				<!-- <v-chip v-show="fieldHover">{{ urlIndex }}</v-chip> -->
				<v-chip class="mr-2 pr-4" color="light-blue" text-color="white">
					{{ imgSize.width }} &times; {{ imgSize.height }}
					<v-icon right small>fas fa-expand</v-icon>
				</v-chip>

				<v-chip class="mr-2 pr-4" color="light-green" text-color="white">
					{{ $lodash.round(imgZoomRatio * 100, 2) }}
					<v-icon right small>fas fa-percentage</v-icon>
				</v-chip>
				<v-spacer />
				<!--  -->

				<v-tooltip bottom>
					<template v-slot:activator="{ on, attrs }">
						<v-btn
							icon
							outlined
							class="ml-2"
							@click="getVideoImg"
							v-bind="attrs"
							v-on="on"
							:disabled="activedURL == null || activedURL.length == 0"
						>
							<v-icon small>fas fa-photo-video</v-icon>
						</v-btn>
					</template>
					<span>{{ $t('getYouTubeCover') }}</span>
				</v-tooltip>

				<v-tooltip bottom open-delay="300">
					<template v-slot:activator="{ on, attrs }">
						<v-btn
							icon
							outlined
							class="ml-2"
							@click="dialogImage"
							v-bind="attrs"
							v-on="on"
							:disabled="disableDialog"
						>
							<v-icon small>far fa-image</v-icon>
						</v-btn>
					</template>
					<span>{{ $t('selectImage') }}</span>
				</v-tooltip>

				<v-tooltip bottom open-delay="300">
					<template v-slot:activator="{ on, attrs }">
						<v-btn
							icon
							outlined
							class="ml-2"
							:class="{ 'blue-grey darken-2': onRect }"
							:disabled="!imgBuffer"
							@click="onRect = !onRect"
							v-bind="attrs"
							v-on="on"
						>
							<v-icon small style="transform: rotate(90deg)">fas fa-crop-alt</v-icon>
						</v-btn>
					</template>
					<span>{{ $t('avatarImage') }}</span>
				</v-tooltip>

				<v-tooltip bottom open-delay="300">
					<template v-slot:activator="{ on, attrs }">
						<v-btn icon outlined class="ml-2" @click="removeImage" v-bind="attrs" v-on="on">
							<v-icon small>fas fa-times</v-icon>
						</v-btn>
					</template>
					<span>{{ $t('removeImage') }}</span>
				</v-tooltip>

				<!--  -->
				<!-- <v-divider vertical class="mx-2" />
				<v-tooltip bottom open-delay="300">
					<template v-slot:activator="{ on, attrs }">
						<v-btn outlined icon v-bind="attrs" v-on="on" @click="saveMedia">
							<v-icon small>fas fa-download</v-icon>
						</v-btn>
					</template>
					<span>{{ $t('save') }}</span>
				</v-tooltip> -->
			</v-col>
		</v-row>

		<div
			class="min-scroll y info-scroll mt-3 pr-3"
			:style="{ height: `${$root.webHeight - 144}px` }"
			@scroll.stop="showMenu = false"
		>
			<v-row no-gutters align="start" justify="start">
				<v-col cols="12" class="">
					<v-responsive :aspect-ratio="16 / 9">
						<div
							class="image-zone d-flex align-center justify-center pa-3"
							:class="{ 'drag-hover': dragging, 'drag-focus': canPaste }"
						>
							<div
								tabindex="0"
								class="paste-zone"
								@paste="onPaste"
								@focus="canPaste = true"
								@blur="canPaste = false"
								style="outline: 0;"
							/>

							<v-card
								id="imgCard"
								:width="imgBuffer ? 'auto' : '75%'"
								flat
								class="no-select rounded-lg transparent"
								@dragenter.capture="dragging = true"
								@dragleave.capture="dragging = false"
								@drop.capture="dragging = false"
								ref="imgCard"
								@mousedown="rectOn"
								@mouseup="rectOff"
								@mousemove="crossMove"
								@mouseleave="crossReset"
							>
								<transition name="imagFadeIn">
									<v-img
										v-if="imgBuffer"
										:src="`data:image/jpeg;base64,${imgBuffer.toString('base64')}`"
										contain
										:max-width="imgSize.width > 0 ? imgSize.width : null"
										:max-height="imgSize.height > 0 ? imgSize.height : null"
										ref="img"
										v-resize="resize"
										@load="updateRatio"
										style="border-radius: inherit; margin:auto;"
									>
										<template v-if="onRect">
											<div id="small-region" ref="region" />
											<div id="crosshair-h" class="hair" ref="hairH" />
											<div id="crosshair-v" class="hair" ref="hairV" />
											<span id="mousepos" ref="pos" v-text="'X:0, Y:0'" />

											<!-- min size 128 x 128 -->
											<!-- <div id="icon-region" ref="iconRegion" /> -->
											<!-- <span id="mousepos" ref="pos">
												{{ `X:${mousePos.x}, Y:${mousePos.y}` }}
											</span> -->
										</template>
										<div id="small-region-freeze" ref="region-freeze" />
									</v-img>
									<v-card-text
										v-else
										class="text-center grey darken-2 rounded-lg"
										style="width: 100%"
									>
										<template v-if="$t('dragAndDrop')">
											{{ $t('dragAndDrop') }}
											<br />
											<small>Drag image and drop here</small>
										</template>
										<template v-else>
											Drag image and drop here
										</template>
									</v-card-text>
								</transition>

								<input
									ref="file"
									type="file"
									@change="onChange"
									@click.prevent
									title
									accept="image/jpeg, image/png, image/bmp"
								/>
							</v-card>
						</div>
					</v-responsive>
				</v-col>

				<v-col cols="12" class="mt-3">
					<editPanel :urlObjArray.sync="urlObj" />
				</v-col>
				<v-col cols="3" offset="9" xl="2" offset-xl="10" class="mt-3 text-right">
					<v-btn block outlined @click="saveMedia">
						<div style="position: relative;">
							<v-icon class="opa-75">fas fa-list</v-icon>
							<v-icon x-small color="cyan" class="small-icon">fas fa-save</v-icon>
						</div>
						<span class="ml-2  font-weight-bold">{{ $t('save') }}</span>
					</v-btn>
				</v-col>
			</v-row>

			<template v-if="false">
				<div>
					abs: {{ rectAbs }}
					<br />
					%: {{ rectPercent }}
					<br />
					imgSize: {{ imgSize }}
					<br />
					{{ imgBuffer ? imgBuffer.length : 0 }}
				</div>

				<div v-for="(item, index) in lyricsObj.obj" :key="index">
					{{ index != 'lyrics' ? `${index}: ${item}` : null }}
				</div>
				{{ lyricsObj.obj.key }}
				<br />

				<div v-for="item in urlObj" :key="item.id">
					{{ item }}
				</div>
			</template>
		</div>

		<v-menu
			v-model="showMenu"
			left
			absolute
			rounded="0"
			:position-x="menuPos.x"
			:position-y="menuPos.y"
			:close-on-click="false"
			:close-on-content-click="true"
			:nudge-left="2"
		>
			<v-toolbar dense height="36">
				<v-btn text small class="ml-n3 mr-1" color="error" @click="rejectRect">
					<v-icon>fas fa-times</v-icon>
				</v-btn>
				<v-btn text small class="ml-1 mr-n3" color="success" @click="acceptRect">
					<v-icon>fas fa-check</v-icon>
				</v-btn>
			</v-toolbar>
		</v-menu>
	</div>
</template>

<script lang="ts">
import edit from '@/components/Search/Edit.vue';

import { AppModule, Colors } from '@/store/modules/app';
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';

import { IlyricsObjSearched, IyouTubeObj, IsongList, Irectangle } from '@/types/renderer';
import { OutputInfo } from 'sharp';

@Component({
	components: {
		editPanel: edit
	}
})
export default class Media extends Vue {
	/**是否為panel window */
	@Prop({ required: false, default: false }) panelWindow?: boolean;

	/**是否可以切換大圖 */
	@Prop({ required: false, default: true }) canExtendImage?: boolean;

	/**是否使用大圖 */
	@Prop({ required: true }) extendImage!: boolean;

	/**Lyric Object，儲存用 */
	@Prop({ required: true }) lyricsObj!: IlyricsObjSearched;

	/**YouTube obj array */
	private urlObj: IyouTubeObj[] = [{ videoUrl: '' }];
	/**顯示之YouTube url之index */
	private urlIndex = 0;
	/**開啟dialog後，disable按鈕，避免重複開啟 */
	private disableDialog = false;
	/**image buffer */
	private imgBuffer: Buffer | null = null;
	/**是否顯示badge，顯示現在儲存的youtube url數量 */
	private badge = false;
	/**badge隱藏之timeout */
	private badgeTimeout: NodeJS.Timeout | null = null;
	/**是否有圖片將要拉進 */
	private dragging = false;
	/**是否可以貼上？當圖片區域focus時為true */
	private canPaste = false;
	/**是否可以框選icon */
	private onRect = false;
	/**是否開始框選icon */
	private onRectStart = false;

	/**滑鼠位置 */
	// private mousePos = { x: 0, y: 0 };

	/**是否顯示確認menu，確認縮圖範圍 */
	private showMenu = false;
	/**menu 位置 */
	private menuPos = { x: 0, y: 0 };

	/**縮圖Rectangle absolute */
	private rectAbs: Irectangle = { x: 0, y: 0, width: 0, height: 0 };
	/**縮圖Rectangle Percent */
	private rectPercent: Irectangle = { x: 0, y: 0, width: 0, height: 0 };
	/**圖片原始大小 */
	private imgSize = { width: 0, height: 0 };
	/**圖片縮放率 */
	private imgZoomRatio = 0;
	/**當前顯示URL */
	get activedURL(): string {
		return this.urlObj[this.urlIndex].videoUrl || '';
	}
	/**更改當前顯示URL */
	set activedURL(value) {
		if (!value) this.urlObj[this.urlIndex].videoUrl = '';
		else this.urlObj[this.urlIndex].videoUrl = value;
	}

	@Watch('urlIndex')
	onUrlIndexChanged() {
		this.badge = true;

		if (this.badgeTimeout) clearTimeout(this.badgeTimeout);
		this.$nextTick(() => {
			this.badgeTimeout = setTimeout(() => {
				this.badge = false;
			}, 1000);
		});
	}
	@Watch('lyricsObj.obj.lyricsKey')
	onLyricsKeyChanged() {
		this.loadLyricsObj();
	}

	// @Watch('canPaste')
	// onCanPasteChanged(bool: boolean) {
	// 	console.log(bool);
	// }

	mounted() {
		this.loadLyricsObj();
	}

	/**載入歌詞物件，包含影片與圖片 */
	private loadLyricsObj() {
		this.$ipcRenderer
			.invoke('listFindOne', { query: { lyricsKey: this.lyricsObj.obj.lyricsKey } })
			.then((doc: IsongList) => {
				if (doc.imagePath) {
					this.$ipcRenderer
						.invoke('loadBuffer', { path: doc.imagePath })
						.then((res: { data: Buffer; info: OutputInfo }) => {
							this.imgBuffer = Buffer.from(res.data);

							this.$nextTick(() => {
								const { width, height } = res.info;
								this.$set(this.imgSize, 'width', width);
								this.$set(this.imgSize, 'height', height);

								const regionFreeze = this.$refs['region-freeze'] as HTMLElement;
								if (regionFreeze && doc.rectangle) {
									this.rectPercent = doc.rectangle;
									regionFreeze.style.left = `${this.rectPercent.x}%`;
									regionFreeze.style.top = `${this.rectPercent.y}%`;
									regionFreeze.style.width = `${this.rectPercent.width}%`;
									regionFreeze.style.height = `${this.rectPercent.height}%`;
								}
							});
						})
						.catch((err: Error) => {
							this.$store.commit('snackbar', { text: err.message, color: 'error' });
						});
				}
				// 先判斷 videoArr存在
				if (doc.videoArr) this.urlObj = doc.videoArr;
			})
			.catch(error => {
				AppModule.snackbar({ text: error, color: Colors.Error });
			});
	}

	/**開啟外部瀏覽器搜尋 */
	private openWindow(keyWord: string): void {
		const url = `https://www.youtube.com/results?search_query=${keyWord}`;
		this.$shell.openExternal(url);
	}

	/**切換顯示之YouTube URL */
	private mouseWheel(e: MouseWheelEvent): void {
		if (e.deltaY > 0) {
			this.urlIndex = this.urlIndex + 1 > this.urlObj.length - 1 ? this.urlObj.length - 1 : this.urlIndex + 1;
		} else {
			this.urlIndex = this.urlIndex - 1 < 0 ? 0 : this.urlIndex - 1;
		}
	}

	/**URL Text filed不為Focus狀態，呼叫YouTube v3 API */
	private fieldBlur(/*e*/): void {
		// this.urlObj = this.urlObj.filter(o => {
		// 	return o.url && o.url.length > 0;
		// });
		this.urlObj.forEach((item, itemKey: number) => {
			if (item.videoUrl.length > 0) {
				const id = item.videoUrl.match(/(?<=^https:\/\/.+?v=).{11}(?=.*$)/);
				if (id && id[0].length == 11 && item.videoID !== id[0]) {
					this.$axios
						.get('https://www.googleapis.com/youtube/v3/videos', {
							params: { part: 'snippet', id: id[0], key: process.env.VUE_APP_YOUTUBE_DATA_API_KEY }
						})
						.then(res => {
							this.$set(
								this.urlObj,
								itemKey,
								Object.assign(item, { videoID: id[0], videoTitle: res.data.items[0].snippet.title })
							);
						})
						.catch(err => {
							AppModule.snackbar({ text: err, color: Colors.Error });
						});
				}
			} else {
				// 若URL為空，清空title
				this.$set(this.urlObj, itemKey, Object.assign(item, { videoID: undefined, videoTitle: undefined }));
			}
		});
	}

	private addUrl(): void {
		this.urlObj.push({ videoUrl: '' });
		this.urlIndex = this.urlObj.length - 1;
	}

	private async getVideoImg(e: Event): Promise<void> {
		e.preventDefault();
		e.stopPropagation();

		// const videoID = this.urlObj[0].url.match(/(?<=^https:\/\/.+?v=).{11}(?=.*$)/);
		const videoID = this.activedURL.match(/(?<=^https:\/\/.+?v=).{11}(?=.*$)/);
		if (videoID && videoID[0].length == 11) {
			this.$ipcRenderer
				.invoke('videoCover', { ID: videoID })
				.then(res => {
					if (res.Error) {
						AppModule.snackbar({ text: res.message, color: Colors.Error });
						return;
					}
					this.imgBuffer = Buffer.from(res.data);

					const { width, height } = res.info;
					this.$nextTick(() => {
						this.$set(this.imgSize, 'width', width);
						this.$set(this.imgSize, 'height', height);
					});
				})
				.catch(err => {
					AppModule.snackbar({ text: err, color: Colors.Error });
				});
		} else {
			AppModule.snackbar({ text: '無効なURL', color: Colors.Warning });
		}
	}

	private onPaste(e: ClipboardEvent): void {
		e.preventDefault();
		e.stopPropagation();

		const items = e.clipboardData?.files;
		if (items == undefined || items.length == 0) {
			// no items
			AppModule.snackbar({ text: this.$t('noImage') as string, color: Colors.Warning });
			return;
		}

		const file = items[0] as File;
		const reader = new FileReader();

		reader.addEventListener('load', (e: ProgressEvent<FileReader>) => {
			const buf = e.target?.result;

			this.$ipcRenderer
				.invoke('toBuffer', { buffer: buf })
				.then(res => {
					this.imgBuffer = Buffer.from(res.data);

					const { width, height } = res.info;
					this.$nextTick(() => {
						this.$set(this.imgSize, 'width', width);
						this.$set(this.imgSize, 'height', height);
					});
				})
				.catch(err => {
					AppModule.snackbar({ text: err, color: Colors.Error });
				});
		});
		reader.readAsArrayBuffer(file);
		(e.target as HTMLElement).blur();
	}

	private onChange(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		// const items = ((e.target as HTMLInputElement).files || e.dataTransfer.files) as File[];
		const items = (e.target as HTMLInputElement).files;
		if (items && !/^image\/(bmp|jpeg|png)/.test(items[0].type)) {
			AppModule.snackbar({ text: this.$t('invalidImage') as string, color: Colors.Warning });
			return;
		}

		const filePath = items && items[0].path;

		this.$ipcRenderer
			.invoke('toBuffer', { path: filePath })
			.then((res: { data: Buffer; info: OutputInfo }) => {
				this.imgBuffer = Buffer.from(res.data);

				const { width, height } = res.info;
				this.$nextTick(() => {
					this.$set(this.imgSize, 'width', width);
					this.$set(this.imgSize, 'height', height);
				});
			})
			.catch(err => {
				AppModule.snackbar({ text: err, color: Colors.Error });
			});

		(e.target as HTMLInputElement).value = ''; // set file content to null
	}

	private dialogImage() {
		this.disableDialog = true;

		this.$ipcRenderer
			.invoke('dialogImage')
			.then((res: { data: Buffer; info: OutputInfo }) => {
				this.imgBuffer = Buffer.from(res.data);

				const { width, height } = res.info;
				this.$nextTick(() => {
					this.$set(this.imgSize, 'width', width);
					this.$set(this.imgSize, 'height', height);
				});
			})
			.catch(err => {
				AppModule.snackbar({ text: err, color: Colors.Error });
			})
			.finally(() => {
				this.disableDialog = false;
			});
	}

	/**儲存Media資料 */
	private saveMedia(): void {
		if (this.imgBuffer) {
			const x = Math.round((this.imgSize.width * this.rectPercent.x) / 100);
			const y = Math.round((this.imgSize.height * this.rectPercent.y) / 100);
			const w = Math.round((this.imgSize.width * this.rectPercent.width) / 100);
			const h = Math.round((this.imgSize.height * this.rectPercent.height) / 100);

			this.$ipcRenderer
				.invoke('saveImage', {
					buffer: this.imgBuffer,
					key: this.lyricsObj.obj.lyricsKey,
					size: { left: x, top: y, width: w, height: h }
				})
				.then((res: OutputInfo[]) => {
					// if (res.Error) {
					// 	AppModule.snackbar({ text: res.message, color: Colors.Error });
					// 	return;
					// }

					const { obj } = this.lyricsObj;
					const picPath = AppModule.picPath;
					// this.urlObj = this.$lodash.compact(this.urlObj);
					this.urlIndex = 0; // Set index to 0 or maybe return url not in urlObj
					// 移除url為空
					this.urlObj = this.urlObj.filter(e => e.videoUrl && e.videoUrl.length > 0);
					// 去頭尾空白
					this.urlObj.forEach(e => (e.artist = e.artist?.replace(/(^\s+)|(\s+$)/g, '')));

					this.$ipcRenderer
						.invoke('listSave', {
							query: { lyricsKey: obj.lyricsKey },
							data: {
								$set: {
									videoArr: this.urlObj,
									imagePath: res[0] ? `${picPath}\\${obj.lyricsKey}.jpg` : undefined,
									iconPath: res[1] ? `${picPath}\\${obj.lyricsKey}.icon.jpg` : undefined,
									imageSize: this.imgSize,
									rectangle: this.rectPercent,
									datetime: this.$moment().format('YYYY-MM-DD HH:mm:ss')
								}
							}
						})
						.then(res => {
							if (res.ok > 0) {
								AppModule.snackbar({ text: '変更が保存された', color: Colors.Success });
							}
						})
						.catch((err2: Error) => {
							AppModule.snackbar({ text: err2.message, color: Colors.Error });
						});
				})
				.catch((err: Error) => {
					AppModule.snackbar({ text: err.message, color: Colors.Error });

					const { obj } = this.lyricsObj;
					this.$ipcRenderer.send('removeFile', {
						files: [`${obj.lyricsKey}.jpg`, `${obj.lyricsKey}.icon.jpg`]
					});
				});
		} else {
			const { obj } = this.lyricsObj;

			this.urlIndex = 0;
			// 移除url為空
			this.urlObj = this.urlObj.filter(e => e.videoUrl && e.videoUrl.length > 0);
			// 去頭尾空白
			this.urlObj.forEach(e => (e.artist = e.artist?.replace(/(^\s+)|(\s+$)/g, '')));

			this.$ipcRenderer
				.invoke('listSave', {
					query: { lyricsKey: obj.lyricsKey },
					data: {
						$set: {
							videoArr: this.urlObj,
							imagePath: undefined,
							imageSize: undefined,
							rectangle: undefined,
							iconPath: undefined,
							datetime: this.$moment().format('YYYY-MM-DD HH:mm:ss')
						}
					}
				})
				.then(res => {
					if (res.ok > 0) {
						this.$ipcRenderer.send('removeFile', {
							files: [`${obj.lyricsKey}.jpg`, `${obj.lyricsKey}.icon.jpg`]
						});
						AppModule.snackbar({ text: '変更が保存された', color: Colors.Success });
					}
				})
				.catch((err: Error) => {
					AppModule.snackbar({ text: err.message, color: Colors.Error });
				});
		}
	}

	private removeImage(): void {
		this.imgBuffer = null; // 重置 imgBuffer
		this.imgSize.width = this.imgSize.height = 0; // 重置 imgSize
		this.imgZoomRatio = 0; // 重置縮小倍率
		Object.assign(this.rectAbs, { x: 0, y: 0, width: 0, height: 0 }); // 重置 rect
		Object.assign(this.rectPercent, { x: 0, y: 0, width: 0, height: 0 }); // 重置 rect
		// // // // //
		this.onRect = false;
		this.onRectStart = false;
		this.showMenu = false;
	}

	// private iconWheel(e: WheelEvent): void {
	// 	e.preventDefault();
	// 	const width = (this.$refs.iconRegion as HTMLLIElement).clientWidth + 2; // 2 is border
	// 	const height = (this.$refs.iconRegion as HTMLLIElement).clientHeight + 2; // 2 is border

	// 	if (e.deltaY < 0) {
	// 		(this.$refs.iconRegion as HTMLLIElement).style.width = `${width + 20}px`;
	// 		(this.$refs.iconRegion as HTMLLIElement).style.height = `${height + 20}px`;
	// 	} else if (e.deltaY > 0) {
	// 		(this.$refs.iconRegion as HTMLLIElement).style.width = `${width - 20}px`;
	// 		(this.$refs.iconRegion as HTMLLIElement).style.height = `${height - 20}px`;
	// 	}
	// }

	/**mousemove evemt, show mouse position txt, if mousedown capture icon */
	private crossMove(e: MouseEvent): void {
		if (!this.imgBuffer || !this.onRect) return;

		const x = e.offsetX - 2 < 0 ? 0 : e.offsetX - 2;
		const y = e.offsetY - 2 < 0 ? 0 : e.offsetY - 2;
		(this.$refs.hairV as HTMLLIElement).style.left = `${e.offsetX}px`; // crosshairV pos
		(this.$refs.hairH as HTMLLIElement).style.top = `${e.offsetY}px`; // crosshairV pos
		(this.$refs.pos as HTMLLIElement).innerText = `X:${x}, Y:${y}`; // show mouse pos

		if (this.onRectStart) {
			const w = (this.$refs.img as Vue).$el.clientWidth;
			const h = (this.$refs.img as Vue).$el.clientHeight;

			const region = this.$refs.region as HTMLDivElement;

			if (e.offsetX < this.rectAbs.x) region.style.left = `${(100 * e.offsetX) / w}%`;
			else region.style.left = `${(100 * this.rectAbs.x) / w}%`;
			if (e.offsetY < this.rectAbs.y) region.style.top = `${(100 * e.offsetY) / h}%`;
			else region.style.top = `${(100 * this.rectAbs.y) / h}%`;

			this.rectAbs.width = Math.abs(e.offsetX - this.rectAbs.x) + 1;
			this.rectAbs.height = Math.abs(e.offsetY - this.rectAbs.y) + 1;
			region.style.width = `${(100 * this.rectAbs.width) / w}%`;
			region.style.height = `${(100 * this.rectAbs.height) / h}%`;
		}
	}

	/**mouseleave event, reset crosshair, position text */
	private crossReset(e: MouseEvent) {
		if (!this.imgBuffer || !this.onRect) return;

		(this.$refs.hairH as HTMLDivElement).style.top = '0';
		(this.$refs.hairV as HTMLDivElement).style.left = '0';
		(this.$refs.pos as HTMLSpanElement).innerText = 'X:0, Y:0';

		this.rectOff(e);
		// e.buttons & 0b1 左鍵 // mouse leave, show menu
		// if ((e.buttons & 0b01) == 0b01 && this.onRectStart) {
		// 	this.onRectStart = false;
		// 	this.$nextTick(() => {
		// 		this.menuPos.x = e.offsetX < this.rectAbs.x ? e.x + this.rectAbs.width : e.x;
		// 		this.menuPos.y = e.offsetY < this.rectAbs.y ? e.y + this.rectAbs.height : e.y;
		// 		this.showMenu = true;
		// 	});
		// }
	}

	/**mousedown event, start capture region */
	private rectOn(e: MouseEvent) {
		if (!this.imgBuffer || !this.onRect) return;
		// 左鍵按下
		if (e.button == 0) {
			this.onRectStart = true;

			this.$nextTick(() => {
				const w = (this.$refs.img as Vue).$el.clientWidth;
				const h = (this.$refs.img as Vue).$el.clientHeight;

				this.rectAbs.x = e.offsetX - 1;
				this.rectAbs.y = e.offsetY - 1;

				this.rectAbs.width = this.rectAbs.height = 0;
				this.rectPercent.width = this.rectPercent.height = 0;

				const region = this.$refs.region as HTMLDivElement;
				region.style.width = '0';
				region.style.height = '0';
				region.style.left = `${this.rectAbs.x / w}%`;
				region.style.top = `${this.rectAbs.y / h}%`;

				this.$nextTick(() => {
					this.showMenu = false;
				});
			});
		}
	}

	/**mouseup event, check region size and show menu */
	private rectOff(e: MouseEvent) {
		if (!this.imgBuffer || !this.onRect) return;

		// 左鍵放開
		if (e.button == 0 && this.onRectStart) {
			this.onRectStart = false;

			this.$nextTick(() => {
				const region = this.$refs.region as HTMLDivElement;

				this.rectPercent.x = parseFloat(this.$lodash.trimEnd(region.style.left, '%'));
				this.rectPercent.y = parseFloat(this.$lodash.trimEnd(region.style.top, '%'));
				this.rectPercent.width = parseFloat(this.$lodash.trimEnd(region.style.width, '%'));
				this.rectPercent.height = parseFloat(this.$lodash.trimEnd(region.style.height, '%'));

				this.menuPos.x = e.offsetX < this.rectAbs.x ? e.x + this.rectAbs.width : e.x;
				this.menuPos.y = e.offsetY < this.rectAbs.y ? e.y + this.rectAbs.height : e.y;
				this.$nextTick(() => {
					if (this.rectAbs.width <= 5 || this.rectAbs.height <= 5) return;
					else if (
						(this.imgSize.width * this.rectPercent.width) / 100 >= 128 &&
						(this.imgSize.height * this.rectPercent.height) / 100 >= 128
					) {
						this.showMenu = true;
					} else {
						AppModule.snackbar({ text: 'サイズが足りない(128x128以上)', color: Colors.Info });
					}
				});
			});
		}
	}

	private updateRatio() {
		this.$nextTick(() => {
			if (this.$refs.img) {
				this.imgZoomRatio = (this.$refs.img as Vue).$el.clientWidth / this.imgSize.width;
			}
		});
	}

	private resize = this.$lodash.debounce(() => {
		this.showMenu = false;
		this.updateRatio();
	}, 300);

	private rejectRect() {
		// Object.keys(this.rectAbs).forEach(k => (this.rectAbs[k] = 0));
		// Object.keys(this.rectPercent).forEach(k => (this.rectPercent[k] = 0));
		Object.assign(this.rectAbs, { x: 0, y: 0, width: 0, height: 0 });
		Object.assign(this.rectPercent, { x: 0, y: 0, width: 0, height: 0 });
	}

	private acceptRect() {
		const regionFreeze = this.$refs['region-freeze'] as HTMLDivElement;
		regionFreeze.style.left = `${this.rectPercent.x}%`;
		regionFreeze.style.top = `${this.rectPercent.y}%`;
		regionFreeze.style.width = `${this.rectPercent.width}%`;
		regionFreeze.style.height = `${this.rectPercent.height}%`;
		// set temp rect min
		const region = this.$refs.region as HTMLDivElement;
		region.style.width = region.style.height = '0';
		//
		this.onRect = false;
	}
}
</script>

<style lang="scss" scoped>
.image-zone {
	position: relative;
	height: 100%;
	width: 100%;
	border: 2px dashed grey;
	border-radius: 5px;
	user-select: all;
}

.drag-hover {
	background-color: rgba($color: grey, $alpha: 0.24);
}

.drag-focus {
	border-color: lightblue;

	&::before {
		content: 'ペースト (Ctrl + V)';
		padding-top: 10%;
		font-size: 16px;
		font-weight: 900;
		color: rgba($color: grey, $alpha: 0.48);
		text-align: center;
		position: absolute;
		border-radius: 8px;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		border: 10px solid rgba($color: orange, $alpha: 0.24);
	}
}

.paste-zone {
	position: absolute;
	width: 100%;
	height: 100%;
	// z-index: 51;
}

input[type='file'] {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 100%;
	opacity: 0;
	border-radius: inherit;
	// border: 1px solid blue;
}

#icon-region {
	position: absolute;
	top: calc(50% - 64px);
	left: calc(50% - 64px);
	width: 128px;
	height: 128px;
	// margin-top: -2px;
	// margin-left: -2px;
	border: 1px solid rgba(cyan, 0.48);
	background-color: rgba(darkcyan, 0.24);
}

#small-region {
	position: absolute;
	top: 0;
	left: 0;
	margin-top: -2px;
	margin-left: -2px;
	border: 1px solid rgba(grey, 0.48);
	background-color: rgba(darkgray, 0.24);
}

#small-region-freeze {
	position: absolute;
	top: 0;
	left: 0;
	margin-top: -2px;
	margin-left: -2px;
	border: 1px solid rgba(darkgreen, 0.72);
	background-color: rgba(green, 0.12);
	// background-color: rgba(green, 0.48);
}

#crosshair-v {
	height: 110%;
}

#crosshair-h {
	width: 110%;
}

.hair {
	position: absolute;
	top: 0;
	left: 0;
	margin-top: -2px;
	margin-left: -2px;
	background: transparent;
	border-top: 1px dotted #888;
	border-left: 1px dotted #888;
	pointer-events: none;
}

#mousepos {
	position: absolute;
	top: 0;
	left: 0;
	padding: 5px;
	margin: 8px;
	font: 14px arial;
	color: #fff;
	background: rgba(0, 0, 0, 0.5);
	border-radius: 24px;
}

.imagFadeIn-enter-active {
	transition: all 0.7s;
}

.imagFadeIn-enter {
	opacity: 0.15;
	transform: scale(0.1, 0.1);
}

.small-icon {
	position: absolute;
	right: -5px;
	bottom: -3px;
}
</style>
