<template>
	<div>
		<v-toolbar flat height="36" color="cyan darken-3">
			<v-toolbar-title class="col-1 text-center grey--text text--lighten-1 mr-3">
				<span class="font-weight-bold">宏倫</span>
				<small>VTECH</small>
			</v-toolbar-title>
			<!-- background-color="cyan darken-3" -->
			<v-tabs v-model="tab" height="36" color="warning">
				<v-tabs-slider color="transparent" />
				<v-tab class="">
					<span class="mr-2 font-weight-bold">面板</span>
					<v-icon small>fas fa-tachometer-alt</v-icon>
				</v-tab>
				<!-- <v-tab class="">
				<span class="mr-2 font-weight-bold">爐溫曲線圖</span>
				<v-icon small>fas fa-chart-line</v-icon>
			</v-tab> -->
				<v-spacer />

				<v-tab v-if="isElectron">
					<span class="mr-2 font-weight-bold">連線</span>
					<v-icon small>fas fa-network-wired</v-icon>
				</v-tab>
			</v-tabs>
		</v-toolbar>

		<v-tabs-items v-model="tab" class="transparent">
			<v-tab-item>
				<Dashboard />
			</v-tab-item>
			<v-tab-item v-if="isElectron">
				<Connect @bindTab="resetTab" />
			</v-tab-item>
		</v-tabs-items>
	</div>
</template>

<script lang="ts">
import board from '@/components/VtechChild/Dashboard.vue';
import connect from '@/components/VtechChild/Connect.vue';

import { Component, Vue } from 'vue-property-decorator';
import { AppModule } from '@/store/modules/app';

@Component({
	components: {
		Dashboard: board,
		Connect: connect
	}
})
export default class VTECH extends Vue {
	/**啟用的 tab */
	private tab = 0;

	/**是否為electron */
	get isElectron() {
		return AppModule.isElectron;
	}

	/**重置tab，返回使用 */
	private resetTab(tab: number) {
		this.tab = tab;
	}
}
</script>
