import { globalShortcut } from 'electron';
import { win } from '@/background';

/** 註冊 global & local 快捷鍵 */
export function registerHotkey() {
	win?.webContents.on('before-input-event', (e, input) => {
		if (input.alt && input.key.toLocaleLowerCase() == 'f12') {
			win?.webContents.openDevTools();
			e.preventDefault();
		}
	});
}

/** 反註冊 global & local 快捷鍵 */
export function unregisterAllHotKey() {
	globalShortcut.unregisterAll();
	win?.webContents.removeAllListeners('before-input-event');
}
