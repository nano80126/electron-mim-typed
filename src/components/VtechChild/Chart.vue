<template>
	<div>
		<v-row no-gutters align="stretch">
			<v-col cols="12 red">
				<v-toolbar flat dense>
					<div
						class="col-3 col-xl-2 dropZone d-flex align-center justify-center rounded"
						:class="{ 'success lighten-2': dragging }"
						@dragover="dragging = true"
						@dragleave="dragging = false"
					>
						<div class="uploadBtn" @drag="onChange">
							<v-icon small>fas fa-upload</v-icon>
							<span class="ml-2">
								{{ (file && file.name) || '上傳CSV, TXT' }}
							</span>
						</div>
						<input ref="file" type="file" @change="onChange" title accept=".csv,.txt" />
					</div>

					<v-divider vertical class="mx-2" />

					<v-btn class="col-auto" text outlined height="36" @click="drawChart" :disabled="!file">
						<v-icon small>fas fa-pencil-alt</v-icon>
						<span class="ml-2">Draw chart</span>
					</v-btn>

					<v-tooltip right>
						<template v-slot:activator="{ on, attrs }">
							<v-btn
								class="ml-6"
								color="success"
								icon
								outlined
								height="36"
								width="36"
								@click="resetZoom"
								:disabled="!chart"
								v-bind="attrs"
								v-on="on"
							>
								<v-icon small>fas fa-undo</v-icon>
							</v-btn>
						</template>
						<span>Reset zoom</span>
					</v-tooltip>

					<div class="col-1"></div>
				</v-toolbar>
			</v-col>

			<v-col cols="12" class="mt-3" style="position: relative;">
				<div id="container" class="mx-0" />

				<!-- this can use xaxis plotlines to replace -->
				<div
					class="fixed-crosshair"
					:style="{
						left: `${menuX - 64}px`,
						height: `${plotH}px`,
						display: `${showMenu ? 'block' : 'none'}`
					}"
				/>
			</v-col>
		</v-row>

		<v-menu
			v-model="showMenu"
			:position-x="menuX"
			:position-y="menuY"
			absolute
			top
			nudge-top="15"
			nudge-right="15"
			:close-on-click="false"
			:close-on-content-click="false"
		>
			<template />
			<v-list dense dark class="py-0">
				<v-subheader class="my-0">
					<v-icon small>fas fa-thermometer-half</v-icon>
					<span class="ml-3">Temperature</span>
				</v-subheader>
				<v-divider />
				<v-list-item dense class="subtitle-2">
					<v-list-item-content>
						<span class="ml-3 mr-8">日期</span>
					</v-list-item-content>
					<v-list-item-icon>{{ menuDate }}</v-list-item-icon>
				</v-list-item>

				<v-list-item dense class="subtitle-2">
					<v-list-item-content>
						<span class="ml-3 mr-8">時間</span>
					</v-list-item-content>
					<v-list-item-icon>{{ menuTime }}</v-list-item-icon>
				</v-list-item>

				<v-list-item dense class="subtitle-2">
					<v-list-item-content>
						<span class="ml-3 mr-8">上部溫度</span>
					</v-list-item-content>
					<v-list-item-icon>{{ menuUppertemp }} ℃</v-list-item-icon>
				</v-list-item>

				<v-list-item dense class="subtitle-2">
					<v-list-item-content>
						<span class="ml-3 mr-8">下部溫度</span>
					</v-list-item-content>
					<v-list-item-icon>{{ menuLowertemp }} ℃</v-list-item-icon>
				</v-list-item>
			</v-list>
		</v-menu>
	</div>
</template>

<script lang="ts">
import Highcharts, { Chart, SeriesOptionsType } from 'highcharts';

import { AppModule } from '@/store/modules/app';
import { Component, Vue } from 'vue-property-decorator';

import Worker from '@/worker';
// const worker = new Worker();

export interface ChartComponent {
	showMenu: boolean;
}

@Component({})
export default class HiperChart extends Vue implements ChartComponent {
	/**曲線圖CSV */
	private file: File | null = null;
	/**是否 dragin */
	private dragging = false;
	/**chart 資料 */
	private series: {
		datetime: number;
		data: number[]; // 12點溫度
	}[] = [];

	private names: string[] = [];
	/**chart 物件 */
	private chart: Chart | null = null;
	/**顯示 menu */
	public showMenu = false;
	/**menu X 座標 */
	private menuX = 0;
	/**menu Y 座標 */
	private menuY = 0;
	/**顯示上部溫度 */
	private menuUppertemp = 0;
	/**顯示下部溫度 */
	private menuLowertemp = 0;
	/**顯示日期 */
	private menuDate = '';
	/**顯示時間 */
	private menuTime = '';

	/** */
	private plotH = 0;

	mounted() {
		//
	}

