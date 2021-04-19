<template>
	<div>
		<!-- :style="{ height: `${$root.webHeight - 92}px` }" -->
		<v-card class="mx-auto mt-10" max-width="400px">
			<v-card-title class="font-weight-black primary--text">連線設定</v-card-title>
			<v-divider />
			<v-card-text>
				<v-form v-model="valid">
					<v-text-field v-model="ip" :rules="ipRules" required>
						<template v-slot:label>
							<span class="font-weight-bold cyan--text text--darken-2">IP</span>
						</template>
					</v-text-field>
					<v-text-field v-model="port" :rules="portRules" required>
						<template v-slot:label>
							<span class="font-weight-bold cyan--text text--darken-2">Port</span>
						</template>
					</v-text-field>
					<v-text-field v-model="interval" :rules="intervalRules" required>
						<template v-slot:label>
							<span class="font-weight-bold cyan--text text--darken-2">取樣間隔(ms)</span>
						</template>
					</v-text-field>
				</v-form>

				<v-checkbox
					v-model="reconnect"
					class="my-0"
					on-icon="far fa-check-square"
					off-icon="far fa-square"
					hide-details
				>
					<template v-slot:label>
						<span class="font-weight-bold ml-1 mt-1 cyan--text text--darken-2">
							自動重連
						</span>
					</template>
				</v-checkbox>
			</v-card-text>

			<v-card-text>
				<v-sheet class="d-flex justify-space-between px-3" :color="sheetColor">
					<v-tooltip bottom>
						<template v-slot:activator="{ on }">
							<span v-on="on">{{ connErrorCode }}</span>
						</template>
						{{ connErrorMsg }}
					</v-tooltip>
					<span>{{ connStatus }}</span>
				</v-sheet>
			</v-card-text>
			<v-divider />
			<v-card-actions>
				<v-switch v-model="sampling" class="mx-2" :disabled="!isConnected" @change="sampleChanged">
					<template v-slot:label>
						<span class="font-weight-bold" :class="isConnected ? 'info--text' : 'grey--text'">
							取樣
						</span>
					</template>
				</v-switch>
				<v-spacer />

				<!-- || loading -->
				<!-- :loading="loading" -->
				<v-btn
					color="success darken-2"
					:disabled="!valid || isConnected || connecting"
					:loading="connecting"
					@click="connect"
				>
					連線
				</v-btn>

				<!-- :disabled="!valid || isConnected || loading"
						:loading="loading" -->

				<v-btn color="error darken-2" :disabled="!isConnected" @click="disconnect">斷線</v-btn>
			</v-card-actions>
		</v-card>

		<v-row no-gutters class="mt-10">
			<v-btn color="info" class="offset-9 col-1" @click="resetTab(0)">返回</v-btn>
		</v-row>
	</div>
</template>

<script lang="ts">
import { AppModule } from '@/store/modules/app';
import { VtechModule } from '@/store/modules/vtech';
import { EsocketInvoke, EsocketOn } from '@/types/renderer/socket_vtech';
import { Component, Emit, Vue } from 'vue-property-decorator';

@Component({})
export default class VtechConnect extends Vue {
	/**判斷 form 輸入是否合法 */
	private valid = false;
	/**嘗試連線中 */
	private connecting = false;
	/**IP */
	private ip = '192.168.3.39';
	/**port */
	private port = 1028;
	/**取樣頻率 */
	private interval = 3000;

	/**合法 IP 規則 */
	private ipRules = [
		(str: string) =>
			RegExp(
				/^192\.168\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$|^127\.0\.0\.1$/
			).test(str) || 'A valid IP address is required.'
	];
	/**合法 port 規則 */
	private portRules = [
		(num: string) => RegExp(/^[1-9][0-9]{0,4}$/).test(num) || 'An integer is required.',
		(num: number) => num > 100 || 'Number should be greater than 100.'
	];
	/**合法 interval 規則 */
	private intervalRules = [
		(num: string) => RegExp(/^[1-9][0-9]{0,4}$/).test(num) || 'An integer is required.',
		(num: number) => num > 500 || 'Interval value should be greater than 500.'
	];

	created() {
		if (AppModule.isElectron) {
			if (VtechModule.ip != '') this.ip = VtechModule.ip;
			if (VtechModule.port != 0) this.port = VtechModule.port;
		}
	}

