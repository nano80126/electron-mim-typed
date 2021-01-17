<template>
	<div>
		<!-- style="height: 800px;" -->
		<v-row no-gutters align="stretch" class="mt-3" :style="{ height: `${$root.webHeight - 92}px` }">
			<v-col class="d-flex flex-column align-start justify-between">
				<v-card class="ml-3" flat outlined width="240px">
					<v-card-subtitle class="text-center py-2 info darken-2">
						<span class="font-weight-black subtitle-1">連線狀態</span>
					</v-card-subtitle>
					<v-divider />
					<v-card-text class="py-1">
						<v-row no-gutters align="center" justify="start">
							<v-col cols class="font-weight-bold subtitle-2">伺服器</v-col>
							<v-col cols class="text-center">
								<v-chip :color="isWebsocket ? 'success' : 'error'" class="my-2">
									{{ isWebsocket ? '連線' : '斷線' }}
								</v-chip>
							</v-col>

							<div class="col-12" />
							<!-- </v-row>
						<v-row no-gutters align="center" justify="start"> -->
							<v-col cols class="font-weight-bold subtitle-2">燒結爐</v-col>
							<v-col cols class="text-center">
								<v-chip :color="isWebsocket ? 'success' : 'error'" class="my-2">
									{{ isConnected ? '連線' : '斷線' }}
								</v-chip>
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>

				<div class="my-auto w-100" style="top: -20%;">
					<v-sheet height="12px" color="grey darken-2" elevation="2" style="position: relative;">
						<v-text-field
							v-model="flow"
							label="流量"
							class="flow-text"
							outlined
							dense
							hide-details
							:loading="flow != 0"
							readonly
							style="user-select: none;"
						></v-text-field>
					</v-sheet>
				</div>
			</v-col>
			<v-col cols="auto" class="d-flex flex-column">
				<v-card class="mx-auto my-auto red" max-width="400px" style="border-radius: 40%;">
					<v-card-text class="pa-5">
						<v-row align="center" justify="start" class=" font-weight-bold subtitle-1">
							<v-col cols="6" class="text-right deep-purple--text">
								溫度設定值:
							</v-col>
							<v-col cols="4" class="d-flex justify-space-around">
								<span>{{ setTemp }}</span>
								<span>&deg;C</span>
							</v-col>
							<!--  -->
							<v-col cols="6" class="text-right deep-purple--text">
								上部溫度當前值:
							</v-col>
							<v-col cols="4" class="d-flex justify-space-around">
								<span>{{ topTemp }}</span>
								<span>&deg;C</span>
							</v-col>
							<!--  -->
							<v-col cols="6" class="text-right deep-purple--text">
								下部溫度當前值:
							</v-col>
							<v-col cols="4" class="d-flex justify-space-around">
								<span>{{ bottomTemp }}</span>
								<span>&deg;C</span>
							</v-col>
							<!--  -->
							<v-col cols="6" class="text-right deep-purple--text">
								爐內壓力值:
							</v-col>
							<v-col cols="4" class="d-flex justify-space-around">
								<span>{{ pressure }}</span>
								<span>kPa</span>
							</v-col>
							<!--  -->
							<v-col cols="6" class="text-right deep-purple--text">
								爐內真空值:
							</v-col>
							<v-col cols="4" class="d-flex justify-space-around">
								<span>{{ vacuum }}</span>
								<span>Pa</span>
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>
			</v-col>
			<v-col>
				<!-- empty for design -->
			</v-col>
			<div class="col-12" />

			<v-col cols="4" class="mt-auto">
				<v-card class="ml-3 rounded-lg grey" min-width="360" max-height="500" style="">
					<v-card-text>
						<v-row align="start" justify="center">
							<v-col cols="4" class="font-weight-bold subtitle-1 primary--text">當前步剩餘時間:</v-col>
							<v-col cols="8" class="font-weight-bold subtitle-1 d-flex justify-space-around">
								<span>{{ leaveTime }}</span>
								<span class="ml-5">分鐘</span>
							</v-col>
							<!--  -->
							<v-col cols="4" class="font-weight-bold subtitle-1 primary--text">當前工藝名稱:</v-col>
							<v-col cols="8" class="font-weight-bold subtitle-1 text-center info--text">
								<span>{{ workNowName || '(NULL)' }}</span>
							</v-col>
							<!--  -->
							<v-col cols="4" class="font-weight-bold subtitle-1 primary--text">
								當前工藝狀態:
							</v-col>
							<v-col
								cols="8"
								class="font-weight-bold subtitle-1 text-center"
								:class="nowState && nowState <= 5 ? 'error--text' : 'info--text'"
							>
								<span>{{ workNowState || '(NULL)' }}</span>
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
	</div>
</template>

<script lang="ts">
import { AppModule } from '@/store/modules/app';
import { Component, Vue } from 'vue-property-decorator';

@Component({})
export default class HiperDashboard extends Vue {
	//
	private setTemp = 0;
	private topTemp = 0;
	private bottomTemp = 0;
	private pressure = 0;
	private vacuum = 0;
	//
	private flow = 0;
	private leaveTime = 0;
	// private workArr = []; no used now
	private workNowName = null;
	private workNowState = null;
	private nowState = null;

	private waitTime = 0;

	/**是否為electron */
	get isElectron() {
		return AppModule.isElectron;
	}
	/**設備是否連線 */
	get isConnected() {
		return false;
	}
	/**websocket是否連線 */
	get isWebsocket() {
		return false;
	}

	mounted() {
		//
		if (AppModule.isElectron) {
			//
		} else {
			//
		}
	}

	beforeDestroy() {
		if (AppModule.isElectron) {
			//
		}
	}
}
</script>

<style lang="scss" scoped>
.flow-text {
	position: absolute;
	background-color: white;
	left: 50%;
	right: 0;
	max-width: 80px;
	margin: 0;
	margin-top: -14px;
}
</style>
