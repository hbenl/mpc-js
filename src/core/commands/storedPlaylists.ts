import { MPDProtocol } from '../protocol.js';
import { StoredPlaylist, PlaylistItem } from '../objects/playlists.js';

export class StoredPlaylistsCommands {

	constructor(private protocol: MPDProtocol) {}

	/**
	 * Prints a list of the playlist directory. Each playlist name comes with its last 
	 * modification time. To avoid problems due to clock differences between clients and the
	 * server, clients should not compare this value with their local clock. 
	 */
	async listPlaylists(): Promise<StoredPlaylist[]> {
		const lines = await this.protocol.sendCommand('listplaylists');
		return this.protocol.parse(lines, ['playlist'], valueMap => new StoredPlaylist(valueMap));
	}

	/**
	 * Lists the songs in the playlist. Playlist plugins are supported.
	 */
	async listPlaylist(name: string): Promise<string[]> {
		const cmd = `listplaylist "${name}"`;
		const lines = await this.protocol.sendCommand(cmd);
		return lines.map(line => line.substring(6));
	}

	/**
	 * Lists the songs with metadata in the playlist. Playlist plugins are supported.
	 */
	async listPlaylistInfo(name: string): Promise<PlaylistItem[]> {
		const cmd = `listplaylistinfo "${name}"`;
		const lines = await this.protocol.sendCommand(cmd);
		return this.protocol.parse(lines, ['file'], valueMap => new PlaylistItem(valueMap));
	}

	/**
	 * Loads the playlist into the current queue. Playlist plugins are supported.
	 * A range may be specified to load only a part of the playlist.
	 */
	async load(name: string, start?: number, end?: number): Promise<void> {
		let cmd = `load "${name}"`;
		if (start !== undefined) {
			cmd += ` ${start}:`;
			if (end !== undefined) {
				cmd += end;
			}
		}
		await this.protocol.sendCommand(cmd);
	}

	/**
	 * Saves the current playlist to `name`.m3u in the playlist directory.
	 */
	async save(name: string): Promise<void> {
		const cmd = `save "${name}"`;
		await this.protocol.sendCommand(cmd);
	}

	/**
	 * Adds `uri` to the playlist `name`.m3u. `name`.m3u will be created if it does not exist.
	 */
	async playlistAdd(name: string, uri: string): Promise<void> {
		const cmd = `playlistadd "${name}" "${uri}"`;
		await this.protocol.sendCommand(cmd);
	}

	/**
	 * Clears the playlist `name`.m3u.
	 */
	async playlistClear(name: string): Promise<void> {
		const cmd = `playlistclear "${name}"`;
		await this.protocol.sendCommand(cmd);
	}

	/**
	 * Deletes `position` from the playlist `name`.m3u.
	 */
	async playlistDelete(name: string, position: number): Promise<void> {
		const cmd = `playlistdelete "${name}" ${position}`;
		await this.protocol.sendCommand(cmd);
	}

	/**
	 * Moves the song at position `from` in the playlist `name`.m3u to the position `to`.
	 */
	async playlistMove(name: string, from: number, to: number): Promise<void> {
		const cmd = `playlistmove "${name}" ${from} ${to}`;
		await this.protocol.sendCommand(cmd);
	}

	/**
	 * Renames the playlist `name`.m3u to `newName`.m3u.
	 */
	async rename(name: string, newName: string): Promise<void> {
		const cmd = `rename "${name}" "${newName}"`;
		await this.protocol.sendCommand(cmd);
	}

	/**
	 * Removes the playlist `name`.m3u from the playlist directory.
	 */
	async remove(name: string): Promise<void> {
		const cmd = `rm "${name}"`;
		await this.protocol.sendCommand(cmd);
	}
}
