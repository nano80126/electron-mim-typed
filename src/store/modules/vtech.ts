import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store/index';

export interface VtechState {
	ip: string;
	port: number;
	connected: boolean;
	reconnect: boolean;
	sampling: boolean;
	connectionErr: NodeJS.ErrnoException | null;
}

@Module({ dynamic: true, store, name: 'vtech' })
class Vtech extends VuexModule implements VtechState {
	/**連線後記錄IP */
	public ip = '';
	/**連線後紀錄port */
	public port = 0;

	/**設備(恆普)是否連線 */
	public connected = false;
	/**是否自動重連 */
	public reconnect = false;
	/**取樣中 */
	public sampling = false;
	/**連線錯誤 */
	public connectionErr: NodeJS.ErrnoException | null = null;

	@Mutation
	changeIP(IP: string) {
		this.ip = IP;
	}

	@Mutation
	changePort(port: number) {
		this.port = port;
	}

	@Mutation
	changeConnected(bool: boolean) {
		this.connected = bool;
	}

	@Mutation
	changeReconnect(bool: boolean) {
		this.reconnect = bool;
	}

	@Mutation
	changeSampling(bool: boolean) {
		this.sampling = bool;
	}

	@Mutation
	changeConntionErr(err: NodeJS.ErrnoException | null) {
		this.connectionErr = err;
	}
}

export const VtechModule = getModule(Vtech);
