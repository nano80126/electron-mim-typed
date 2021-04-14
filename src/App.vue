<template>
	<div v-show="SHOW">
		<v-app>
			<v-app-bar
				v-if="isElectron"
				app
				flat
				height="32"
				color="blue-grey"
				:class="isDarkMode ? 'darken-4' : 'lighten-4'"
			>
				<!-- :class="isDarkMode ? 'darken-4' : 'lighten-2'" -->
				<div class="window-drag header ml-n4" />

				<!-- <v-app-bar-nav-icon class="hidden-lg-and-up" @click.stop="drawer = !drawer">
				<v-icon small>fas fa-bars</v-icon>
				</v-app-bar-nav-icon> -->

				<!-- <div class="d-flex align-center" style="">
					<span class="mr-2">
						<v-icon color="yellow darken-2" small>fas fa-sun</v-icon>
					</span>
					<v-switch class="no-drag" color="white" inset hide-details @change="switchDark" />
					<span class="ml-n2">
						<v-icon color="grey darken-2" small>fas fa-moon</v-icon>
					</span>
				</div> -->
				<v-spacer />

				<v-btn min-width="24" width="36" text class="no-drag" small @click="windowMin">
					<v-icon x-small>far fa-window-minimize</v-icon>
				</v-btn>
				<!--  -->
				<v-btn
					v-if="$root.windowIsMax"
					min-width="24"
					width="36"
					text
					class="no-drag"
					small
					@click="windowRestore"
				>
					<v-icon x-small>far fa-window-restore</v-icon>
				</v-btn>
				<v-btn v-else min-width="24" width="36" text class="no-drag" small @click="windowMax">
					<v-icon x-small>far fa-window-maximize</v-icon>
				</v-btn>
				<!--  -->
				<v-btn min-width="24" width="36" text class="no-drag mr-n4" small @click="windowHide">
					<v-icon x-small>fas fa-times</v-icon>
				</v-btn>

				<!-- <v-toolbar-title class="mr-10">
					<span>{{ Title }}</span>
				</v-toolbar-title>

				<v-btn text to="/" active-class="font-weight--black primary--text text--lighten-2">
					<span class="mr-2">面板</span>
					<v-icon small>fas fa-tachometer-alt</v-icon>
				</v-btn>

				<v-btn text to="/chart" active-class="font-weight-black primary--text text--lighten-2">
					<span class="mr-2">爐溫曲線圖</span>
					<v-icon small>fas fa-chart-line</v-icon>
				</v-btn>

				<v-spacer />
				<v-btn v-if="$store.state.isElectron" text to="/connect" active-class="font-weight--black">
					<span class="mr-2">連線</span>
					<v-icon small>fas fa-network-wired</v-icon>
				</v-btn>

				<v-btn v-if="$store.state.isElectron" text @click="lineNotifyWindow">
					<span class="mr-2">Line連動</span>
					<v-icon small>fab fa-line</v-icon>
				</v-btn> -->

				<!-- below for login -->
				<!-- <v-btn v-if="isLogin" text @click="logout">
					<span class="mr-2">登出</span>
					<v-icon small>fas fa-walking</v-icon>
				</v-btn>

				<v-btn v-else text @click="dialogModal = true">
					<span class="mr-2">登入</span>
					<v-icon small>fas fa-user</v-icon>
				</v-btn> -->
			</v-app-bar>

			<v-navigation-drawer
				app
				permanent
				mini-variant
				mini-variant-width="64"
				:class="isDarkMode ? 'brown darken-2' : 'blue-grey lighten-3'"
			>
				<!-- class="brown" -->
				<div class="window-drag left" />
				<!--  -->
				<v-list flat class="no-drag mt-8">
					<v-tooltip right transition="scroll-x-transition" open-delay="300">
						<template v-slot:activator="{ attrs, on }">
							<v-list-item to="/overall" exact v-bind="attrs" v-on="on">
								<v-list-item-content>
									<v-icon small>fas fa-desktop</v-icon>
								</v-list-item-content>
							</v-list-item>
						</template>
						<span>總體</span>
					</v-tooltip>

					<v-divider class="mx-3"></v-divider>

					<v-tooltip right transition="scroll-x-transition" open-delay="300">
						<template v-slot:activator="{ attrs, on }">
							<v-list-item to="/hiper" exact v-bind="attrs" v-on="on">
								<v-list-item-content style="position: relative;">
									<v-icon small>fas fa-fire-alt</v-icon>
									<!-- <img src="./assets/HIPER.png" width="32" /> -->
									<span
										class="subtitle-2 font-weight-black primary--text"
										style="position:absolute; right:5%; bottom: 5%;"
									>
										H
									</span>
								</v-list-item-content>
							</v-list-item>
						</template>
						<span>恆普</span>
					</v-tooltip>

					<v-tooltip right transition="scroll-x-transition" open-delay="300">
						<template v-slot:activator="{ attrs, on }">
							<v-list-item to="/vtech" exact v-bind="attrs" v-on="on">
								<v-list-item-content style="position: relative;">
									<v-icon small>fas fa-fire-alt</v-icon>
									<!-- <v-img src="./assets/VTECH.png"></v-img> -->
									<span
										class="subtitle-2 font-weight-black primary--text"
										style="position:absolute; right:5%; bottom: 5%;"
									>
										V
									</span>
								</v-list-item-content>
							</v-list-item>
						</template>
						<span>宏倫</span>
					</v-tooltip>
				</v-list>

				<template v-slot:append>
					<!-- <v-list flat class="no-drag">
						<v-menu rounded right min-width="150" v-model="menu" close-on-click top offset-x>
							<template v-slot:activator="{ on: menu, attrs }">
								<v-tooltip right transition="scroll-x-transition" open-delay="300">
									<template v-slot:activator="{ on: tooltip }">
										<v-list-item v-bind="attrs" v-on="{ ...tooltip, ...menu }">
											<v-list-item-content>
												<v-icon small>fas fa-ellipsis-h</v-icon>
											</v-list-item-content>
										</v-list-item>
									</template>
									<span>設定</span>
								</v-tooltip>
							</template>
							<v-list dense>
								<v-list-item class="blue">
									<v-list-item-content>123</v-list-item-content>
									<v-list-item-action>
										<v-switch color="white" hide-details @change="switchDark" />
									</v-list-item-action>
								</v-list-item>

								<v-list-item v-if="!isLogin" @click="dialogModal = true">
									<v-list-item-content>
										<span>登入</span>
									</v-list-item-content>
									<v-list-item-action>
										<v-icon small>fas fa-sign-in-alt</v-icon>
									</v-list-item-action>
								</v-list-item>

								<v-list-item v-else @click="logout">
									<v-list-item-content>
										<span>登出</span>
									</v-list-item-content>
									<v-list-item-action>
										<v-icon small>fas fa-sign-out-alt</v-icon>
									</v-list-item-action>
								</v-list-item>
							</v-list>
						</v-menu>
					</v-list> -->

					<!-- 
					<v-list flat class="no-drag">
						<v-tooltip right transition="scroll-x-transition" open-delay="300">
							<template v-slot:activator="{ attrs, on }">
								<v-list-item v-bind="attrs" v-on="on"> </v-list-item>
							</template>
						</v-tooltip>
					</v-list> -->

					<v-list flat class="no-drag">
						<v-tooltip right transition="scroll-x-transition" open-delay="300">
							<template v-slot:activator="{ attrs, on }">
								<v-list-item v-if="isDarkMode" v-bind="attrs" v-on="on" @click="isDarkMode = false">
									<v-badge color="transparent" overlap style="width: 100%;">
										<template v-slot:badge>
											<v-icon x-small color="grey darken-4">fas fa-moon</v-icon>
										</template>
										<v-list-item-content>
											<v-icon small>fas fa-adjust</v-icon>
										</v-list-item-content>
									</v-badge>
								</v-list-item>
								<v-list-item v-else v-bind="attrs" v-on="on" @click="isDarkMode = true">
									<v-badge color="transparent" overlap style="width: 100%;">
										<template v-slot:badge>
											<v-icon x-small color="yellow darken-4">fas fa-sun</v-icon>
										</template>
										<v-list-item-content>
											<v-icon small>fas fa-adjust</v-icon>
										</v-list-item-content>
									</v-badge>
								</v-list-item>
							</template>
							<span v-text="isDarkMode ? 'Noraml mode' : 'Dark mode'"></span>
						</v-tooltip>

						<!-- 登入 / 登出 -->
						<v-tooltip v-if="!isLogin" right transition="scroll-x-transition" open-delay="300">
							<template v-slot:activator="{ attrs, on }">
								<v-list-item v-bind="attrs" v-on="on" @click="dialogModal = true">
									<v-list-item-content>
										<v-icon small>fas fa-sign-in-alt</v-icon>
									</v-list-item-content>
								</v-list-item>
							</template>
							<span>登入</span>
						</v-tooltip>

						<v-tooltip v-else right transition="scroll-x-transition" open-delay="300">
							<template v-slot:activator="{ attrs, on }">
								<v-list-item v-bind="attrs" v-on="on" @click="logout">
									<v-list-item-content>
										<v-icon small>fas fa-sign-out-alt</v-icon>
									</v-list-item-content>
								</v-list-item>
							</template>
							<span>登出</span>
						</v-tooltip>
					</v-list>

					<!-- <v-list v-else flat class="no-drag">
						<v-tooltip right transition="scroll-x-transition" open-delay="300">
							<template v-slot:activator="{ attrs, on }">
								<v-list-item v-bind="attrs" v-on="on" @click="logout">
									<v-list-item-content>
										<v-icon small>fas fa-sign-out-alt</v-icon>
									</v-list-item-content>
								</v-list-item>
							</template>
							<span>登出</span>
						</v-tooltip>
					</v-list> -->
				</template>
			</v-navigation-drawer>

			<!-- class="grey lighten-3" -->
			<v-main :class="{ error: errorOccured }">
				<!-- :class="{ error: errorBack }" -->
				<v-overlay v-model="overlay" opacity="0.3" absolute>
					<v-progress-circular indeterminate color="primary" :class="isDarkMode ? 'lighten-2' : 'darken-2'" />
				</v-overlay>
				<!-- <div ref="scrollPage" class="min-scroll primary-scroll" 
                style="overflow-x:hidden; overflow-y:auto;"> -->
				<!-- :style="{ height: contentHeight }" -->
				<!-- <router-view class="pa-3" /> -->
				<!-- </div> -->
				<!-- <div class="min-scroll primary-scroll" :style="{ height: `${$root.webHeight - 38}px` }"> -->
				<router-view />
				<!-- </div> -->
			</v-main>

			<audio ref="alarmAudio" hidden controls preload="auto" loop src="@/assets/alarm.mp3" />

			<v-dialog v-model="dialogModal" persistent max-width="450px">
				<form @submit="loginCheck">
					<v-card>
						<v-card-title class="font-weight-bold">
							登入
						</v-card-title>
						<v-card-text>
							<v-text-field
								ref="userfield"
								v-model="loginUser"
								label="User"
								dense
								outlined
								required
								@keydown.enter.prevent="$refs.passfield.focus()"
							/>
							<!-- @keydown.enter.prevent="$refs.passfield.focus()" -->

							<!-- prevent 避免 submit -->
							<v-text-field ref="passfield" v-model="loginPass" dense label="Pass" outlined required />
						</v-card-text>
						<v-divider />
						<v-card-actions>
							<v-btn color="error darken-1" text @click="dialogModal = false">
								<span class="mr-2">CLOSE</span>
								<v-icon>fas fa-times</v-icon>
							</v-btn>
							<v-spacer />
							<v-btn ref="loginbtn" color="success darken-1" text type="submit">
								<span class="mr-2">LOGIN</span>
								<v-icon>fas fa-leaf</v-icon>
							</v-btn>
						</v-card-actions>
					</v-card>
				</form>
			</v-dialog>

			<!-- <v-snackbar
				v-for="(snack, idx) in this.$store.state.snackbars"
				:key="`snack${idx}`"
				v-model="snack.show"
				top
				right
				:color="snack.color"
				:timeout="snack.timeout"
				:style="{ top: snack.top }"
			>
				{{ snack.text }}
				<v-btn text @click="snack.show = false">Close</v-btn>
			</v-snackbar> -->

			<transition-group name="slideRight">
				<template v-for="(n, idx) in snackbars">
					<v-snackbar
						app
						:key="`snack${idx}`"
						v-if="n.show"
						v-model="n.show"
						right
						bottom
						absolute
						:color="n.color"
						:timeout="n.timeout"
						:style="{ top: `-${55 + (10 + 50) * (idx - barsHidden)}px` }"
					>
						{{ `${n.text}` }}
						<template v-slot:action="{ attrs }">
							<v-btn text v-bind="attrs" @click="n.show = false">Close</v-btn>
						</template>
					</v-snackbar>
				</template>
			</transition-group>

			<!-- 開發環境才顯示 -->
			<div v-if="isDev" class="fixed-right-bottom">
				{{ loginUser }}
				{{ loginPass }}

				<span>Electron?</span>
				{{ isElectron }}
				<!-- <span class="ml-2">Resolution:</span> -->
				{{ $root.webWidth }} x {{ $root.webHeight }}
				<!-- &lt; = &gt; {{ screenWidth }} x -->
				<!-- {{ screenHeight }} -->
				<span class="ml-2" v-text="'breakpoint:'" />
				{{ $vuetify.breakpoint.name }}
			</div>
		</v-app>
	</div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { AppModule, Colors } from './store/modules/app';

