import type { SocketWrapper } from "../core/socketWrapper.js";

interface Deferred {
  resolve: () => void;
  reject: (err: any) => void;
}

export class WebSocketWrapper implements SocketWrapper {

  private url: string;
  private wsClient?: WebSocket;
  private deferred?: Deferred;

  constructor(url: string) {
    this.url = url;
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
      receive(e.data); // TODO
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
    this.wsClient!.send(msg); // TODO
  }

  disconnect(): void {
    this.wsClient!.close();
  }
}
