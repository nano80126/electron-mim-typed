<template>
	<div>
		<!-- style="height: 800px;" -->
		<v-row
			no-gutters
			align="stretch"
			class="mt-3"
			:style="{ height: isElectron ? `${$root.webHeight - 140}px` : `${$root.webHeight - 108}px` }"
		>
			<v-col class="d-flex flex-column align-start justify-center">
				<v-card class="ml-3" flat outlined width="240px" style="position: absolute; top: 0;">
					<v-card-subtitle class="text-center py-2 grey" :class="isDarkMode ? 'darken-2' : 'lighten-2'">
						<span class="font-weight-black subtitle-1">連線狀態</span>
					</v-card-subtitle>
					<v-divider />
					<v-card-text class="py-1 px-0">
						<v-row v-if="!isElectron" no-gutters align="center" justify="start" class="">
							<v-col cols class="ml-3 font-weight-bold subtitle-2">伺服器</v-col>
							<v-col cols class="mr-3 text-center">
								<v-chip :color="isWebsocket ? 'success' : 'error'" class="my-2">
									{{ isWebsocket ? '連線' : '斷線' }}
								</v-chip>
							</v-col>

							<v-divider class="col-12 grey" />
						</v-row>

						<v-row no-gutters align="center" justify="start" class="">
							<v-col cols class="ml-3 font-weight-bold subtitle-2">燒結爐</v-col>
							<v-col cols class="mr-3 text-center">
								<v-chip :color="isConnected ? 'success' : 'error'" class="my-2">
									{{ isConnected ? '連線' : '斷線' }}
								</v-chip>
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>

				<div class="ml-3" style="width: calc(100% - 16px);">
					<div class="my-10">
						<v-sheet height="8px" color="grey darken-2" elevation="2" style="position: relative;">
							<v-chip class="mt-n3 flow-chip d-flex justify-center">
								<span>氮氣流量</span>
								<span class="mx-3 text-right" style="width: 30px;">{{ flowN2 }}</span>
								<v-icon small :color="flowN2 != 0 ? 'info' : 'grey'">fas fa-water</v-icon>
							</v-chip>
						</v-sheet>
					</div>

					<div class="my-10">
						<v-sheet height="8px" color="grey darken-2" elevation="2" style="position: relative;">
							<v-chip class="mt-n3 flow-chip d-flex justify-center">
								<span>氬氣流量</span>
								<span class="mx-3 text-right" style="width: 30px;">{{ flowAr }}</span>
								<v-icon small :color="flowAr != 0 ? 'info' : 'grey'">fas fa-water</v-icon>
							</v-chip>
						</v-sheet>
					</div>
				</div>
			</v-col>
			<v-col cols="auto" class="d-flex flex-column">
				<v-card
					class="mx-auto my-auto"
					max-width="520px"
					color="grey"
					:class="isDarkMode ? 'darken-2' : 'lighten-3'"
					style="border-radius: 40%;"
				>
					<v-card-text class="pa-10">
						<v-row align="center" justify="start" class="font-weight-bold subtitle-1">
							<v-col
								cols="6"
								class="text-right"
								:class="isDarkMode ? 'lime--text text--lighten-2' : 'deep-purple--text text--darken-3'"
							>
								溫度設定值(℃)
							</v-col>
							<v-col cols="4" class="text-center">
								<span>{{ setTemp }}</span>
							</v-col>
							<!--  -->
							<v-col
								cols="6"
								class="text-right"
								:class="isDarkMode ? 'lime--text text--lighten-2' : 'deep-purple--text text--darken-3'"
							>
								中心溫度(℃)
							</v-col>
							<v-col cols="4" class="text-center">
								<span>{{ centerTemp }}</span>
							</v-col>
							<!--  -->
							<v-col
								cols="4"
								class="text-right"
								:class="isDarkMode ? 'lime--text text--lighten-2' : 'deep-purple--text text--darken-3'"
							>
								上部溫度(℃)
							</v-col>
							<v-col cols="2" class="text-center">
								<span>{{ topTemp }}</span>
							</v-col>
							<v-col
								class="text-right"
								:class="isDarkMode ? 'lime--text text--lighten-2' : 'deep-purple--text text--darken-3'"
							>
								下部溫度(℃)
							</v-col>
							<v-col cols="2" class="text-center">
								<span>{{ bottomTemp }}</span>
							</v-col>
							<!--  -->
							<v-col
								cols="4"
								class="text-right"
								:class="isDarkMode ? 'lime--text text--lighten-2' : 'deep-purple--text text--darken-3'"
							>
								管道壓力(kPa)
							</v-col>
							<v-col cols="2" class="text-center">
								<span>{{ tubePres }}</span>
							</v-col>
							<v-col
								class="text-right"
								:class="isDarkMode ? 'lime--text text--lighten-2' : 'deep-purple--text text--darken-3'"
							>
								爐內壓力(kPa)
							</v-col>
							<v-col cols="2" class="text-center">
								<span>{{ furnacePres }}</span>
							</v-col>
							<!--  -->
							<v-col
								cols="6"
								class="text-right"
								:class="isDarkMode ? 'lime--text text--lighten-2' : 'deep-purple--text text--darken-3'"
							>
								爐內真空(Pa)
							</v-col>
							<v-col cols="4" class="text-center">
								<span>{{ vacuum }}</span>
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>
			</v-col>
			<!-- <v-col cols="" class="d-flex align-start justify-between">
				<v-card width="550" class="mt-5">
					<v-card-title class="">
						<v-avatar></v-avatar>
						<v-row>
							<v-col>當前步</v-col>
							<v-col>{{ workNowName }}</v-col>
							<v-col>剩餘時間</v-col>
							<v-col>{{ leaveTime }}</v-col>
						</v-row>
					</v-card-title>

					<v-card-text>
						<v-timeline align-top dense>
							<v-timeline-item v-for="m in [1, 2, 4, 5]" :key="m" small>
								<div class="font-weight-normal">
									<strong>{{ m }}</strong>
								</div>
							</v-timeline-item>
						</v-timeline>
					</v-card-text>
				</v-card>

				<div class="" style="position: relative; min-width: 200px;">
					<v-sheet height="8px" color="grey darken-2" elevation="2" style="position: relative; top: -10%;">
						<v-chip class="mt-n3 flow-chip d-flex justify-center">
							<span>{{ flowN2 }}</span>
							<v-icon class="ml-3" small :color="flowN2 != 0 ? 'info' : 'grey'">fas fa-water</v-icon>
						</v-chip>
					</v-sheet>

					<v-sheet
						height="8px"
						color="grey darken-2"
						elevation="2"
						style="position: relative; margin-top: 50%;"
					>
						<v-chip class="mt-n3 flow-chip d-flex justify-center">
							<span>{{ flowAr }}</span>
							<v-icon class="ml-3" small :color="flowAr != 0 ? 'info' : 'grey'">fas fa-water</v-icon>
						</v-chip>
					</v-sheet>
				</div>
			</v-col> -->
			<v-col>
				<!-- empty for design -->
			</v-col>
			<div class="col-12" />

			<v-col cols="4" class="mt-auto">
				<v-card class="ml-3 rounded-lg" outlined min-width="360" max-height="500" style="">
					<v-card-text>
						<v-row align="start" justify="center" class="subtitle-1">
							<v-col cols="4" class="font-weight-bold info--text">
								<!-- 溫度設定值(℃) -->
								當前步剩餘時間:
							</v-col>
							<v-col cols="8" class="font-weight-bold text-center d-flex justify-space-around">
								<span>{{ leaveTime }}</span>
								<span class="ml-5">分鐘</span>
							</v-col>
							<!--  -->
							<v-col cols="4" class="font-weight-bold info--text">
								<!-- 中心溫度(℃) -->
								當前工藝名稱:
							</v-col>
							<v-col cols="8" class="font-weight-bold text-center info--text">
								<!-- <span>{{ centerTemp }}</span> -->
								<span>{{ workNowName || '(NULL)' }}</span>
							</v-col>
							<!--  -->
							<v-col cols="4" class="font-weight-bold primary--text">
								當前工藝狀態:
							</v-col>
							<v-col
								cols="8"
								class="font-weight-bold text-center"
								:class="nowState && nowState <= 5 ? 'error--text' : 'info--text'"
							>
								<span>{{ workNowState || '(NULL)' }}</span>
							</v-col>
							<!--  -->
							<v-col cols="4" class="font-weight-bold primary--text">
								等待時間:
							</v-col>
							<v-col cols="8" class="font-weight-bold text-center d-flex justify-space-around">
								<span>{{ waitTime }}</span>
								<span>分鐘</span>
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>
			</v-col>

			<!-- <v-col v-if="isElectron" cols="2">
					<v-btn block class="font-weight-black title" @click="broadcast">廣播</v-btn>
				</v-col>

				<v-col v-if="isElectron" cols="2">
					<v-btn block class="font-weight-black title" @click="lineNotify">Line</v-btn>
				</v-col>

				<v-col v-if="isElectron" cols="2">
					<v-btn block class="font-weight-black title" @click="alarmToggle">報警鈴警</v-btn>
				</v-col> -->
		</v-row>
		<v-bottom-navigation v-model="bottomNav" class="mt-3" height="48" @change="resetNav">
			<v-btn class="d-none">{{ bottomNav }}</v-btn>

			<!-- <v-col v-if="isElectron" cols="2" class="text-center">
				<v-tooltip top color="info">
					<template v-slot:activator="{ on, attrs }">
						<v-btn text class="font-weight-black title" @click="broadcast" v-bind="attrs" v-on="on">
							廣播
						</v-btn>
					</template>
					<span>廣播所有客戶端</span>
				</v-tooltip>
			</v-col>

			<v-col v-if="isElectron" cols="2" class="text-center">
				<v-tooltip top color="info">
					<template v-slot:activator="{ on, attrs }">
						<v-btn text class="font-weight-black title" @click="lineNotify" v-bind="attrs" v-on="on">
							Line
						</v-btn>
					</template>
					<span>送出測試訊息</span>
				</v-tooltip>
			</v-col>

			<v-col v-if="isElectron" cols="2" class="text-center">
				<v-tooltip top color="info">
					<template v-slot:activator="{ on, attrs }">
						<v-btn class="font-weight-black title" @click="alarmToggle" v-bind="attrs" v-on="on">
							報警鈴警
						</v-btn>
					</template>
					<span>報警鈴響測試</span>
				</v-tooltip>
			</v-col> -->

			<v-spacer />

			<v-col cols="2" class="text-center">
				<!-- <v-tooltip top color="info">
					<template v-slot:activator="{ on, attrs }"> -->
				<v-btn class="font-weight-black title" @click="alarmRes">
					報警應答
				</v-btn>
				<!-- </template>
					<span>報警應答</span>
				</v-tooltip> -->
			</v-col>

			<v-col cols="2" class="text-center">
				<!-- <v-tooltip top color="info">
					<template v-slot:activator="{ on, attrs }"> -->
				<v-btn class="font-weight-black title" @click="alarmReset">
					報警解除
				</v-btn>
				<!-- </template>
					<span>報警鈴響測試</span>
				</v-tooltip> -->
			</v-col>
		</v-bottom-navigation>
	</div>