	beforeDestroy() {
		this.showMenu = false;
	}

	/**input file change event */
	private onChange(e: Event) {
		AppModule.changeOverlay(true);

		const files = (e.target as HTMLInputElement).files as FileList;
		if (files?.length > 0) {
			this.file = files[0];

			const split = this.file?.name.split('.');
			const ext = split[split?.length - 1].toLowerCase();

			// setTimeout(() => {
			this.$nextTick(async () => {
				// (e.target as HTMLInputElement).value = '';
				this.dragging = false;
				//
				const reader = new FileReader();
				// const str = await new Promise(resolve => {
				reader.addEventListener(
					'load',
					readData => {
						const msgObj = { furnace: 'vtech', data: readData.target?.result as string, extension: ext };
						Worker.analyzeCSV(msgObj)
							// .then((res: { type: string; series: { [key: string]: number }[] }) => {
							.then(res => {
								this.series = res.series;
								this.names = res.names;

								// console.log(this.names);
								// console.log(this.series);
							})
							.finally(() => {
								(e.target as HTMLInputElement).value = '';
								AppModule.changeOverlay(false);
							});
					},
					{ once: true }
				);
				// reader.readAsBinaryString(this.file as File);
				reader.readAsText(this.file as File, 'Shift-JIS');
			});
		}
	}

	/**處理資料 (已轉移至 web worker 處理)*/
	// private dataDeal(fileEvent: Event) {
	// 	this.series = [];
	// 	const reader = new FileReader();
	// 	reader.onload = e => {
	// 		const txt = e.target?.result as string;
	// 		const lines = txt.split('\n');

	// 		for (let i = 0; i < lines.length; i++) {
	// 			const items = lines[i].split(',');

	// 			if (items.length >= 9) {
	// 				const m = this.$moment(items[0], 'YYYY/MM/DD HH:mm:ss');
	// 				if (m.isValid()) {
	// 					this.series.push({
	// 						datetime: m.valueOf(),
	// 						PG: parseInt(items[1]) / 100,
	// 						UpperTemp: parseInt(items[2]) / 10,
	// 						LowerTemp: parseInt(items[3]) / 10,
	// 						Flow: parseInt(items[4]) / 10,
	// 						PTVO: parseInt(items[5]) / 10,
	// 						PTVT: parseInt(items[6]) / 10,
	// 						PTVI: parseInt(items[7]) / 10,
	// 						Other: parseInt(items[8]) / 10
	// 					});
	// 				}
	// 			}
	// 			(fileEvent.target as HTMLInputElement).value = '';
	// 			AppModule.changeOverlay(false);
	// 		}
	// 	};
	// 	reader.readAsText(this.file as File);
	// }

	/**重置 Zoom */
	private resetZoom() {
		(this.chart as Chart).zoomOut();
	}

