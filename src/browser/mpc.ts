import { MPCCore } from '../core/mpcCore.js';
import { WebSocketWrapper } from './socketWrapper.js';

export class MPC extends MPCCore {

	public connectWebSocket(url: string): Promise<void> {
		return this.connect(new WebSocketWrapper(url));
	}

}