</template>

<script lang="ts">
import { AppModule, Colors } from '@/store/modules/app';
import { Component, Vue } from 'vue-property-decorator';

import stepName from '@/json/vtech/stepName.json';
import stepState from '@/json/vtech/stepState.json';
import { EwsChannel, EwsFurnaceType, EwsCommand, IwsCmdMsg, IwsSerialMsg } from '@/types/renderer';
import { VtechModule } from '@/store/modules/vtech';
import { EsocketInvoke, EsocketOn } from '@/types/renderer/socket_vtech';

@Component({})
export default class VtechDashboard extends Vue {
	//
	private setTemp = 0;
	private centerTemp = 0;
	private topTemp = 0;
	private bottomTemp = 0;

	/**管道壓力 */
	private tubePres = 0;
	/**爐內壓力 */
	private furnacePres = 0;
	private vacuum = 0;
	//
	private flowN2 = 0;
	private flowAr = 0;
	private leaveTime = 0;
	// private workArr = []; no used now
	private workNowName: string | null = null;
	private workNowState: string | null = null;
	private nowState = null;

	private waitTime = 0;

	/**底部功能 Nav */
	private bottomNav = 0;
	/** */
	private hasResponse = false;

	/**是否為electron */
	get isElectron() {
		return AppModule.isElectron;
	}
	/**設備是否連線 */
	get isConnected() {
		return VtechModule.connected;
	}
	/**websocket是否連線 */
	get isWebsocket() {
		return AppModule.isWsOpend;
	}
	/**是否為 dark mode */
	get isDarkMode() {
		return this.$vuetify.theme.dark;
	}

