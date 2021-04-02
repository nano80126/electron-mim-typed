import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store/index';

export interface HiperState {
	ip: string;
	port: number;
	connected: boolean;
	reconnect: boolean;
	sampling: boolean;
	connectionErr: NodeJS.ErrnoException | null;
}

@Module({ dynamic: true, store, name: 'hiper' })
class Hiper extends VuexModule implements HiperState {
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
	changeHiperIP(IP: string) {
		this.ip = IP;
	}

	@Mutation
	changeHiperPort(port: number) {
		this.port = port;
	}

	@Mutation
	changeHiperConnected(bool: boolean) {
		this.connected = bool;
	}

	@Mutation
	changeHiperReconnect(bool: boolean) {
		this.reconnect = bool;
	}

	@Mutation
	changeHiperSampling(bool: boolean) {
		this.sampling = bool;
	}

	@Mutation
	changeHiperConntionErr(err: NodeJS.ErrnoException | null) {
		this.connectionErr = err;
	}
}

export const HiperModule = getModule(Hiper);
