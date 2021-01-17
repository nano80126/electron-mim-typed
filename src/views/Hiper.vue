<template>
	<div>
		<v-tabs v-model="tab" height="36" color="warning" background-color="green darken-3">
			<v-tabs-slider color="transparent" />
			<v-tab class="">
				<span class="mr-2">面板</span>
				<v-icon small>fas fa-tachometer-alt</v-icon>
			</v-tab>
			<v-tab class="">
				<span class="mr-2">爐溫曲線圖</span>
				<v-icon small>fas fa-chart-line</v-icon>
			</v-tab>
			<v-spacer></v-spacer>

			<v-tab class="">
				<span class="mr-2">連線</span>
				<v-icon small>fas fa-network-wired</v-icon>
			</v-tab>
		</v-tabs>

		<v-tabs-items v-model="tab">
			<v-tab-item>
				<Dashboard />
			</v-tab-item>
			<v-tab-item>456</v-tab-item>
			<v-tab-item>連線</v-tab-item>
		</v-tabs-items>
	</div>
</template>

<script lang="ts">
import board from '@/components/Hiper/Dashboard.vue';

import { Component, Vue } from 'vue-property-decorator';

@Component({
	components: {
		Dashboard: board
	}
})
export default class HIPER extends Vue {
	/**啟用的 tab */
	private tab = 0;
}
</script>
