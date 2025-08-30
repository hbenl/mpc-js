import { MPDProtocol } from '../protocol.js';
import { Decoder } from '../objects/decoder.js';
import { stringStartsWith } from '../util.js';
import { tagTypes } from './connection.js';

export class ReflectionCommands {

	constructor(private protocol: MPDProtocol) {}

	/**
	 * Dumps configuration values that may be interesting for the client.
	 * This command is only permitted to "local" clients (connected via UNIX domain socket).
	 * The following response attributes are available:
	 * * `music_directory`: The absolute path of the music directory.
	 */
	async config(): Promise<Map<string, string>> {
		const lines = await this.protocol.sendCommand('config');
		return this.protocol.parse(lines, [], valueMap => valueMap)[0]!;
	}

	/**
	 * Shows which commands the current user has access to.
	 */
	async commands(): Promise<string[]> {
		const lines = await this.protocol.sendCommand('commands');
		return lines.map(line => line.substring(9));
	}

	/**
	 * Shows which commands the current user has access to.
	 */
	async notCommands(): Promise<string[]> {
		const lines = await this.protocol.sendCommand('notcommands');
		return lines.map(line => line.substring(9));
	}

	/**
	 * This method is identical to the method by the same name in the ConnectionCommands class.
	 * It is only provided here for backward compatibility.
	 */
	tagTypes(): Promise<string[]> {
		return tagTypes(this.protocol);
	}

	/**
	 * Gets a list of available URL handlers.
	 */
	async urlHandlers(): Promise<string[]> {
		const lines = await this.protocol.sendCommand('urlhandlers');
		return lines.map(line => line.substring(9));
	}

	/**
	 * Returns a list of decoder plugins with their supported suffixes and MIME types.
	 */
	async decoders(): Promise<Decoder[]> {
		const lines = await this.protocol.sendCommand('decoders');
		const decoders: Decoder[] = [];
		let currentDecoder: Decoder;
		lines.forEach(line => {
			if (stringStartsWith(line, 'plugin')) {
				if (currentDecoder) {
					decoders.push(currentDecoder);
				}
				currentDecoder = new Decoder(line.substring(8));
			}
			else if (stringStartsWith(line, 'suffix')) {
				currentDecoder.suffixes.push(line.substr(8));
			}
			else if (stringStartsWith(line, 'mime_type')) {
				currentDecoder.mimeTypes.push(line.substr(11));
			}
		});
		return decoders;
	}
}