@Component({})
export default class App extends Vue {
	/**Show after mounted */
	private SHOW = false;

	/**是否顯示menu */
	private menu = false;
	/** */
	private Toolbar = false;
	/**Serve end / client end */
	private Title = process.env.IS_ELECTRON ? '伺服端' : '客戶端';
	/**是否顯示modal */
	private dialogModal = false;
	/**警報是否發生 */
	private errorOccured = false;

	/**登入使用者 */
	private loginUser: string | null = null;
	/**使用者密碼 */
	private loginPass: string | null = null;

	/**是否為開發環境 */
	get isDev() {
		return process.env.NODE_ENV == 'development';
	}

	/**是否為electron */
	get isElectron() {
		return AppModule.isElectron;
	}

	get isLogin(): boolean {
		return AppModule.loginAuth;
	}

	get overlay(): boolean {
		return AppModule.overlay;
	}

	get snackbars() {
		return AppModule.snackbars;
	}

	get barsHidden(): number {
		return AppModule.barsHidden;
	}
	/**是否dark mode */
	get isDarkMode() {
		return this.$vuetify.theme.dark;
	}
	/*設定dark mode */
	set isDarkMode(bool: boolean) {
		this.$vuetify.theme.dark = bool;
	}

	@Watch('dialogModal')
	onModalChanged(bool: boolean) {
		if (!bool) {
			this.loginUser = null;
			this.loginPass = null;
		}
	}

