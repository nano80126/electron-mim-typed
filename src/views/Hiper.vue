<template>
	<div>
		<v-toolbar flat height="36" color="green darken-3">
			<v-toolbar-title class="col-1 text-center grey--text text--lighten-1 mr-3">
				<span class="font-weight-bold">恒普</span>
				<small>HIPER</small>
			</v-toolbar-title>
			<!-- <img class="" src="@/assets/HIPER.png" height="20" /> -->

			<!-- background-color="green darken-3" -->
			<v-tabs v-model="tab" height="36" color="warning" @change="tabChange">
				<v-tabs-slider color="transparent" />
				<v-tab class="">
					<span class="mr-2 font-weight-bold">面板</span>
					<v-icon small>fas fa-tachometer-alt</v-icon>
				</v-tab>
				<v-tab class="">
					<span class="mr-2 font-weight-bold">爐溫曲線圖</span>
					<v-icon small>fas fa-chart-line</v-icon>
				</v-tab>
				<v-spacer />

				<v-tab v-if="isElectron">
					<span class="mr-2 font-weight-bold">連線</span>
					<v-icon small>fas fa-network-wired</v-icon>
				</v-tab>
			</v-tabs>
		</v-toolbar>

		<v-tabs-items v-model="tab" class="transparent" reverse>
			<v-tab-item>
				<Dashboard />
			</v-tab-item>
			<v-tab-item>
				<Linechart ref="chart" />
			</v-tab-item>
			<v-tab-item v-if="isElectron">
				<Connect @bindTab="resetTab" />
			</v-tab-item>
		</v-tabs-items>
	</div>
</template>

<script lang="ts">
import board from '@/components/HiperChild/Dashboard.vue';
import chart, { ChartComponent } from '@/components/HiperChild/Chart.vue';
import connect from '@/components/HiperChild/Connect.vue';

import { Component, Ref, Vue } from 'vue-property-decorator';
import { AppModule } from '@/store/modules/app';

@Component({
	components: {
		Dashboard: board,
		Linechart: chart,
		Connect: connect
	}
})
export default class HIPER extends Vue {
	@Ref() chart?: ChartComponent;

	/**啟用的 tab */
	private tab = 0;

	/**是否為electron */
	get isElectron() {
		return AppModule.isElectron;
	}

	/**若 tab 變更，隱藏 menu */
	private tabChange() {
		if (this.chart) this.chart.showMenu = false;
	}

	/**重置tab，返回使用 */
	private resetTab(tab: number) {
		this.tab = tab;
	}
}
</script>
