import { MPCCore } from '../core/mpcCore.js';

export class MPC extends MPCCore {

  public connectWebSocket(url: string): Promise<void> {
    const webSocket = new WebSocket(url, ['binary']);
    return this.connect(
      webSocketReadableStream(webSocket),
      msg => webSocket.send(msg)
    );
  }

}

function webSocketReadableStream(webSocket: WebSocket): ReadableStream<ArrayBuffer> {
  const blobStream = new ReadableStream<Blob>({
    start(controller) {
      webSocket.onmessage = event => controller.enqueue(event.data);
      webSocket.onclose = () => controller.close();
      webSocket.onerror = error => controller.error(error);
    },
    cancel() {
      webSocket.close();
    },
  });

  return blobStream.pipeThrough(
    new TransformStream<Blob, ArrayBuffer>({
      async transform(data, controller) {
        controller.enqueue(await data.arrayBuffer());
      }
    }
  ));
}