	mounted() {
		if (AppModule.isElectron) {
			//
			this.$ipcRenderer.on(EsocketOn.SERIAL, (e, args) => {
				// 移除 header(7), 資料長度(2), 錯誤碼(2) // 前 11 位
				const serial = this.$lodash.drop(args.serial, 11) as number[];
				this.serialToData(serial);
				if (args.alarm) {
					if (!this.hasResponse) this.$root.$emit('alarmOn');
				} else {
					this.$root.$emit('alarmOff');
				}
			});
		} else {
			// 新增 websocket 事件
			if (this.$root.$ws.readyState == WebSocket.OPEN) {
				this.addMsgEvent();
			}
		}
	}

	beforeDestroy() {
		if (AppModule.isElectron) {
			// 移除 serial 事件
			this.$ipcRenderer.removeAllListeners(EsocketOn.SERIAL);
		} else {
			// 反註冊 vtech serial 事件
			this.$root.$off('vtechSerial');
		}
	}

	// 16 進位 陣列轉 10進位陣列
	private HexArrToVal(source: number[], idx: number[]) {
		if (!Array.isArray(source) || !Array.isArray(idx)) return 0;
		const a = idx.map(x => source[x] || 0);
		const val = a.reduce((pre, curr, currIdx) => pre + (curr << ((a.length - currIdx - 1) * 8)), 0);
		return val;
	}

