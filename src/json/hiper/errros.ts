const R30028 = [
	'壓縮空氣壓力低下', // b0
	'氬氣壓力低下', // b1
	'氮氣壓力低下', // b2
	'停電', // b3
	'捕蠟器壓力超出上限', // b4
	'分壓燒結壓力偏差超出上限', // b5
	'滑閥泵(RP)接觸器異常', // b6
	'滑閥泵(RP)斷路器異常', // b7
	'滑閥泵(RP)熱繼電器異常動作', // b8
	'羅茨泵(MB)熱繼電器異常動作', // b9
	'冷卻風機(FAN)熱繼電器異常動作', // b10
	'功率控制器異常', // b11
	'PLC模擬採集異常', // b12
	'PLC電池電量低下', // b13
	'脫蠟管道(後)溫度偏差超出上限', // b14
	'收蠟罐入口管道溫度偏差超出上限', // b15
	'捕蠟器溫度偏差超出上限', // b16
	'捕蠟器上方管道溫度偏差超出上限', // b17
	'滑閥泵入口管道溫度偏差超出上限', // b18
	'爐下管道溫度偏差超出上限', // b19
	'上部溫度超出上限', // b20
	'下部溫度超出上限', // b21
	'氣體充入時間超出上限', // b22
	'上部電极水量低下', // b23
	'下部電极水量低下', // b24
	'滑閥泵(RP)水量低下', // b25
	'羅茨泵(MB)水量低下', // b26
	'上部溫度偏差超出上限', // b27
	'下部溫度偏差超出上限', // b28
	'脫蠟管道(後)溫度超出上限', // b29
	'收蠟罐入口管道溫度超出上限', // b30
	'捕蠟器溫度超出上限' // b31
];

const R30030 = [
	'捕蠟器上方管道溫度超出上限', // b0
	'滑閥泵入口管道溫度超出上限', // b1
	'爐下管道溫度超出上限', // b2
	'工藝流程錯誤', // b3
	'真空檢漏沒有通過', // b4
	'溫度控制器運行異常', // b5
	'質量流量控制器偏差超出上限', // b6
	'真空&氣體子程序異常', // b7
	'蠟罐出口管道溫度偏差超出上限', // b8
	'分壓管道溫度超限', // b9
	'收蠟罐出口管道溫度超出上限', // b10
	'分壓管道溫度超出上限', // b11
	'再處理時，負壓脫脂工藝沒有找到', // b12
	'蠟收集器水量低下', // b13
	'後爐門水量低下', // b14
	'冷卻風機水量低下', // b15
	'爐體(後)水量低下', // b16
	'爐體(泵口)水量低下', // b17
	'爐體(前)水量低下', // b18
	'前爐門水量低下', // b19
	'爐內壓力超過上限值(超壓)', // b20
	'脫蠟管道(前)溫度偏差超出上限', // b21
	'脫蠟管道(前)溫度超出上限', // b22
	'氬氣壓力警告', // b23
	'氮氣壓力警告', // b24
	'脫脂時爐內壓力超出上限(管道堵塞)', // b25
	'負壓脫脂壓差超出下限', // b26
	'轉入真空內抽工藝時超出時間', // b27
	'石墨箱的上蓋打開故障', // b28
	'自動程序被操作人員終止', // b29
	'銅熱交換器水量不足', // b30
	'分壓燒結時PG數據異常' // b31
];

const R30032 = [
	'真空燒結時PG數據異常', // b0
	'管道溫度超過了極限溫度', // b1
	'可控脫脂壓力偏差超出上限', // b2
	'後門2水量低下', // b3
	'爐體(前後)水量低下', // b4
	'爐體(後前)水量低下', // b5
	'可控脫脂管道溫度偏差超出上限', // b6
	'可控脫脂管道溫度超出上限', // b7
	'操作人員進行了工藝跳步操作(警告)', // b8
	'脫蠟管道(後)溫度通訊異常', // b9
	'脫蠟管道(前)溫度通訊異常', // b10
	'收蠟罐進口管道溫度通訊異常', // b11
	'收蠟罐出口管道溫度通訊異常', // b12
	'捕蠟器溫度通訊異常', // b13
	'捕蠟器上方管道溫度通訊異常', // b14
	'捕蠟器下方管道溫度通訊異常', // b15
	'無報警，測試用', // b16
	'分壓管道溫度通訊異常', // b17
	'爐下管道溫度通訊異常', // b18
	'可控脫蠟管道溫度通訊異常' // b19
];

// module.exports = { r30028, r30030, R30032 };
export { R30028, R30030, R30032 };