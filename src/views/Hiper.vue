<template>
	<div>
		<v-tabs v-model="tab" height="36" color="warning" background-color="green darken-3">
			<v-tabs-slider color="transparent" />
			<v-tab class="">
				<span class="mr-2 font-weight-bold">面板</span>
				<v-icon small>fas fa-tachometer-alt</v-icon>
			</v-tab>
			<v-tab class="">
				<span class="mr-2 font-weight-bold">爐溫曲線圖</span>
				<v-icon small>fas fa-chart-line</v-icon>
			</v-tab>
			<v-spacer></v-spacer>

			<v-tab v-if="isElectron">
				<span class="mr-2 font-weight-bold">連線</span>
				<v-icon small>fas fa-network-wired</v-icon>
			</v-tab>
		</v-tabs>

		<v-tabs-items v-model="tab" class="transparent">
			<v-tab-item>
				<Dashboard />
			</v-tab-item>
			<v-tab-item>456</v-tab-item>
			<v-tab-item v-if="isElectron">
				<Connect />
			</v-tab-item>
		</v-tabs-items>
	</div>
</template>

<script lang="ts">
import board from '@/components/HiperChild/Dashboard.vue';
import connect from '@/components/HiperChild/Connect.vue';

import { Component, Vue } from 'vue-property-decorator';
import { AppModule } from '@/store/modules/app';

@Component({
	components: {
		Dashboard: board,
		Connect: connect
	}
})
export default class HIPER extends Vue {
	/**啟用的 tab */
	private tab = 0;

	/**是否為electron */
	get isElectron() {
		return AppModule.isElectron;
	}

	mounted() {
		// this.$root.$on('alarmToggle', () => {
		// 	const audio = this.$refs.alarmAudio;
		// });
	}

	beforeDestroy() {
		//
	}
}
</script>
