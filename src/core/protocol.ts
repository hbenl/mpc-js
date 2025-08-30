import { EventEmitter } from 'eventemitter3';
import type { SocketWrapper } from './socketWrapper.js';
import { stringStartsWith } from './util.js';

/**
 * Implements the [general syntax](http://www.musicpd.org/doc/protocol/syntax.html)
 * of the [Music Player Daemon protocol](http://www.musicpd.org/doc/protocol/index.html)
 */
export class MPDProtocol extends EventEmitter {

  private static failureRegExp = /ACK \[([0-9]+)@[0-9]+\] \{[^\}]*\} (.*)/;

  private _connection?: SocketWrapper;

  private ready = false;
  private idle = false;
  private runningRequests: MPDRequest[] = [];
  private queuedRequests: MPDRequest[] = [];
  private receivedLines: string[] = [];

  /**
   * The version (major, minor, patch) of the connected daemon
   */
  mpdVersion?: [number, number, number];

  get isReady() { return this.ready; }

  /**
   * Connect to the daemon via the given connection
   */
  protected connect(connection: SocketWrapper): Promise<void> {

    if (this._connection) {
      throw new Error('Client is already connected');
    }

    this._connection = connection;
    return this._connection.connect(
      msg => this.processReceivedMessage(msg),
      (eventName, arg) => this.emit(eventName, arg)
    );
  }

  /**
   * Disconnect from the daemon
   */
  disconnect() {

    if (!this._connection) {
      throw new Error('Client isn\'t connected');
    }

    this.runningRequests.forEach(request => request.reject('Disconnected'));
    this.queuedRequests.forEach(request => request.reject('Disconnected'));

    this._connection.disconnect();
    this._connection = undefined;
    this.ready = false;
    this.idle = false;
    this.runningRequests = [];
    this.queuedRequests = [];
    this.receivedLines = [];
  }

  /**
   * Send a command to the daemon. The returned promise will be resolved with an array 
   * containing the lines of the daemon's response.
   */  
  sendCommand(cmd: string): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      const mpdRequest = { cmd, resolve, reject };
      this.enqueueRequest(mpdRequest);
    });
  }

  /**
   * Helper function for parsing a response from the daemon into an array of objects
   * @param lines    The daemon response
   * @param markers  Markers are keys denoting the start of a new object within the response
   * @param convert  Converts a key-value Map from the response into the desired target object
   */  
  parse<T>(lines: string[], markers: string[], convert: (valueMap: Map<string, string>) => T): T[] {
    const result = new Array<T>();
    let currentValueMap = new Map<string, string>();
    let lineCount = 0;

    lines.forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex);
        const value = line.substring(colonIndex + 2);
        if ((lineCount > 0) && markers.some(marker => (marker == key))) {
          result.push(convert(currentValueMap));
          currentValueMap = new Map<string, string>();
        }
        if (currentValueMap.has(key)) {
          const multiValue = [currentValueMap.get(key), value].join(';');
          currentValueMap.set(key, multiValue);
        }
        else {
          currentValueMap.set(key, value);
        }
        lineCount++;
      }
    });
    if (lineCount > 0) {
      result.push(convert(currentValueMap));
    }

    return result;
  }

  parseGrouped<T>(lines: string[], groupingTag: string | undefined): Map<string, string[]> {
    const result = new Map<string, string[]>();
    let currentGroup = "";
    let currentValues: string[] = [];
    let lineCount = 0;

    lines.forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex);
        const value = line.substring(colonIndex + 2);
        if (groupingTag == key) {
          if (lineCount > 0) {
            result.set(currentGroup, currentValues);
          }
          currentGroup = value;
          currentValues = [];
        } else {
          currentValues.push(value);
        }
        lineCount++;
      }
    });
    if (lineCount > 0) {
      result.set(currentGroup, currentValues);
    }

    return result;
  }

  private enqueueRequest(mpdRequest: MPDRequest) {

    if (!this._connection) throw new Error('Not connected');

    this.queuedRequests.push(mpdRequest);
    if (this.idle) {
      this._connection.send('noidle\n');
      this.idle = false;
    }
  }

  private processReceivedMessage(msg: string) {
    if (!this.ready) {
      this.initialCallback(msg.substring(0, msg.length - 1));
      this.ready = true;
      this.dequeueRequests();
      return;
    }
    if (this.receivedLines.length > 0) {
      const lastPreviousLine = this.receivedLines.pop();
      msg = lastPreviousLine + msg;
    }
    const lines = msg.split('\n');
    for (let i = 0; i < (lines.length - 1); i++) {
      const line = lines[i]!;
      if ((line == 'list_OK') || (line == 'OK')) {
        if (this.runningRequests.length > 0) {
          const req = this.runningRequests.shift()!;
          req.resolve(this.receivedLines);
          this.receivedLines = [];
        }
      } else if (stringStartsWith(line, 'ACK [')) {
        if (this.runningRequests.length > 0) {
          const req = this.runningRequests.shift()!;
          const match = MPDProtocol.failureRegExp.exec(line);
          if (match != null) {
            const mpdError: MPDError = { errorCode: Number(match[1]), errorMessage: match[2]! };
            req.reject(mpdError);
            this.queuedRequests = this.runningRequests.concat(this.queuedRequests);
            this.runningRequests = [];
          }
          this.receivedLines = [];
        }
      } else {
        this.receivedLines.push(line);
      }
    }
    this.receivedLines.push(lines[lines.length - 1]!);
    if ((lines.length >= 2) && (lines[lines.length - 1] == '') && 
      ((lines[lines.length - 2] == 'OK') || stringStartsWith(lines[lines.length - 2]!, 'ACK ['))) {
      this.dequeueRequests();
    }
  }

  private dequeueRequests() {
    if (this.queuedRequests.length > 0) {
      this.runningRequests = this.queuedRequests;
      this.queuedRequests = [];
      this.idle = false;
    } else {
      this.runningRequests = [{ cmd: 'idle', resolve: lines => this.idleCallback(lines), reject: () => {} }];
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
    this._connection!.send(commandString);
  }

  private initialCallback(msg: string) {

    const match = /^OK MPD ([0-9]+)\.([0-9]+)\.([0-9]+)/.exec(msg);
    if (!match) throw new Error(`Received unexpected initial message from mpd: '${msg}'`);

    this.mpdVersion = [ Number(match[1]), Number(match[2]), Number(match[3]) ];
    this.emit('ready');
  }

  private idleCallback(lines: string[]) {
    this.idle = false;
    const subsystems = lines.map(changed => changed.substring(9));
    this.emit('changed', subsystems);
    subsystems.forEach(subsystem => this.emit(`changed-${subsystem}`));
  }
}

/**
 * A failure response from the daemon
 */
export interface MPDError {
  errorCode: number;
  errorMessage: string;
}

interface MPDRequest {
  cmd: string;
  resolve: (lines: string[]) => void;
  reject: (error: any) => void;
}
