'use strict';

declare const __static: string;

import { app, protocol, BrowserWindow, ipcMain, Tray, Menu } from 'electron';
import path from 'path';

import {
	createProtocol
	/* installVueDevtools */
} from 'vue-cli-plugin-electron-builder/lib';
// import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
const isDevelopment = process.env.NODE_ENV !== 'production';

// import crawler
// import './api/fastify';
import './api/log4js';
import './api/express';
import './api/socket/socket_hiper';
import './api/socket/socket_vtech';
import './api/cron';
import { message } from '@/api/line';
// import './api/sharp';

import { registerHotkey, unregisterAllHotKey } from './api/hotkey';
// import { config, saveConfig } from './api/fs';
// import { mongoCLient } from './api/mongo';

// import './api/mongo';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
// let win: BrowserWindow | null = null;
let tray: Tray | null = null;

// windows
let win: BrowserWindow | null = null;
let mainWin: Electron.webContents | null;
const child: BrowserWindow | null = null;
// const childCloseTimer: NodeJS.Timeout | null = null;
//

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

// const mainMenu = Menu.buildFromTemplate([
// 	{
// 		label: 'File',
// 		type: 'submenu',
// 		submenu: [{ role: 'close' }]
// 	},
// 	{
// 		label: 'Window',
// 		type: 'submenu',
// 		submenu: [{ role: 'toggleDevTools' }]
// 	}
// ]);

function createWindow() {
	// Create the browser window.
	win = new BrowserWindow({
		title: 'furnace viewer',
		backgroundColor: '#212121',
		// backgroundColor: 'transparent',
		minWidth: 1280,
		width: 1600,
		// maxWidth: 720,
		minHeight: 720,
		height: 900,
		///
		x: 30,
		y: 40,
		// frame: false,
		// opacity: 0.5,
		// autoHideMenuBar: true,
		// transparent: true,
		autoHideMenuBar: true,
		frame: false,
		resizable: true,
		show: false,
		webPreferences: {
			nodeIntegration: true
			// enableRemoteModule: true
		}
	});
	if (process.env.NODE_ENV == 'production') win.removeMenu();
	// win.setMenu(mainMenu);
	// Menu.setApplicationMenu(mainMenu);

	if (process.env.WEBPACK_DEV_SERVER_URL) {
		// Load the url of the dev server if in development mode
		win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
		if (!process.env.IS_TEST) win.webContents.openDevTools();
	} else {
		createProtocol('app');
		// Load the index.html when not in development
		win.loadURL('app://./index.html');
		// win.loadURL(`http://localhost:${process.env.VUE_APP_PORT}/electron`);
	}

	win.on('ready-to-show', () => {
		if (win?.webContents) mainWin = win.webContents;
		win?.show();
	});

	// win.on('close', () => {
	// 	/**關閉前紀錄現在視窗位置 */
	// 	const bound = win?.getBounds();
	// 	saveConfig({ x: bound?.x, y: bound?.y });
	// });

	win.on('closed', () => {
		win = null;
	});
}

app.on('before-quit', () => {
	if (tray) tray.destroy();
	// if (mongoCLient) mongoCLient.close();
	unregisterAllHotKey();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
	// On macOS it is common for applications and their menu bar
	// to stay active until the user quits explicitly with Cmd + Q
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

// app.disableHardwareAcceleration();

app.on('ready', () => {
	// const iconPath = path.resolve(__dirname, 'trayicon.ico');
	// const trayIcon = nativeImage.createFromPath(iconPath);
	// trayIcon.resize({ width: 16, height: 16 });
	// console.log(iconPath);
	tray = new Tray(path.resolve(__static, 'icons/trayicon.ico'));
	const contextMenu = Menu.buildFromTemplate([
		{
			label: 'Open',
			type: 'normal',
			click: () => win?.show()
		},
		{ type: 'separator' },
		// { label: 'Item2', type: 'radio' },
		// { label: 'Item3', type: 'radio', cheked: true },
		{
			label: 'Close',
			type: 'normal',
			click: () => win?.close()
		}
	]);
	tray.setToolTip('furnace viewer');
	tray.setContextMenu(contextMenu);

	tray.on('double-click', () => {
		win?.show();
	});
	// tray.ball
});

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (win === null) {
		createWindow();
	}
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', async () => {
// 	if (isDevelopment && !process.env.IS_TEST) {
// 		// Install Vue Devtools
// 		// Devtools extensions are broken in Electron 6.0.0 and greater
// 		// See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
// 		// Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
// 		// If you are not using Windows 10 dark mode, you may uncomment these lines
// 		// In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
// 		// try {
// 		//   await installVueDevtools()
// 		// } catch (e) {
// 		//   console.error('Vue Devtools failed to install:', e.toString())
// 		// }
// 	}
// 	createWindow();
// });

app.whenReady().then(() => {
	createWindow();

	registerHotkey();

	// installExtension(VUEJS_DEVTOOLS)
	// 	.then(name => {
	// 		console.log(`Add Extension: ${name}`);
	// 	})
	// 	.catch(err => {
	// 		console.log('An error occurred', err);
	// 	});
});

// // // // // // // // // // // // // // // // // // //
ipcMain.on('windowMin', () => {
	win?.minimize();
});

ipcMain.on('windowMax', () => {
	win?.maximize();
});

ipcMain.on('windowRestore', () => {
	win?.restore();
});

ipcMain.on('windowHide', () => {
	win?.hide();
});

// ipcMain.on('panelHide', () => {
// 	child?.hide();
// 	// 10 分鐘後關閉 child
// 	childCloseTimer = setTimeout(() => {
// 		child?.close();
// 	}, 1000 * 60 * 10);
// });

ipcMain.on('windowWidth', (e, args) => {
	if (win?.isMaximized()) win?.restore();
	win?.setSize(args.width, win?.getSize()[1], true);
});

ipcMain.on('appClose', () => {
	win?.close();
});

ipcMain.handle('isMaxmized', () => {
	return win?.isMaximized();
});
// // // // // // // // // // // // // // // // // // //

/**Line notify test */
ipcMain.on('notifySend', (e, args) => {
	const { msg } = args;
	message(msg)
		.then(res => {
			e.sender.send('notifyRes', res.data);
		})
		.catch((err: NodeJS.ErrnoException) => {
			e.sender.send('notifyRes', { error: true, code: err.code, message: err.message });
		});
});

/**同步語言 */
// ipcMain.on('syncLanguage', (e, args) => {
// 	locale = args.locale;
// 	child?.webContents.send('syncLanguage', locale);
// });

/**登入 */
ipcMain.handle('loginCheck', (e, args) => {
	const { user, pass } = args;
	return user == process.env.VUE_APP_USER && pass == process.env.VUE_APP_PASS;
});

// // // // // // // // // // // // // // // // // // //

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
	if (process.platform === 'win32') {
		process.on('message', data => {
			if (data === 'graceful-exit') {
				app.quit();
			}
		});
	} else {
		process.on('SIGTERM', () => {
			app.quit();
		});
	}
}

export { win, mainWin, child, tray };
