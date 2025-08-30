import * as base64 from 'base64-js';
import { TextEncoderLite, TextDecoderLite } from 'text-encoder-lite';
import { SocketWrapper } from "mpc-js-core";

interface Deferred {
	resolve: () => void;
	reject: (err: any) => void;
}

export class WebSocketWrapper implements SocketWrapper {

	private url: string;
	private textEncoder: TextEncoderLite;
	private textDecoder: TextDecoderLite;
	private wsClient?: WebSocket;
	private deferred?: Deferred;

	constructor(url: string) {
		this.url = url;
		this.textEncoder = new TextEncoderLite();
		this.textDecoder = new TextDecoderLite();
	}

	connect(receive: (msg: string) => void, emit?: (eventName: string, arg?: any) => void): Promise<void> {

		this.wsClient = new WebSocket(this.url, ['base64']);

		const promise = new Promise<void>((resolve, reject) => {
			this.deferred = { resolve, reject };
		});

		this.wsClient.onmessage = e => {
			if (this.deferred) {
				this.deferred.resolve();
				this.deferred = undefined;
			}
			receive(this.textDecoder.decode(base64.toByteArray(e.data)));
		}

		this.wsClient.onerror = err => {
			if (this.deferred) {
				this.deferred.reject(err);
				this.deferred = undefined;
			}
			if (emit) {
				emit('socket-error', err);
			}
		}

		this.wsClient.onclose = event => {
			if (this.deferred) {
				this.deferred.reject(event);
				this.deferred = undefined;
			}
			if (emit) {
				emit('socket-end', event);
			}
		}

		return promise;
	}

	send(msg: string): void {
		this.wsClient.send(base64.fromByteArray(this.textEncoder.encode(msg)));
	}

	disconnect(): void {
		this.wsClient.close();
	}
}
