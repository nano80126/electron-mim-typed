<template>
	<div>
		<!-- style="height: 800px;" -->
		<v-row no-gutters align="stretch" class="mt-3" :style="{ height: `${$root.webHeight - 92}px` }">
			<v-col class="d-flex flex-column align-start justify-between">
				<v-card class="ml-3" flat outlined width="240px">
					<v-card-subtitle class="text-center py-2 grey" :class="isDarkMode ? 'darken-2' : 'lighten-2'">
						<span class="font-weight-black subtitle-1">連線狀態</span>
					</v-card-subtitle>
					<v-divider />
					<v-card-text class="py-1 px-0">
						<v-row no-gutters align="center" justify="start" class="">
							<v-col cols class="ml-3 font-weight-bold subtitle-2">伺服器</v-col>
							<v-col cols class="mr-3 text-center">
								<v-chip :color="isWebsocket ? 'success' : 'error'" class="my-2">
									{{ isWebsocket ? '連線' : '斷線' }}
								</v-chip>
							</v-col>

							<v-divider class="col-12 grey" />

							<v-col cols class="ml-3 font-weight-bold subtitle-2">燒結爐</v-col>
							<v-col cols class="mr-3 text-center">
								<v-chip :color="isWebsocket ? 'success' : 'error'" class="my-2">
									{{ isConnected ? '連線' : '斷線' }}
								</v-chip>
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>

				<div class="ml-3 my-auto" style="position: relative; top: -10%; width: calc(100% - 16px)">
					<v-sheet height="8px" color="grey darken-2" elevation="2" style="position: relative;">
						<!-- <v-text-field
							v-model="flow"
							label="流量"
							class="flow-text"
							outlined
							dense
							hide-details
							:loading="flow != 0"
							readonly
							style="user-select: none;"
						></v-text-field> -->
						<v-chip class="mt-n3 flow-chip d-flex justify-center">
							<span>{{ flow }}</span>
							<v-icon class="ml-3" small :color="flow != 0 ? 'info' : 'grey'">fas fa-water</v-icon>
						</v-chip>
					</v-sheet>
				</div>
			</v-col>
			<v-col cols="auto" class="d-flex flex-column">
				<v-card
					class="mx-auto my-auto"
					max-width="400px"
					color="grey"
					:class="isDarkMode ? 'darken-2' : 'lighten-3'"
					style="border-radius: 40%;"
				>
					<v-card-text class="pa-5">
						<v-row align="center" justify="start" class=" font-weight-bold subtitle-1">
							<v-col
								cols="6"
								class="text-right"
								:class="isDarkMode ? 'lime--text text--lighten-2' : 'deep-purple--text text--darken-3'"
							>
								溫度設定值:
							</v-col>
							<v-col cols="4" class="d-flex justify-space-around">
								<span>{{ setTemp }}</span>
								<span>&deg;C</span>
							</v-col>
							<!--  -->
							<v-col
								cols="6"
								class="text-right"
								:class="isDarkMode ? 'lime--text text--lighten-2' : 'deep-purple--text text--darken-3'"
							>
								上部溫度當前值:
							</v-col>
							<v-col cols="4" class="d-flex justify-space-around">
								<span>{{ topTemp }}</span>
								<span>&deg;C</span>
							</v-col>
							<!--  -->
							<v-col
								cols="6"
								class="text-right"
								:class="isDarkMode ? 'lime--text text--lighten-2' : 'deep-purple--text text--darken-3'"
							>
								下部溫度當前值:
							</v-col>
							<v-col cols="4" class="d-flex justify-space-around">
								<span>{{ bottomTemp }}</span>
								<span>&deg;C</span>
							</v-col>
							<!--  -->
							<v-col
								cols="6"
								class="text-right"
								:class="isDarkMode ? 'lime--text text--lighten-2' : 'deep-purple--text text--darken-3'"
							>
								爐內壓力值:
							</v-col>
							<v-col cols="4" class="d-flex justify-space-around">
								<span>{{ pressure }}</span>
								<span>kPa</span>
							</v-col>
							<!--  -->
							<v-col
								cols="6"
								class="text-right"
								:class="isDarkMode ? 'lime--text text--lighten-2' : 'deep-purple--text text--darken-3'"
							>
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
				<v-card class="ml-3 rounded-lg" outlined min-width="360" max-height="500" style="">
					<v-card-text>
						<v-row align="start" justify="center" class="subtitle-1">
							<v-col cols="4" class="font-weight-bold  primary--text">
								當前步剩餘時間:
							</v-col>
							<v-col cols="8" class="font-weight-bold text-center d-flex justify-space-around">
								<span>{{ leaveTime }}</span>
								<span class="ml-5">分鐘</span>
							</v-col>
							<!--  -->
							<v-col cols="4" class="font-weight-bold primary--text">
								當前工藝名稱:
							</v-col>
							<v-col cols="8" class="font-weight-bold text-center info--text">
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
	/** */
	get isDarkMode() {
		return this.$vuetify.theme.dark;
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
			// remove serial event
		} else {
			// nothing to do
		}
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
