import { MPDProtocol } from '../protocol';
import { PlaylistItem, Status, Statistics } from '../objects/index';

export class StatusCommands {

	constructor(private protocol: MPDProtocol) {}

	/**
	 * Displays the song info of the current song (same song that is identified in status).
	 */
	async currentSong(): Promise<PlaylistItem> {
		const lines = await this.protocol.sendCommand('currentsong');
		return this.protocol.parse(lines, ['file'], valueMap => new PlaylistItem(valueMap))[0];
	}

	/**
	 * Reports the current status of the player and the volume level.
	 */
	async status(): Promise<Status> {
		const msg = await this.protocol.sendCommand('status');
		return this.protocol.parse<Status>(msg, [], valueMap => new Status(valueMap))[0];
	}

	async statistics(): Promise<Statistics> {
		const msg = await this.protocol.sendCommand('stats');
		return this.protocol.parse<Statistics>(msg, [], valueMap => new Statistics(valueMap))[0];
	}

	/**
	 * Clears the current error message in status
	 */
	async clearError(): Promise<void> {
		await this.protocol.sendCommand('clearerror');
	}
}