	private drawChart() {
		// const Obj: { [key: string]: [number, number][] } = {
		// 	PG: [],
		// 	upperTemp: [],
		// 	lowerTemp: [],
		// 	flow: [],
		// 	PTVO: [],
		// 	PTVT: [],
		// 	PTVI: [],
		// 	other: []
		// };

		const l = this.series.length;
		const inc = Math.ceil(l / 800);
		//
		const obj: [[number, number][]] = [[]];
		for (let i = 0; i < l; i += inc) {
			const item = this.series[i];
			const ts = item.datetime;
			for (let j = 0; j < item.data.length; j++) {
				if (obj[j] == undefined) obj[j] = [];
				obj[j].push([ts, item.data[j]]);
			}
		}

		const objSeries = obj.map((o, idx) => {
			let yaxis;
			if (this.names.length == 8) {
				switch (idx) {
					case 0:
					case 1:
						yaxis = 2;
						break;
					case 2: // 爐內
					case 3: // 管道
					case 4: // 蠟管
						yaxis = 0;
						break;
					case 5:
						yaxis = 1;
						break;
					default:
						yaxis = 3;
						break;
				}
			} else if (this.names.length == 12) {
				yaxis = 2;
			}

			return {
				type: 'line',
				name: this.names[idx],
				data: obj[idx],
				lineWidth: 1,
				yAxis: yaxis
			};
		});

		// console.log(objSeries);

		this.chart = Highcharts.chart('container', {
			boost: {
				enabled: true
				// useGPUTranslations: true
			},
			chart: {
				// type: 'line',
				marginTop: 80,
				zoomType: 'x',
				// height / width ratio
				height: (7 / 16) * 100 + '%',
				// height: 720,
				resetZoomButton: {
					position: { x: 0, y: -40 },
					theme: {
						style: {
							color: '#1976d2',
							fontSize: '14px',
							fontWeight: '800'
						},
						r: 5,
						states: {
							hover: {
								style: {
									backgroundColor: '#cfd8dc'
								}
							}
						}
					}
				},
				events: {
					render: e => {
						e.preventDefault();
						this.plotH = ((e.target as unknown) as Chart).plotHeight;
						this.$nextTick(() => {
							this.showMenu = false;
						});
					},
					click: e => {
						e.preventDefault();
						this.$nextTick(() => {
							this.showMenu = false;
						});
					},
					selection: e => {
						e.preventDefault();

						if (e.xAxis) {
							const data = this.series.filter(item => {
								return e.xAxis[0].min <= item.datetime && item.datetime <= e.xAxis[0].max;
							});
							//
							const l = data.length;
							const inc = Math.ceil(l / 800); // 進位
							//
							const obj: [[number, number][]] = [[]];
							for (let i = 0; i < l; i += inc) {
								const item = data[i];
								const ts = item.datetime;

								for (let j = 0; j < item.data.length; j++) {
									if (obj[j] == undefined) obj[j] = [];
									obj[j].push([ts, item.data[j]]);
								}
							}
							const objSeries = obj.map((o, idx) => {
								let yaxis;
								if (this.names.length == 8) {
									switch (idx) {
										case 0:
										case 1:
											yaxis = 2;
											break;
										case 2: // 爐內
										case 3: // 管道
										case 4: // 蠟管
											yaxis = 0;
											break;
										case 5:
											yaxis = 1;
											break;
										default:
											yaxis = 3;
											break;
									}
								} else if (this.names.length == 12) {
									yaxis = 2;
								}

								return {
									type: 'line',
									name: this.names[idx],
									data: obj[idx],
									lineWidth: 1,
									yAxis: yaxis
								};
							});

							//
							((e.target as unknown) as Chart).update({ series: objSeries as SeriesOptionsType[] });
							// e.target.showResetZoom();
						} else {
							//
							const series = this.series;
							const l = series.length;
							const inc = Math.ceil(l / 800);
							//
							const obj: [[number, number][]] = [[]];
							for (let i = 0; i < l; i += inc) {
								const item = series[i];
								const ts = item.datetime;
								for (let j = 0; j < item.data.length; j++) {
									if (obj[j] == undefined) obj[j] = [];
									obj[j].push([ts, item.data[j]]);
								}
							}
							const objSeries = obj.map((o, idx) => {
								let yaxis;
								if (this.names.length == 8) {
									switch (idx) {
										case 0:
										case 1:
											yaxis = 2;
											break;
										case 2: // 爐內
										case 3: // 管道
										case 4: // 蠟管
											yaxis = 0;
											break;
										case 5:
											yaxis = 1;
											break;
										default:
											yaxis = 3;
											break;
									}
								} else if (this.names.length == 12) {
									yaxis = 2;
								}

								return {
									type: 'line',
									name: this.names[idx],
									data: obj[idx],
									lineWidth: 1,
									yAxis: yaxis
								};
							});

							((e.target as unknown) as Chart).update({ series: objSeries as SeriesOptionsType[] });
						}
						return undefined;
					}
				}
			},
			title: {
				align: 'right',
				text: '爐溫曲線圖',
				x: -20,
				y: 25,
				style: {
					fontSize: '28px',
					fontWeight: '900',
					fontFamily: '微軟正黑體'
				}
			},
			subtitle: {
				// enabled: false
			},
			time: { timezoneOffset: -8 * 60 },
			xAxis: {
				events: {},
				// categories: xaxis,
				// tickInterval: 4 * 60 * 。60 * 1000, // 30 分鐘
				tickPixelInterval: 40,
				type: 'datetime',
				title: {
					text: 'Time',
					style: {
						fontWeight: '600',
						fontSize: '16px',
						fontFamily: 'consolas'
					}
				},
				labels: {
					style: {
						fontSize: '14px'
					}
				},
				crosshair: {
					width: 1,
					color: 'gray',
					dashStyle: 'Dot'
				},
				dateTimeLabelFormats: {
					day: '%m/%d'
				}
			},
			yAxis: [
				{
					// lineColor: 'darkcyan',
					lineWidth: 1,
					// tickColor: 'darkcyan',
					tickWidth: 1,
					tickAmount: 11,
					// tickInterval: 12,
					// max: 1200,
					// min: 0,
					title: {
						align: 'high',
						textAlign: 'center',
						text: 'Kpa',
						x: 20,
						y: -10,
						rotation: 0,
						style: {
							fontWeight: '500',
							fontSize: '16px',
							fontFamily: 'consolas'
						}
					}
				},
				{
					// lineColor: 'green',
					lineWidth: 1,
					// tickColor: 'green',
					tickWidth: 1,
					tickAmount: 11,
					tickInterval: 140 * 1000,
					title: {
						align: 'high',
						textAlign: 'center',
						text: 'Pa',
						x: 20,
						y: -10,
						rotation: 0,
						style: {
							fontWeight: '500',
							fontSize: '16px',
							fontFamily: 'consolas'
						}
					}
				},
				{
					opposite: true,
					// lineColor: 'red',
					lineWidth: 1,
					// tickColor: 'red',
					tickWidth: 1,
					tickAmount: 11,
					tickInterval: 180,
					title: {
						align: 'high',
						textAlign: 'center',
						text: '℃',
						x: -20,
						y: -10,
						rotation: 0,
						style: {
							fontWeight: '500',
							fontSize: '16px',
							fontFamily: 'consolas'
						}
					}
				},
				{
					opposite: true,
					// lineColor: 'blue',
					lineWidth: 1,
					// tickColor: 'blue',
					tickWidth: 1,
					tickAmount: 11,
					tickInterval: 110,
					title: {
						align: 'high',
						textAlign: 'center',
						text: 'L/min',
						x: -20,
						y: -10,
						rotation: 0,
						style: {
							fontWeight: '500',
							fontSize: '16px',
							fontFamily: 'consolas'
						}
					}
				}
			],
			legend: {
				layout: 'horizontal',
				align: 'right',
				verticalAlign: 'bottom',
				itemStyle: {
					fontSize: '16px'
				}
			},
			tooltip: {
				// enabled: false,
				shared: true,
				borderWidth: 0,
				backgroundColor: 'transparent',
				shadow: false,
				useHTML: true,
				padding: 0,
				xDateFormat: '%y/%m/%d %H:%M:%S',
				headerFormat:
					'<div class="d-flex align-center">' +
					'<div class="col font-weight-bold primary--text">{point.key}</div>',
				pointFormat:
					'<div class="col" style="color: {series.color}; min-width: 120px;">' +
					'<span class="font-weight-bold">{series.name}: </span><br>' +
					'<span>{point.y} {series.unit}</span></div>',
				footerFormat: '</div>',
				positioner: function() {
					return { x: 20, y: 0 };
				}
			},
			plotOptions: {
				line: {
					lineWidth: 1,
					states: {
						hover: {
							lineWidth: 1
						}
					},
					marker: {
						enabled: false
					},
					cursor: 'pointer',
					point: {
						events: {
							click: e => {
								e.preventDefault();
								const index = e.point.index;
								this.menuX = e.x;
								this.menuY = e.y;
								this.menuUppertemp = this.chart?.series[0].data[index].y as number;
								this.menuLowertemp = this.chart?.series[1].data[index].y as number;
								this.menuDate = this.$moment(this.chart?.series[0].data[index].x).format('yyyy/MM/DD');
								this.menuTime = this.$moment(this.chart?.series[0].data[index].x).format('HH:mm:ss');
								this.$nextTick(() => {
									this.showMenu = true;
								});
							}
							// mouseOut: () => {
							// 	this.$nextTick(() => {
							// 		this.showMenu = false;
							// 	});
							// }
						}
					}
				}
			},
			// series: [
			// 	{ type: 'line', name: this.names[0], data: Obj[0], lineWidth: 1, yAxis: 0, color: 'red' },
			// 	{ type: 'line', name: this.names[1], data: Obj[1], lineWidth: 1, yAxis: 0, color: 'purple' }
			// 	// { type: 'line', name: '真空度', data: Obj[2], lineWidth: 1, yAxis: 1, color: 'green' },
			// 	// { type: 'line', name: '爐內壓力', data: Obj[3], lineWidth: 1, yAxis: 0, color: 'darkcyan' },
			// 	// { type: 'line', name: '脫脂管道壓力', data: Obj[4], lineWidth: 1, yAxis: 0, color: 'orange' },
			// 	// { type: 'line', name: '分壓管道壓力', data: Obj[5], lineWidth: 1, yAxis: 0, color: 'gray' },
			// 	// { type: 'line', name: '氣體流量', data: Obj[6], lineWidth: 1, yAxis: 3, color: 'blue' },
			// 	// { type: 'line', name: this.names[7], data: Obj[7], lineWidth: 1, yAxis: 3, color: 'black' }
			// ],
			series: objSeries as SeriesOptionsType[],
			credits: {
				enabled: false
			}
		});
	}
}
</script>

<style lang="scss" scoped>
.dropZone {
	position: relative;
	font-weight: bold;
	height: 40px;
	border: 1px dashed gray;
	&:hover {
		border: 1px solid #1976d2;
		> .uploadBtn {
			.v-icon {
				color: #1976d2;
			}
			color: #1976d2;
		}
	}
	input[type='file'] {
		position: absolute;
		cursor: pointer;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
	}
}
.fixed-crosshair {
	position: absolute;
	margin: 0;
	border-left: 1px dashed black;
	top: 80px;
	left: 0;
	z-index: 3001;
}
</style>
