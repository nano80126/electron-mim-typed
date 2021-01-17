import { globalShortcut } from 'electron';
import { win } from '@/background';

/** 註冊 global 快捷鍵 */
export function registerHotkey() {
	globalShortcut.register('Alt+-', () => {
		if (win) {
			win.webContents.send('volumeMinus');
		}
	});

	globalShortcut.register('Alt+=', () => {
		if (win) {
			win.webContents.send('volumePlus');
		}
	});

	globalShortcut.register('Alt+F5', () => {
		if (win) {
			win.webContents.send('playVideo');
		}
	});

	globalShortcut.register('Alt+F6', () => {
		if (win) {
			win.webContents.send('pauseVideo');
		}
	});

	globalShortcut.register('Alt+F7', () => {
		win?.show();
	});

	globalShortcut.register('Alt+F8', () => {
		win?.hide();
	});

	globalShortcut.register('Alt+F12', () => {
		win?.webContents.openDevTools();
	});
}

/** 反註冊 global 快捷鍵 */
export function unregisterAllHotKey() {
	globalShortcut.unregisterAll();
}