	/**序列轉資料 */
	private serialToData(serial: number[]) {
		this.setTemp = this.HexArrToVal(serial, [1, 0]);
		this.topTemp = this.HexArrToVal(serial, [3, 2]);
		this.centerTemp = this.HexArrToVal(serial, [5, 4]);
		this.bottomTemp = this.HexArrToVal(serial, [7, 6]);
		//
		const fPres = this.HexArrToVal(serial, [9, 8]); // 有溢位問題
		this.furnacePres = fPres > 32768 ? (-(0xffff - fPres) - 1) / 10 : fPres / 10;
		const tPres = this.HexArrToVal(serial, [11, 10]); // 有溢位問題
		this.tubePres = tPres > 32768 ? (-(0xffff - tPres) - 1) / 10 : tPres / 10;
		this.vacuum = this.HexArrToVal(serial, [31, 30, 29, 28]) / 100;
		//
		this.flowN2 = this.HexArrToVal(serial, [13, 12]) / 10;
		this.flowAr = this.HexArrToVal(serial, [15, 14]) / 10;
		//
		this.leaveTime = this.HexArrToVal(serial, [17, 16]);
		this.workNowName = stepName[this.HexArrToVal(serial, [19, 18])];
		this.workNowState = stepState[this.HexArrToVal(serial, [20]) & 0b1]; // M12
		//
		this.waitTime = this.HexArrToVal(serial, [23, 22]);
	}

	// 新增 ws 訊息事件
	private addMsgEvent() {
		//
		this.$root.$on('vtechSerial', (data: IwsSerialMsg) => {
			this.serialToData(this.$lodash.drop(data.serial, 11));

			if (data.alarm) {
				this.$root.$emit('alarmOn');
			} else {
				this.$root.$emit('alarmOff');
			}
		});
	}

	/**廣播所有客戶端 */
	private broadcast = this.$lodash.debounce(() => {
		if (this.isElectron) {
			this.$ipcRenderer.send('boardcast', { text: 'text', id: 456 });
		}
	}, 500);

	/**送出Line通知 */
	private lineNotify = this.$lodash.debounce(() => {
		if (this.isElectron) {
			const message = '\n這是一條測試訊息。';
			this.$ipcRenderer.send('notifySend', { msg: message });
		}
	}, 500);

	/**切換報警鈴 */
	private alarmToggle() {
		this.$root.$emit('alarmToggle');
	}

	/**回應警報(VTECH沒有此功能) */
	private alarmRes() {
		//
		this.$root.$emit('alarmOff');
		if (this.isElectron) {
			this.$ipcRenderer
				.invoke(EsocketInvoke.ALARMRES)
				.then((res: { response: boolean; reset: boolean; error?: string }) => {
					if (res.error) throw Error(res.error);
					this.hasResponse = res.response;
				})
				.catch((err: Error) => {
					AppModule.snackbar({ text: err.message, color: Colors.Error });
				});
		} else {
			// Websocket response alarm
			const wsMsg: IwsCmdMsg = {
				channel: EwsChannel.COMMAND,
				furnace: EwsFurnaceType.VTECH,
				command: EwsCommand.ALARMRESPONSE
			};
			this.$root.$ws.send(JSON.stringify(wsMsg));
		}
	}

	/**重置警報 */
	private alarmReset() {
		//
		this.$root.$emit('alarmOff');
		if (this.isElectron) {
			this.$ipcRenderer
				.invoke(EsocketInvoke.ALARMRST)
				.then((res: { response: boolean; reset: boolean; error?: string }) => {
					if (res.error) throw Error(res.error);
					this.hasResponse = res.response;
				})
				.catch((err: Error) => {
					AppModule.snackbar({ text: err.message, color: Colors.Error });
				});
		} else {
			// WebSocket reset alarm
			const wsMsg: IwsCmdMsg = {
				channel: EwsChannel.COMMAND,
				furnace: EwsFurnaceType.VTECH,
				command: EwsCommand.ALARMRESET
			};
			this.$root.$ws.send(JSON.stringify(wsMsg));
		}
	}

	/**重置 Nav */
	private resetNav() {
		this.$nextTick(() => {
			if (this.bottomNav != 0) this.bottomNav = 0;
		});
	}
}
</script>

<style lang="scss" scoped>
.flow-chip {
	position: absolute;
	background-color: white;
	margin-left: 50%;
	min-width: 80px;
	// left: 0;
	// right: 0;
	// max-width: 80px;
	// margin-top: -14px;
}
</style>
