/** ipcRenderer invoke command enum invoke ipcMain to do something
 *
 *  Furnace: HIPER
 */
export enum EsocketInvoke {
	CONNECT = 'conn-hiper',
	DISCONNECT = 'disc-hiper',
	ALTERRECONNECT = 'alter-reconnect-hiper',
	SAMPLE = 'sample-hiper',
	ALARMRES = 'alarm-res-hiper',
	ALARMRST = 'alarm-rst-hiper'
}

/** ipcRenderer send command enum invoke ipcMain to do something
 *
 *  Furnace: HIPER
 */
export enum EsocketSend {}

/** ipcRender On event when get send command from ipcMain
 *
 *  Furnace: HIPER
 */
export enum EsocketOn {
	CONNECTIONERROR = 'conn-error-hiper',
	CONNECTIONSUCCESS = 'conn-success-hiper',
	SAMPLINGCHANGED = 'sampling-changed-hiper',
	SERIAL = 'serial-hiper'
}
//
//
