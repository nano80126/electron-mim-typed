/**ipcRenderer invoke command enum invoke ipcMain to do something
 *
 * Furnace: HIPER
 */
export enum EsocketInvoke {
	CONNECT = 'conn-hiper',
	DISCONNECT = 'disc-hiper',
	SAMPLE = 'sample-hipder',
	ALARMRES = 'alarm-res-hiper',
	ALARMRST = 'alarm-rst-hipder'
}

/**ipcRenderer send command enum invoke ipcMain to do something
 *
 * Furnace: HIPER
 */
export enum EsocketSend {}

/**ipcRender On event when get send command from ipcMain
 *
 * Furnace: HIPER
 */
export enum EsocketOn {}
//
//
