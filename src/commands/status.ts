import { MPDProtocol } from '../protocol.js';
import { PlaylistItem, Status, Statistics } from '../objects/index.js';

export class StatusCommands {

  constructor(private protocol: MPDProtocol) {}

  /**
   * Displays the song info of the current song (same song that is identified in status).
   */
  async currentSong(): Promise<PlaylistItem> {
    const { lines } = await this.protocol.sendCommand('currentsong');
    return this.protocol.parse(lines, ['file'], valueMap => new PlaylistItem(valueMap))[0]!;
  }

  /**
   * Reports the current status of the player and the volume level.
   */
  async status(): Promise<Status> {
    const { lines } = await this.protocol.sendCommand('status');
    return this.protocol.parse<Status>(lines, [], valueMap => new Status(valueMap))[0]!;
  }

  async statistics(): Promise<Statistics> {
    const { lines } = await this.protocol.sendCommand('stats');
    return this.protocol.parse<Statistics>(lines, [], valueMap => new Statistics(valueMap))[0]!;
  }

  /**
   * Clears the current error message in status
   */
  async clearError(): Promise<void> {
    await this.protocol.sendCommand('clearerror');
  }
}
