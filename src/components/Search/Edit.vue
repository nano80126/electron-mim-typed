<template>
	<div>
		<!-- no padding top/bottom -->
		<v-list dense two-line class="rounded-lg py-0">
			<draggable v-model="draggableArray" handle=".handle">
				<!-- <template > -->
				<v-list-item v-for="(item, idx) in draggableArray" :key="item.id">
					<v-list-item-icon class="handle my-6 mr-3">
						<v-icon style="cursor: pointer;">fas fa-bars</v-icon>
					</v-list-item-icon>
					<v-list-item-content
						:style="`border-bottom: ${idx < urlObjArray.length - 1 ? '1px solid gray' : ''}`"
					>
						<v-list-item-title class="d-flex align-center justify-start">
							<span class="subtitle-2 ml-3">{{ `${idx + 1}.` }}</span>
							<transition name="slideFadeIn">
								<span
									v-if="item.videoTitle"
									class="subtitle-2 mr-3 ml-auto"
									style="user-select: text; max-width: 90%;"
									v-text="item.videoTitle"
								/>
								<!-- {{ item.videoTitle }} -->
								<!-- </span> -->
							</transition>
						</v-list-item-title>
						<v-list-item-subtitle class="d-flex align-center justify-center no-gutters">
							<v-toolbar dense flat height="36" class="transparent">
								<v-text-field
									v-model="item.artist"
									class="col-auto ml-auto"
									dense
									rounded
									filled
									:placeholder="$t('singer')"
									hide-details
									color="orange"
									prepend-icon="fas fa-microphone-alt"
									style="max-width: 450px"
								/>
								<v-tooltip top nudge-left="4" color="brown darken-2">
									<template v-slot:activator="{ on, attrs }">
										<div v-on="on" v-bind="attrs" class="ml-3 mr-n1">
											<v-checkbox
												v-model="item.cover"
												color="success"
												class="m-0"
												hide-details
												dense
											/>
										</div>
									</template>
									<span>{{ $t('cover') }}</span>
								</v-tooltip>
							</v-toolbar>
						</v-list-item-subtitle>
					</v-list-item-content>
				</v-list-item>
			</draggable>
		</v-list>
	</div>
</template>

<script lang="ts">
import draggable from 'vuedraggable';

import { Component, Vue, Prop } from 'vue-property-decorator';
import { IyouTubeObj } from '@/types/renderer';

@Component({
	components: {
		draggable
	}
})
export default class Edit extends Vue {
	/**YouTube Obj Array，自訂title用 */
	@Prop() urlObjArray!: IyouTubeObj[];

	/**回傳可拖動之陣列 */
	get draggableArray() {
		return this.urlObjArray;
	}

	/**設定拖動後陣列 */
	set draggableArray(val) {
		this.$emit('update:urlObjArray', val);
	}
}
</script>

<style lang="scss" scoped>
.slideFadeIn-enter-active {
	transition: all 0.5s;
}

.slideFadeIn-enter {
	opacity: 0.16;
	transform: translateX(80%);
}
</style>
