/**ipcRenderer invoke command enum invoke ipcMain to do something
 *
 * Furnace: VTECH
 */
export enum EsocketInvoke {
	CONNECT = 'conn-vtech',
	DISCONNECT = 'disc-vtech',
	SAMPLE = 'sample-vtech',
	ALARMRES = 'alarm-res-vtech',
	ALARMRST = 'alarm-rst-vtech'
}

/**ipcRenderer send command enum invoke ipcMain to do something
 *
 * Furnace: VTECH
 */
export enum EsocketSend {}

/**ipcRender On event when get send command from ipcMain
 *
 * Furnace: VTECH
 */
export enum EsocketOn {
	CONNECTIONERROR = 'conn-error-vtech',
	CONNECTIONSUCCESS = 'conn-success-vtech',
	SAMPLINGCHANGED = 'sampling-changed-vtech'
}
//
//
