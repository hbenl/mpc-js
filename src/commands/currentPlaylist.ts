import { MPDProtocol } from '../protocol.js';
import { PlaylistItem, SongIdAndPosition } from '../objects/playlists.js';
import { parse } from '../util.js';

export interface CurrentPlaylistCommands extends ReturnType<typeof createCurrentPlaylistCommands>{}

export const createCurrentPlaylistCommands = (protocol: MPDProtocol) => ({

  /**
   * Adds the file or directory `uri` to the playlist (directories add recursively).
   * The position parameter is the same as in `addId()`.
   */
  async add(uri: string, position?: number): Promise<void> {
    let cmd = `add "${uri}"`;
    if (position !== undefined) {
      cmd += ` ${position}`;
    }
    await protocol.sendCommand(cmd);
  },

  /**
   * Adds a song to the playlist (non-recursive) and returns the song id.
   * `uri` is always a single file or URL.
   * If the `position` parameter is given, then the song is inserted at the specified position.
   */
  async addId(uri: string, position?: number): Promise<number> {
    let cmd = `addid "${uri}"`;
    if (position !== undefined) {
      cmd += ` ${position}`;
    }
    const { lines } = await protocol.sendCommand(cmd);
    return Number(lines[0]!.substring(4));
  },

  /**
   * Clears the current playlist.
   */
  async clear(): Promise<void> {
    await protocol.sendCommand('clear');
  },

  /**
   * Deletes a song from the playlist.
   */
  async delete(position: number): Promise<void> {
    const cmd = `delete ${position}`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Deletes a song range from the playlist.
   */
  async deleteRange(start: number, end?: number): Promise<void> {
    let cmd = `delete ${start}:`;
    if (end !== undefined) {
      cmd += end;
    }
    await protocol.sendCommand(cmd);
  },

  /**
   * Deletes the song with the given songid from the playlist.
   */
  async deleteId(songId: number): Promise<void> {
    const cmd = `deleteid ${songId}`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Moves the song at `from` to `to` in the playlist.
   */
  async move(from: number, to: number): Promise<void> {
    const cmd = `move ${from} ${to}`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Moves the range of songs from `start` to `end` to `to` in the playlist.
   */
  async moveRange(start: number, end: number, to: number): Promise<void> {
    const cmd = `move ${start}:${end} ${to}`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Moves the song with the given songid to `to` the playlist.
   * If `to` is negative, it is relative to the current song in the playlist (if there is one).
   */
  async moveId(songId: number, to: number): Promise<void> {
    const cmd = `moveid ${songId} ${to}`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Finds songs in the current playlist with strict matching.
   */
  async playlistFind(tag: string, needle: string): Promise<PlaylistItem[]> {
    const cmd = `playlistfind "${tag}" "${needle}"`;
    const { lines } = await protocol.sendCommand(cmd);
    return parse(lines, ['file'], valueMap => new PlaylistItem(valueMap));
  },

  /**
   * Searches case-insensitively for partial matches in the current playlist.
   */
  async playlistSearch(tag: string, needle: string): Promise<PlaylistItem[]> {
    const cmd = `playlistsearch "${tag}" "${needle}"`;
    const { lines } = await protocol.sendCommand(cmd);
    return parse(lines, ['file'], valueMap => new PlaylistItem(valueMap));
  },

  /**
   * Gets info for the song with the specified songid in the playlist.
   */
  async playlistId(songId: number): Promise<PlaylistItem> {
    const cmd = `playlistid ${songId}`;
    const { lines } = await protocol.sendCommand(cmd);
    return parse(lines, [], valueMap => new PlaylistItem(valueMap))[0]!;
  },

  /**
   * Gets info for all songs or a single song in the playlist.
   */
  async playlistInfo(position?: number): Promise<PlaylistItem[]> {
    let cmd = 'playlistinfo';
    if (position !== undefined) {
      cmd += ` ${position}`;
    }
    const { lines } = await protocol.sendCommand(cmd);
    return parse(lines, ['file'], valueMap => new PlaylistItem(valueMap));
  },

  /**
   * Gets info for a range of songs in the playlist.
   */
  async playlistRangeInfo(start: number, end?: number): Promise<PlaylistItem[]> {
    let cmd = `playlistinfo ${start}:`;
    if (end !== undefined) {
      cmd += `${end}`;
    }
    const { lines } = await protocol.sendCommand(cmd);
    return parse(lines, ['file'], valueMap => new PlaylistItem(valueMap));
  },

  /**
   * Displays changed songs currently in the playlist since `version`. Start and end positions 
   * may be given to limit the output to changes in the given range. To detect songs that were 
   * deleted at the end of the playlist, use playlistlength returned by status command. 
   */
  async playlistChanges(version: number, start?: number, end?: number): Promise<PlaylistItem[]> {
    let cmd = `plchanges ${version}`;
    if (start !== undefined) {
      cmd += ` ${start}:`;
      if (end !== undefined) {
        cmd += end;
      }
    }
    const { lines } = await protocol.sendCommand(cmd);
    return parse(lines, ['file'], valueMap => new PlaylistItem(valueMap));
  },

  /**
   * Displays changed songs currently in the playlist since `version`. This function only returns
   * the position and the id of the changed song, not the complete metadata. This is more
   * bandwidth efficient. To detect songs that were deleted at the end of the playlist, use 
   * playlistlength returned by status command. 
   */
  async playlistChangesPosId(version: number, start?: number, end?: number): Promise<SongIdAndPosition[]> {
    let cmd = `plchangesposid ${version}`;
    if (start !== undefined) {
      cmd += ` ${start}:`;
      if (end !== undefined) {
        cmd += end;
      }
    }
    const { lines } = await protocol.sendCommand(cmd);
    return parse(lines, ['cpos'], valueMap => new SongIdAndPosition(valueMap));
  },

  /**
   * Set the priority of the specified songs. A higher priority means that it will be played 
   * first when "random" mode is enabled.
   * A priority is an integer between 0 and 255. The default priority of new songs is 0.
   */
  async prio(priority: number, start: number, end:number): Promise<void> {
    const cmd = `prio ${priority} ${start}:${end}`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Same as prio, but address the songs with their songid.
   */
  async prioId(priority: number, songId: number): Promise<void> {
    const cmd = `prioid ${priority} ${songId}`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Specifies the portion of the song that shall be played. `start` and `end` are offsets 
   * in seconds (fractional seconds allowed); both are optional. Omitting both means "remove the
   * range, play everything". A song that is currently playing cannot be manipulated this way.
   */
  async rangeId(songId: number, start?: number, end?: number): Promise<void> {
    let cmd = `rangeid ${songId} `;
    if (start !== undefined) {
      cmd += start;
    }
    cmd += ':';
    if (end !== undefined) {
      cmd += end;
    }
    await protocol.sendCommand(cmd);
  },

  /**
   * Shuffles the current playlist. `start` and `end` is optional and specifies a range of songs.
   */
  async shuffle(start?: number, end?: number): Promise<void> {
    let cmd = 'shuffle';
    if (start !== undefined) {
      cmd += ` ${start}:`;
      if (end !== undefined) {
        cmd += end;
      }
    }
    await protocol.sendCommand(cmd);
  },

  /**
   * Swaps the positions of `song1` and `song2`.
   */
  async swap(song1: number, song2: number): Promise<void> {
    const cmd = `swap ${song1} ${song2}`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Swaps the positions of `song1` and `song2` (both songids).
   */
  async swapId(song1: number, song2: number): Promise<void> {
    const cmd = `swapid ${song1} ${song2}`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Adds a tag to the specified song. Editing song tags is only possible for remote songs.
   * This change is volatile: it may be overwritten by tags received from the server, and the
   * data is gone when the song gets removed from the queue.
   */
  async addTagId(songId: number, tag: string, value: string): Promise<void> {
    const cmd = `addtagid ${songId} "${tag}" "${value}"`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Removes tags from the specified song. If `tag` is not specified, then all tag values will be
   * removed. Editing song tags is only possible for remote songs.
   */
  async clearTagId(songId: number, tag?: string): Promise<void> {
    let cmd = `cleartagid ${songId}`;
    if (tag) {
      cmd += ` "${tag}"`;
    }
    await protocol.sendCommand(cmd);
  },
});
