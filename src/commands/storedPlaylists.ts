import { MPDProtocol } from '../protocol.js';
import { SongCount } from '../objects/database.js';
import { StoredPlaylist, PlaylistItem } from '../objects/playlists.js';
import { parse } from '../util.js';
import { addFilter } from './database.js';

export interface StoredPlaylistsCommands extends ReturnType<typeof createStoredPlaylistsCommands>{}

export const createStoredPlaylistsCommands = (protocol: MPDProtocol) => ({

  /**
   * Prints a list of the playlist directory. Each playlist name comes with its last 
   * modification time. To avoid problems due to clock differences between clients and the
   * server, clients should not compare this value with their local clock. 
   */
  async listPlaylists(): Promise<StoredPlaylist[]> {
    const { lines } = await protocol.sendCommand('listplaylists');
    return parse(lines, ['playlist'], valueMap => new StoredPlaylist(valueMap));
  },

  /**
   * Lists the songs in the playlist. Playlist plugins are supported.
   */
  async listPlaylist(name: string): Promise<string[]> {
    const cmd = `listplaylist "${name}"`;
    const { lines } = await protocol.sendCommand(cmd);
    return lines.map(line => line.substring(6));
  },

  /**
   * Lists the songs with metadata in the playlist. Playlist plugins are supported.
   */
  async listPlaylistInfo(name: string): Promise<PlaylistItem[]> {
    const cmd = `listplaylistinfo "${name}"`;
    const { lines } = await protocol.sendCommand(cmd);
    return parse(lines, ['file'], valueMap => new PlaylistItem(valueMap));
  },

  /**
   * Search the playlist for songs matching the given filter. Playlist plugins are supported.
   */
  async searchPlaylist(name: string, filter: string | [string, string][]): Promise<PlaylistItem[]> {
    let cmd = `searchplaylist "${name}"`;
    cmd = addFilter(cmd, filter);
    const { lines } = await protocol.sendCommand(cmd);
    return parse(lines, ['file'], valueMap => new PlaylistItem(valueMap));
  },

  /**
   * Count the number of songs and their total playtime (seconds) in the playlist.
   */
  async playlistLength(name: string): Promise<SongCount> {
    const cmd = `playlistlength "${name}"`;
    const { lines } = await protocol.sendCommand(cmd);
    return parse(lines, [], valueMap => new SongCount(valueMap))[0]!;
  },

  /**
   * Loads the playlist into the current queue. Playlist plugins are supported.
   * A range may be specified to load only a part of the playlist.
   * The `position` parameter specifies where the songs will be inserted into the queue.
   */
  async load(name: string, start?: number, end?: number, position?: number): Promise<void> {
    let cmd = `load "${name}"`;
    if (start !== undefined) {
      cmd += ` ${start}:`;
      if (end !== undefined) {
        cmd += end;
      }
    }
    if (position !== undefined) {
      if (start === undefined) {
        cmd += ' 0:';
      }
      cmd += ` ${position}`;
    }
    await protocol.sendCommand(cmd);
  },

  /**
   * Saves the current playlist to `name`.m3u in the playlist directory.
   */
  async save(name: string): Promise<void> {
    const cmd = `save "${name}"`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Adds `uri` to the playlist `name`.m3u. `name`.m3u will be created if it does not exist.
   * The `position` parameter specifies where the songs will be inserted into the playlist.
   */
  async playlistAdd(name: string, uri: string, position?: number): Promise<void> {
    let cmd = `playlistadd "${name}" "${uri}"`;
    if (position !== undefined) {
      cmd += ` ${position}`;
    }
    await protocol.sendCommand(cmd);
  },

  /**
   * Clears the playlist `name`.m3u.
   */
  async playlistClear(name: string): Promise<void> {
    const cmd = `playlistclear "${name}"`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Deletes `position` from the playlist `name`.m3u.
   */
  async playlistDelete(name: string, position: number): Promise<void> {
    const cmd = `playlistdelete "${name}" ${position}`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Moves the song at position `from` in the playlist `name`.m3u to the position `to`.
   */
  async playlistMove(name: string, from: number, to: number): Promise<void> {
    const cmd = `playlistmove "${name}" ${from} ${to}`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Renames the playlist `name`.m3u to `newName`.m3u.
   */
  async rename(name: string, newName: string): Promise<void> {
    const cmd = `rename "${name}" "${newName}"`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Removes the playlist `name`.m3u from the playlist directory.
   */
  async remove(name: string): Promise<void> {
    const cmd = `rm "${name}"`;
    await protocol.sendCommand(cmd);
  },
});
