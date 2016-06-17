import { EventEmitter } from 'events';
import { SocketWrapper } from './socketWrapper';
import { stringStartsWith } from './util';

/**
 * Implements the [general syntax](http://www.musicpd.org/doc/protocol/syntax.html)
 * of the [Music Player Daemon protocol](http://www.musicpd.org/doc/protocol/index.html)
 */
export class MPDProtocol extends EventEmitter {

	private static failureRegExp = /ACK \[([0-9]+)@[0-9]+\] \{[^\}]*\} (.*)/;

	private _connection: SocketWrapper;

	private ready = false;
	private idle = false;
	private runningRequests: MPDRequest[] = [];
	private queuedRequests: MPDRequest[] = [];
	private receivedLines: string[] = [];

	/**
	 * The version (major, minor, patch) of the connected daemon
	 */
	mpdVersion: [number, number, number];

	get isReady() { return this.ready; }

	/**
	 * Connect to the daemon via the given connection
	 */
	protected connect(connection: SocketWrapper) {
		this._connection = connection;
		this._connection.connect((msg) => this.processReceivedMessage(msg));
	}

	/**
	 * Disconnect from the daemon
	 */
	disconnect() {
		this._connection.disconnect();
		this._connection = null;
		this.ready = false;
		this.idle = false;
		this.queuedRequests = [];
		this.receivedLines = [];
	}

	/**
	 * Send a command to the daemon. The returned promise will be resolved with an array 
	 * containing the lines of the daemon's response.
	 */	
	sendCommand(cmd: string): Promise<string[]> {
		return new Promise<string[]>((resolve, reject) => {
			var mpdRequest = { cmd, resolve, reject };
			this.enqueueRequest(mpdRequest);
		});
	}

	/**
	 * Helper function for parsing a response from the daemon into an array of objects
	 * @param lines		The daemon response
	 * @param markers	Markers are keys denoting the start of a new object within the response
	 * @param convert	Converts a key-value Map from the response into the desired target object
	 */	
	parse<T>(lines: string[], markers: string[], convert: (valueMap: Map<string, string>) => T): T[] {
		var result = new Array<T>();
		var currentValueMap = new Map<string, string>();
		var lineCount = 0;

		lines.forEach((line) => {
			var colonIndex = line.indexOf(':');
			if (colonIndex > 0) {
				var key = line.substring(0, colonIndex);
				var value = line.substring(colonIndex + 2);
				if ((lineCount > 0) && markers.some(marker => (marker == key))) {
					result.push(convert(currentValueMap));
					currentValueMap = new Map<string, string>();
				}
				currentValueMap.set(key, value);
				lineCount++;
			} else {
				console.log('Huh? "' + line + '" at line ' + lineCount);
			}
		});
		if (lineCount > 0) {
			result.push(convert(currentValueMap));
		}

		return result;
	}

	private enqueueRequest(mpdRequest: MPDRequest) {
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
			var lastPreviousLine = this.receivedLines.pop();
			msg = lastPreviousLine + msg;
		}
		var lines = msg.split('\n');
		for (var i = 0; i < (lines.length - 1); i++) {
			var line = lines[i];
			if ((line == 'list_OK') || (line == 'OK')) {
				if (this.runningRequests.length > 0) {
					var req = this.runningRequests.shift();
					req.resolve(this.receivedLines);
					this.receivedLines = [];
				}
			} else if (stringStartsWith(line, 'ACK [')) {
				if (this.runningRequests.length > 0) {
					var req = this.runningRequests.shift();
					var match = MPDProtocol.failureRegExp.exec(line);
					if (match != null) {
						var mpdError: MPDError = { errorCode: Number(match[1]), errorMessage: match[2] };
						req.reject(mpdError);
						this.queuedRequests = this.runningRequests.concat(this.queuedRequests);
						this.runningRequests = [];
					} else {
						console.log('WTF? "' + line + '"');
					}
					this.receivedLines = [];
				}
			} else {
				this.receivedLines.push(line);
			}
		}
		this.receivedLines.push(lines[lines.length - 1]);
		if ((lines.length >= 2) && (lines[lines.length - 1] == '') && 
			((lines[lines.length - 2] == 'OK') || stringStartsWith(lines[lines.length - 2], 'ACK ['))) {
			this.dequeueRequests();
		}
	}

	private dequeueRequests() {
		if (this.queuedRequests.length > 0) {
			this.runningRequests = this.queuedRequests;
			this.queuedRequests = [];
			this.idle = false;
		} else {
			this.runningRequests = [{ cmd: 'idle', resolve: (lines) => this.idleCallback(lines), reject: () => {} }];
			this.idle = true;
		}
		var commandString: string;
		if (this.runningRequests.length == 1) {
			commandString = this.runningRequests[0].cmd + '\n';
		} else {
			commandString = 'command_list_ok_begin\n';
			this.runningRequests.forEach((command) => {
				commandString += command.cmd + '\n';
			});
			commandString += 'command_list_end\n';
		}
		this._connection.send(commandString);
	}

	private initialCallback(msg: string) {
		var match = /^OK MPD ([0-9]+)\.([0-9]+)\.([0-9]+)/.exec(msg);
		this.mpdVersion = [ Number(match[1]), Number(match[2]), Number(match[3]) ];
		this.emit('ready');
	}

	private idleCallback(lines: string[]) {
		this.idle = false;
		var subsystems = lines.map(changed => changed.substring(9));
		this.emit('changed', subsystems);
		subsystems.forEach((subsystem) => this.emit(`changed-${subsystem}`));
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