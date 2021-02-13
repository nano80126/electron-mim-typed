import {
	ItextConfig,
	IlistCrawled,
	IlyricsObjCrawled,
	IwsMessage,
	IwsConnectedMessasge,
	IwsOpenMessage,
	IwsSerialMessage,
	IwsCommandMessage,
	IwsCommandResMessage
} from './main-process';

export enum EwsChannel {
	OPEN = 0,
	CONNECT = 1,
	SERIAL = 2,
	COMMAND = 3,
	COMMANDRES = 4
}

export enum EwsFurnaceType {
	NONE = 0,
	HIPER = 1,
	VTECH = 2
}

export enum EwsCommand {
	ALARMRESPONSE = 0,
	ALARMRESET = 1
}

export type WsFurnaceType = EwsFurnaceType;
export type IwsMsg = IwsMessage;
export type IwsOpenMsg = IwsOpenMessage;
export type IwsConnMsg = IwsConnectedMessasge;
export type IwsSerialMsg = IwsSerialMessage;
export type IwsCmdMsg = IwsCommandMessage;
export type IwsCmdResMsg = IwsCommandResMessage;

//
// 以下待刪
//
export type IdisplayTxt = ItextConfig;

/**extend from list crawled add exist */
export interface IlistSearched extends IlistCrawled {
	exist: boolean;
}

/**extend from lyrics obj crawled add exist */
export interface IlyricsObjSearched {
	obj: IlyricsObjCrawled;
	exist: boolean;
}

/**interface for response object of invoke getLyrics */
export type IlyricsObj = IlyricsObjCrawled;

/**interface for display.vue lyrics object */
export interface IlyricsDisplayObj extends IlyricsObj {
	imagePath?: string;
	imageSize?: { width: number; height: number };
}

/**interface of keywords have searched */
export interface Ikeywords {
	artist: string;
	title: string;
	datetime: string;
}

/**interfave fot youtube url object */
export interface IyouTubeObj {
	videoID?: string;
	videoUrl: string;
	videoTitle?: string;
	artist?: string;
	cover?: boolean;
}

/**interface rect for icon region */
export interface Irectangle {
	x: number;
	y: number;
	width: number;
	height: number;
}

/**interface for list object saved in mongodb */
export interface IsongList {
	artist: string;
	title: string;
	lyricsUrl: string;
	lyricsKey: string;

	videoArr?: IyouTubeObj[];

	imagePath?: string;
	iconPath?: string;
	imageSize?: { width: number; height: number };
	rectangle?: Irectangle;

	datetime: string;
}

/**interface for list.vue with icon */
export interface IsongListWithIcon extends IsongList {
	icon: Buffer;
}
