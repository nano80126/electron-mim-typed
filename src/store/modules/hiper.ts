import { getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store/index';

export interface HiperState {
	connected: boolean;
	reconnect: boolean;
	sampling: boolean;
	connectionErr: {};
}

@Module({ dynamic: true, store, name: 'hiper' })
class Hiper extends VuexModule implements HiperState {
	/**設備(恆普)是否連線 */
	public connected = false;
	/**是否自動重連 */
	public reconnect = false;
	/**取樣中 */
	public sampling = false;
	/**連線錯誤 */
	public connectionErr = {};

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
	changeConntionErr() {
		this.connectionErr = {};
	}
}

export const HiperModule = getModule(Hiper);
