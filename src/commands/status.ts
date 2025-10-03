import { MPDProtocol } from '../protocol.js';
import { PlaylistItem, Status, Statistics } from '../objects/index.js';

export interface StatusCommands extends ReturnType<typeof createStatusCommands>{}

export const createStatusCommands = (protocol: MPDProtocol) => ({

  /**
   * Displays the song info of the current song (same song that is identified in status).
   */
  async currentSong(): Promise<PlaylistItem> {
    const { lines } = await protocol.sendCommand('currentsong');
    return protocol.parse(lines, ['file'], valueMap => new PlaylistItem(valueMap))[0]!;
  },

  /**
   * Reports the current status of the player and the volume level.
   */
  async status(): Promise<Status> {
    const { lines } = await protocol.sendCommand('status');
    return protocol.parse<Status>(lines, [], valueMap => new Status(valueMap))[0]!;
  },

  async statistics(): Promise<Statistics> {
    const { lines } = await protocol.sendCommand('stats');
    return protocol.parse<Statistics>(lines, [], valueMap => new Statistics(valueMap))[0]!;
  },

  /**
   * Clears the current error message in status
   */
  async clearError(): Promise<void> {
    await protocol.sendCommand('clearerror');
  },
});