	@Watch('$store.getters.barsVisible')
	onBarsVisibleChanged(value: number) {
		if (value == 0) AppModule.emptySnackbars();
	}

	created() {
		if (AppModule.isElectron) {
			// AppModule.changeOverlay(true);
		}
	}

	mounted() {
		//
		this.SHOW = true;
		//
		this.$root.$on('alarmToggle', () => {
			const audio = this.$refs.alarmAudio as HTMLAudioElement;
			if (audio.paused) audio.play();
			else audio.pause();
		});

		this.$root.$on('alarmOn', () => {
			const audio = this.$refs.alarmAudio as HTMLAudioElement;
			if (audio.paused) {
				this.errorOccured = true;
				audio.play();
			}
		});

		this.$root.$on('alarmOff', () => {
			const audio = this.$refs.alarmAudio as HTMLAudioElement;
			if (!audio.paused) {
				this.errorOccured = false;
				audio.pause();
			}
		});
	}

	/**縮小視窗 */
	private windowMin() {
		this.$ipcRenderer.send('windowMin');
	}
	/**全螢幕視窗 */
	private windowMax() {
		this.$ipcRenderer.send('windowMax');
	}
	/**恢復視窗 */
	private windowRestore() {
		this.$ipcRenderer.send('windowRestore');
	}
	/**隱藏視窗 */
	private windowHide() {
		this.$ipcRenderer.send('windowHide');
	}
	/**關閉程式 */
	private appClose() {
		this.$ipcRenderer.send('appClose');
	}

