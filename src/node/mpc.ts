import * as net from 'net';
import { MPCCore } from '../core/mpcCore.js';
import { NodeSocketWrapper } from "./socketWrapper.js";

export class MPC extends MPCCore {

	public connectTCP(hostname: string = 'localhost', port: number = 6600): Promise<void> {
		return this.connect(new NodeSocketWrapper(() => net.connect(port, hostname)));
	}

	public connectUnixSocket(path: string): Promise<void> {
		return this.connect(new NodeSocketWrapper(() => net.connect(path)));
	}

}
