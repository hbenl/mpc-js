import { connect, type Socket } from 'net';
import { MPC as MPCBase } from './mpc.js';
export type { MPDProtocol, MPDResponse, MPDError } from './protocol.js';
export type * from './commands/index.js';
export type * from './objects/index.js';

export class MPC extends MPCBase {

  public connectTCP(hostname = 'localhost', port = 6600): Promise<void> {
    return this.connectSocket(connect(port, hostname));
  }

  public connectUnixSocket(path: string): Promise<void> {
    return this.connectSocket(connect(path));
  }

  private connectSocket(socket: Socket) {
    return this.connect(
      socketReadableStream(socket),
      msg => socket.write(msg)
    );
  }
}

function socketReadableStream(socket: Socket): ReadableStream<ArrayBufferLike> {
  return new ReadableStream<ArrayBufferLike>({
    start(controller) {
      socket.on('data', chunk => controller.enqueue(chunk.buffer));
      socket.on('end', () => controller.close());
      socket.on('error', err => controller.error(err));
    },
    cancel() {
      socket.destroy();
    }
  });
}