	private loginCheck(e: Event) {
		e.preventDefault();
		//
		if (AppModule.isElectron) {
			this.$ipcRenderer
				.invoke('loginCheck', { user: this.loginUser, pass: this.loginPass })
				.then(login => {
					AppModule.changeLoginAuth(login);
					if (login) {
						AppModule.snackbar({ text: '登入成功', color: Colors.Success });
					} else {
						AppModule.snackbar({ text: '帳號或密碼錯誤', color: Colors.Error });
					}
				})
				.finally(() => {
					this.loginUser = null;
					this.loginPass = null;
					this.dialogModal = false;
				});
		}
	}

	private logout() {
		//
		AppModule.changeLoginAuth(false);
		AppModule.snackbar({ text: '登出成功', color: Colors.Info });
	}
}
</script>

<style lang="scss" scoped>
.fixed-right-bottom {
	position: fixed;
	font-weight: bold;
	right: 20px;
	bottom: 0;
	opacity: 0.5;
}

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

// .navbar {
// 	padding: 0;
// 	.navbar-brand {
// 		min-width: 16.666667%;
// 		padding: 0 0 0 1.5rem;
// 		color: white;
// 		text-shadow: 1px 1px 2px darkred, -1px -1px 2px lightpink;
// 		font-size: 1.5rem;

