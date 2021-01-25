<template>
	<div>
		<!-- :style="{ height: `${$root.webHeight - 92}px` }" -->
		<v-card class="mx-auto" max-width="400px">
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
							<span class="font-weight-bold cyan--text text--darken-2">Sampling interval(ms)</span>
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
						<span class="font-weight-bold ml-2 cyan--text text--darken-2">
							Auto reconnect
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
				<v-btn color="success darken-2" :disabled="!valid || isConnected" @click="connect">
					連線
				</v-btn>

				<v-btn color="error darken-2" :disabled="!isConnected" @click="disconnect">斷線</v-btn>
			</v-card-actions>
		</v-card>
	</div>
</template>

<script lang="ts">
import { HiperModule } from '@/store/modules/hiper';
import { Component, Vue } from 'vue-property-decorator';

@Component({})
export default class App extends Vue {
	/**判斷 form 輸入是否合法 */
	private valid = false;
	/**嘗試連線中 */
	private connecting = false;
	/**IP */
	private ip = '192.168.50.162';
	/**port */
	private port = 3000;
	/**取樣頻率 */
	private interval = 3000;

	/**合法 IP 規則 */
	private ipRules = [
		(str: string) =>
			RegExp(/^192\.168\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/).test(
				str
			) || 'Valid IP address is required.'
	];
	/**合法 port 規則 */
	private portRules = [
		(num: string) => RegExp(/^[1-9][0-9]{0,4}$/).test(num) || 'An integer is required.',
		(num: number) => num > 100 || 'Number should be greater than 100.'
	];
	/**合法 interval 規則 */
	private intervalRules = [
		(num: string) => RegExp(/^[1-9][0-9]{0,4}$/).test(num) || 'An integer is required.',
		(num: number) => num > 500 || 'Number should be greater than 500.'
	];

	mounted() {
		if (!this.$ipcRenderer.eventNames().includes('conn-error')) {
			console.info('%cRegister conn-error', 'color: #2196f3');
			//
			this.$ipcRenderer.on('conn-error', (e, args) => {
				HiperModule.changeConnected(args.connected);

				if (args.error) {
					console.log(args);
					//
					HiperModule.changeConntionErr(args.error);
				}
			});
		}

		if (!this.$ipcRenderer.eventNames().includes('conn-success')) {
			console.info('%cRegister conn-success', 'color: #2196f3');
			//
			this.$ipcRenderer.on('conn-success', (e, args) => {
				HiperModule.changeConnected(args.connected);
				console.info(`%cIP: ${args.remoteIP}:${args.remotePort}`, 'color: #4CAF50;');

				if (!args.error) {
					console.log(args);
					//
					HiperModule.changeConntionErr(null);
				}
			});
		}

		if (!this.$ipcRenderer.eventNames().includes('sample-change')) {
			console.info('%cRegister sample-change', 'color: #2196f3');
			//
			this.$ipcRenderer.on('sample-change', (e, args) => {
				HiperModule.changeSampling(args.sampling);
			});
		}
	}

	get isConnected() {
		return HiperModule.connected;
	}

	get connStatus() {
		return HiperModule.connected ? '連線' : '未連線';
	}

	get reconnect() {
		return HiperModule.reconnect;
	}

	set reconnect(bool: boolean) {
		HiperModule.changeReconnect(bool);
	}

	get sampling() {
		return HiperModule.sampling;
	}

	set sampling(bool: boolean) {
		HiperModule.changeSampling(bool);
	}

	get connErrorCode() {
		if (HiperModule.connectionErr) {
			return HiperModule.connectionErr.code;
		} else return null;
	}

	get connErrorMsg() {
		if (HiperModule.connectionErr) {
			return HiperModule.connectionErr.message;
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
		const ret = await this.$ipcRenderer.invoke('conn', {
			ip: this.ip,
			port: this.port,
			interval: this.interval,
			reconnect: this.reconnect
		});

		HiperModule.changeConnected(ret.connected);

		this.connecting = false;
	}
	/**與設備斷線 */
	private async disconnect() {
		const ret = await this.$ipcRenderer.invoke('disc');
		HiperModule.changeConnected(ret.connected);
	}
	/**開始取樣 */
	private sampleChanged(bool: boolean) {
		this.$ipcRenderer.send('sampling', { sampling: bool });
	}
}
</script>

<style lang="scss" scoped></style>