	mounted() {
		if (AppModule.isElectron) {
			if (!this.$ipcRenderer.eventNames().includes(EsocketOn.CONNECTIONERROR)) {
				console.info(`%cRegister ${EsocketOn.CONNECTIONERROR}`, 'color: #2196f3');
				//
				this.$ipcRenderer.on(EsocketOn.CONNECTIONERROR, (e, args) => {
					VtechModule.changeVtechConnected(args.connected);

					if (args.error) {
						//
						VtechModule.changeVtechConntionErr(args.error);
					}
				});
			}

			if (!this.$ipcRenderer.eventNames().includes(EsocketOn.CONNECTIONSUCCESS)) {
				console.info(`%cRegister ${EsocketOn.CONNECTIONSUCCESS}`, 'color: #2196f3');
				//
				this.$ipcRenderer.on(EsocketOn.CONNECTIONSUCCESS, (e, args) => {
					VtechModule.changeVtechConnected(args.connected);
					console.info(`%cIP: ${args.remoteIP}:${args.remotePort}`, 'color: #4CAF50;');

					if (!args.error) {
						//
						VtechModule.changeVtechIP(args.remoteIP);
						VtechModule.changeVtechPort(args.remotePort);
						VtechModule.changeVtechConntionErr(null);
					}
				});
			}

			if (!this.$ipcRenderer.eventNames().includes(EsocketOn.SAMPLINGCHANGED)) {
				console.info(`%cRegister ${EsocketOn.SAMPLINGCHANGED}`, 'color: #2196f3');
				// 改變 sampling，自動重連後使用
				this.$ipcRenderer.on(EsocketOn.SAMPLINGCHANGED, (e, args) => {
					VtechModule.changeVtechSampling(args.sampling);
				});
			}
		}
	}

	get isConnected() {
		return VtechModule.connected;
	}

	get connStatus() {
		return VtechModule.connected ? '連線' : '未連線';
	}

	get reconnect() {
		return VtechModule.reconnect;
	}

	set reconnect(bool: boolean) {
		VtechModule.changeVtechReconnect(bool);
		this.$ipcRenderer.invoke(EsocketInvoke.ALTERRECONNECT, bool).then(res => {
			console.info(`%cAlter reconnection: ${res}`, 'color: #4CAF50;');
		});
	}

	get sampling() {
		return VtechModule.sampling;
	}

	set sampling(bool: boolean) {
		VtechModule.changeVtechSampling(bool);
	}

	get connErrorCode() {
		if (VtechModule.connectionErr) {
			return VtechModule.connectionErr.code;
		} else return null;
	}

	get connErrorMsg() {
		if (VtechModule.connectionErr) {
			return VtechModule.connectionErr.message;
		} else return '';
	}

	get sheetColor() {
		if (this.connErrorCode) {
			return 'error';
		} else {
			if (!this.isConnected) return 'grey darken-2';
			else return 'success';
		}
	}

	/**與設備連線 */
	private async connect() {
		// set for loading
		this.connecting = true;

		// 設定 IP, port, 間隔, 是否重新連線
		const ret = await this.$ipcRenderer.invoke(EsocketInvoke.CONNECT, {
			ip: this.ip,
			port: this.port,
			interval: this.interval,
			reconnect: this.reconnect
		});

		if (ret.connected) {
			// 設定燒結爐已連線
			VtechModule.changeVtechConnected(ret.connected);
		}

		this.connecting = false;
	}
	/**與設備斷線 */
	private async disconnect() {
		const ret = await this.$ipcRenderer.invoke(EsocketInvoke.DISCONNECT);

		if (!ret.connected) {
			// 設定燒結爐已斷線
			VtechModule.changeVtechConnected(ret.connected);
			// 斷線後停止取樣
			VtechModule.changeVtechSampling(false);
		}
	}
	/**開始取樣 */
	private sampleChanged(bool: boolean) {
		// this.$ipcRenderer.send('sampling', { sampling: bool });

		this.$ipcRenderer.invoke(EsocketInvoke.SAMPLE, { sampling: bool }).then(res => {
			//
			console.info(`%csample ${bool == res.sampling}`, 'color: #2196f3');
		});
	}

	/**返回Daskboard */
	@Emit('bindTab')
	private resetTab(tab: number) {
		return tab;
	}
}
</script>

<style lang="scss" scoped></style>
