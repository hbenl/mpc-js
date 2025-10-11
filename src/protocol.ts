import { EventEmitter } from 'eventemitter3';
import { decodeLines, groupResponseLines } from './transform.js';
import { isError, isInitialResponse } from './util.js';

/**
 * Implements the [general syntax](http://www.musicpd.org/doc/protocol/syntax.html)
 * of the [Music Player Daemon protocol](http://www.musicpd.org/doc/protocol/index.html)
 */
export class MPDProtocol extends EventEmitter {

  private readonly encoder = new TextEncoder();

  private _connection?: {
    responseStream: ReadableStream<MPDInitialResponse | MPDResponse | MPDError>;
    responseReader: ReadableStreamDefaultReader<MPDInitialResponse | MPDResponse | MPDError>;
    send: (msg: Uint8Array) => void;
  }

  private ready = false;
  private idle = false;
  private queuedRequests: MPDRequest[] = [];
  private runningRequests: MPDRequest[] = [];

  /**
   * The version (major, minor, patch) of the connected daemon
   */
  mpdVersion?: [number, number, number];

  get isReady() { return this.ready; }

  /**
   * Connect to the daemon
   */
  protected connect(
    byteStream: ReadableStream<ArrayBufferLike>,
    send: (msg: Uint8Array) => void
  ): Promise<void> {

    if (this._connection) {
      throw new Error('Client is already connected');
    }

    const responseStream = byteStream
      .pipeThrough(decodeLines())
      .pipeThrough(groupResponseLines());

    this._connection = {
      responseStream,
      responseReader: responseStream.getReader(),
      send,
    };

    return new Promise<void>(resolve => this.processResponses(resolve));
  }

  private async processResponses(initialCallback: () => void) {
    const reader = this._connection!.responseReader;
    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          this.emit('socket-end');
          this.disconnect();
          return;
        }

        if (isInitialResponse(value)) {
          this.mpdVersion = value.version;
          this.ready = true;
          initialCallback();
          this.emit('ready');
          this.dequeueRequests();
          continue;
        }

        if (this.runningRequests.length === 0) {
          const message = isError(value) ? value.errorMessage : value.lines.join('\n');
          const errorMessage = `Received unexpected message:\n${message}`;
          this.emit('socket-error', errorMessage);
          this.disconnect({ errorCode: -1, errorMessage });
          return;
        }

        const request = this.runningRequests.shift()!;
        if (!isError(value)) {
          request.resolve(value);
        } else {
          request.reject(value);
          this.queuedRequests.push(...this.runningRequests);
          this.runningRequests = [];
        }

        if (this.runningRequests.length === 0) {
          this.dequeueRequests();
        }
      }
    } catch (err) {
      this.emit('socket-error', err);
      this.disconnect({ errorCode: -1, errorMessage: `Unknown error: ${err}`});
    }
  }

  /**
   * Disconnect from the daemon
   */
  disconnect(err = { errorCode: -1, errorMessage: 'Disconnected' }) {

    this.runningRequests.forEach(request => request.reject(err));
    this.queuedRequests.forEach(request => request.reject(err));

    this.ready = false;
    this.idle = false;
    this.runningRequests = [];
    this.queuedRequests = [];
    this.mpdVersion = undefined;

    const connection = this._connection;
    if (connection) {
      this._connection = undefined;
      connection.responseReader.releaseLock();
      connection.responseStream.cancel();
    }
  }

  /**
   * Send a command to the daemon. The returned promise will be resolved with an array
   * containing the lines of the daemon's response.
   */
  sendCommand(cmd: string): Promise<MPDResponse> {
    return new Promise<MPDResponse>((resolve, reject) => {
      const mpdRequest = { cmd, resolve, reject };
      this.enqueueRequest(mpdRequest);
    });
  }

  private enqueueRequest(mpdRequest: MPDRequest) {

    if (!this._connection) throw new Error('Not connected');

    this.queuedRequests.push(mpdRequest);
    if (this.idle) {
      this.send('noidle\n');
      this.idle = false;
    }
  }

  private dequeueRequests() {
    if (this.queuedRequests.length > 0) {
      this.runningRequests = this.queuedRequests;
      this.queuedRequests = [];
      this.idle = false;
    } else {
      this.runningRequests = [{ cmd: 'idle', resolve: response => this.idleCallback(response), reject: () => {} }];
      this.idle = true;
    }
    let commandString: string;
    if (this.runningRequests.length == 1) {
      commandString = this.runningRequests[0]!.cmd + '\n';
    } else {
      commandString = 'command_list_ok_begin\n';
      this.runningRequests.forEach(command => {
        commandString += command.cmd + '\n';
      });
      commandString += 'command_list_end\n';
    }
    this.send(commandString);
  }

  private idleCallback(response: MPDResponse) {
    this.idle = false;
    const subsystems = response.lines.map(changed => changed.substring(9));
    this.emit('changed', subsystems);
    subsystems.forEach(subsystem => this.emit(`changed-${subsystem}`));
  }

  private send(cmd: string) {
    this._connection!.send(this.encoder.encode(cmd));
  }
}

export interface MPDInitialResponse {
  version: [number, number, number];
}

export interface MPDResponse {
  lines: string[];
  binary?: ArrayBuffer;
};

/**
 * A failure response from the daemon
 */
export interface MPDError {
  errorCode: number;
  errorMessage: string;
}

interface MPDRequest {
  cmd: string;
  resolve: (response: MPDResponse) => void;
  reject: (error: MPDError) => void;
}
