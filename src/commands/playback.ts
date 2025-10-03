import { MPDProtocol } from '../protocol.js';

export class PlaybackCommands {

  constructor(private protocol: MPDProtocol) {}

  /**
   * Begins playing the playlist at song number songPos.
   */
  async play(songPos?: number) {
    let cmd = 'play';
    if (songPos !== undefined) {
      cmd += ` ${songPos}`;
    }
    await this.protocol.sendCommand(cmd);
  }

  /**
   * Begins playing the playlist at song with the given songId.
   */
  async playId(songId: number) {
    let cmd = 'playid';
    if (songId !== undefined) {
      cmd += ` ${songId}`;
    }
    await this.protocol.sendCommand(cmd);
  }

  /**
   * Plays the previous song in the playlist.
   */
  async previous(): Promise<void> {
    await this.protocol.sendCommand('previous');
  }

  /**
   * Plays the next song in the playlist.
   */
  async next(): Promise<void> {
    await this.protocol.sendCommand('next');
  }

  /**
   * Seeks to the position time (in seconds; fractions allowed) of entry songPos in the playlist.
   */
  async seek(songPos: number, time: number) {
    const cmd = `seek ${songPos} ${time}`;
    await this.protocol.sendCommand(cmd);
  }

  /**
   * Seeks to the position time (in seconds; fractions allowed) of song with the given songId. 
   */
  async seekId(songId: number, time: number) {
    const cmd = `seekid ${songId} ${time}`;
    await this.protocol.sendCommand(cmd);
  }

  /**
   * Seeks to the position time (in seconds; fractions allowed) within the current song.
   * If relative is true, then the time is relative to the current playing position. 
   */
  async seekCur(time: number, relative = false) {
    let cmd: string; 
    if (relative && (time >= 0)) {
      cmd = `seekcur +${time}`;
    } else {
      cmd = `seekcur ${time}`;
    }
    await this.protocol.sendCommand(cmd);
  }

  /**
   * Pauses or resumes playback.
   */
  async pause(pause: boolean = true): Promise<void> {
    const cmd = `pause ${pause ? 1 : 0}`;
    await this.protocol.sendCommand(cmd);
  }

  /**
   * Stops playing.
   */
  async stop(): Promise<void> {
    await this.protocol.sendCommand('stop');
  }
}
