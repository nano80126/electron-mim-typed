import {
	IwsMessage,
	IwsConnectedMessasge,
	IwsOpenMessage,
	IwsSerialMessage,
	IwsCommandMessage,
	IwsCommandResMessage
} from '.';

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

export type IwsMsg = IwsMessage;
export type IwsOpenMsg = IwsOpenMessage;
export type IwsConnMsg = IwsConnectedMessasge;
export type IwsSerialMsg = IwsSerialMessage;
export type IwsCmdMsg = IwsCommandMessage;
export type IwsCmdResMsg = IwsCommandResMessage;
