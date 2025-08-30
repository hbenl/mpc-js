import { MPCCore } from 'mpc-js-core';
import { WebSocketWrapper } from './socketWrapper';

export class MPC extends MPCCore {

	public connectWebSocket(url: string): Promise<void> {
		return this.connect(new WebSocketWrapper(url));
	}

}