// 		//只有字體大小
// 		@media all and (max-width: 1680px) {
// 			font-size: 1.7142rem;
// 		}
// 		@media all and (max-width: 1440px) {
// 			font-size: 2rem;
// 		}
// 		@media all and (max-width: 1200px) {
// 			font-size: 2.4rem;
// 		}
// 		@media all and (max-width: 960px) {
// 			font-size: 3rem;
// 		}
// 		@media all and (max-width: 720px) {
// 			font-size: 4rem;
// 		}
// 		small {
// 			margin-left: 1rem;
// 		}
// 	}
//
// 	.navbar-collapse {
// 		.navbar-nav {
// 			display: flex;
// 			align-items: center;
// 			justify-content: flex-end;
// 			li {
// 				position: relative;
// 				flex-basis: 0;
// 				flex-grow: 1;
// 				max-width: 100%;
// 				white-space: nowrap;
// 				padding: 0 0.75rem;
// 			}
// 			.link-items {
// 				min-width: 60%;
// 				@media all and (max-width: 1600px) {
// 					min-width: 73.333%;
// 				}
// 				@media all and (max-width: 1280px) {
// 					min-width: 80%;
// 				}
// 				li {
// 					@media all and (min-width: 1200px) {
// 						&:not(:last-child)::before {
// 							content: '';
// 							position: absolute;
// 							width: 2px;
// 							height: 60%;
// 							right: 0;
// 							top: 20%;
// 							background-color: rgba($color: whitesmoke, $alpha: 0.36);
// 							font-size: 1.25rem;
// 							padding: 0.25rem 0;
// 						}
// 					}
// 				}
// 			}
// 			.right-items {
// 				min-width: 16.666667%;
// 				li {
// 					flex: 0 1 25%;
// 				}
// 				@media all and (max-width: 1199px) {
// 					flex-direction: row;
// 					width: 100%;
// 					border-width: 2px 0 0 0;
// 					border-style: outset;
// 					border-color: rgba($color: #000, $alpha: 0.36);

// 					li {
// 						flex: 0 1 16.666667%;
// 					}
// 				}
// 				@media all and (max-width: 960px) {
// 					li {
// 						flex: 0 1 33.333333%;
// 					}
// 				}
// 			}
// 			a {
// 				padding: 0.25rem;
// 				font-size: 1.25rem;

// 				@media all and (max-width: 1680px) {
// 					font-size: 1.428rem; //字太小傷眼
// 				}

// 				@media all and (max-width: 1440px) {
// 					font-size: 1.667rem; //字太小傷眼
// 				}

// 				@media all and (max-width: 1200px) {
// 					font-size: 2rem; //字太小傷眼
// 				}

// 				@media all and (max-width: 960px) {
// 					font-size: 2rem;
// 				}

// 				@media all and (max-width: 720px) {
// 					font-size: 2.667rem;
// 				}

// 				color: whitesmoke;
// 				text-decoration: none;
// 			}
// 		}
// 	}
// }
//
// .toolbar-title {
// 	text-shadow: 1px 1px 2px darkred, -1px -1px 2px lightpink;
// 	font-size: 1.5rem;
// }
</style>
