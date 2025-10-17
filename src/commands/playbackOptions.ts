import { MPDProtocol } from '../protocol.js';

export interface PlaybackOptionsCommands extends ReturnType<typeof createPlaybackOptionsCommands>{}

export const createPlaybackOptionsCommands = (protocol: MPDProtocol) => ({

  /**
   * Read the volume. The result is in the range 0-100. Returns undefined if there is no mixer.
   */
  async getVolume(): Promise<number | undefined> {
    const { lines } = await protocol.sendCommand('getvol');
    return lines[0] ? Number(lines[0].substring(8)) : undefined;
  },

  /**
   * Sets volume, the range of volume is 0-100.
   */
  async setVolume(volume: number): Promise<void> {
    const cmd = `setvol ${volume}`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Changes volume by the given amount.
   */
  async changeVolume(change: number): Promise<void> {
    const cmd = `volume ${change}`;
    await protocol.sendCommand(cmd);
  },

  async setRandom(random: boolean): Promise<void> {
    const cmd = `random ${random ? 1 : 0}`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Sets repeat state.
   * If enabled, MPD keeps repeating the whole queue (single mode disabled) or the current song (single mode enabled).
   * If random mode is also enabled, the playback order will be shuffled each time the queue gets repeated.
   */
  async setRepeat(repeat: boolean): Promise<void> {
    const cmd = `repeat ${repeat ? 1 : 0}`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Sets single state. When single is activated, playback is stopped after current song,
   * or song is repeated if the 'repeat' mode is enabled.
   */
  async setSingle(single: boolean | 'oneshot'): Promise<void> {
    const cmd = `single ${(single === 'oneshot') ? 'oneshot' : (single ? 1 : 0)}`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Sets consume state. When consume is activated, each song played is removed from playlist.
   */
  async setConsume(consume: boolean): Promise<void> {
    const cmd = `consume ${consume ? 1 : 0}`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Sets crossfading between songs
   */
  async setCrossfade(seconds: number): Promise<void> {
    const cmd = `crossfade ${seconds}`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Sets the threshold at which songs will be overlapped. Like crossfading but doesn't fade the
   * track volume, just overlaps. The songs need to have MixRamp tags added by an external tool.
   * 0dB is the normalized maximum volume so use negative values, I prefer -17dB.
   * In the absence of mixramp tags * crossfading will be used.
   * See [http://sourceforge.net/projects/mixramp]
   */
  async setMixrampdb(decibels: number): Promise<void> {
    const cmd = `mixrampdb ${decibels}`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Additional time subtracted from the overlap calculated by mixrampdb.
   * A value of null disables MixRamp overlapping and falls back to crossfading.
   */
  async setMixrampDelay(seconds: number): Promise<void> {
    const cmd = `mixrampdelay ${seconds ? seconds : 'nan'}`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Sets the replay gain mode. One of off, track, album, auto.
   * Changing the mode during playback may take several seconds, because the new settings does
   * not affect the buffered data. This command triggers the options idle event. 
   */
  async setReplayGainMode(mode: 'off' | 'track' | 'album' | 'auto'): Promise<void> {
    const cmd = `replay_gain_mode ${mode}`;
    await protocol.sendCommand(cmd);
  },

  async getReplayGainMode(): Promise<'off' | 'track' | 'album' | 'auto'> {
    const { lines } = await protocol.sendCommand('replay_gain_status');
    return <'off' | 'track' | 'album' | 'auto'>lines[0]!.substring(18);
  },
});
