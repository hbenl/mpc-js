import { MPDProtocol } from '../protocol.js';
import { Mount, Neighbor } from '../objects/mount.js';

export interface MountCommands extends ReturnType<typeof createMountCommands>{}

export const createMountCommands = (protocol: MPDProtocol) => ({

  /**
   * Mount the specified remote storage `uri` at the given `path`.
   */
  async mount(path: string, uri: string): Promise<void> {
    const cmd = `mount "${path}" "${uri}"`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Unmounts the specified `path`.
   */
  async unmount(path: string): Promise<void> {
    const cmd = `unmount "${path}"`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Queries a list of all mounts. By default, this contains just the configured `music_directory`.
   */
  async listMounts(): Promise<Mount[]> {
    const { lines } = await protocol.sendCommand('listmounts');
    return protocol.parse(lines, ['mount'], valueMap => new Mount(valueMap));
  },

  /**
   * Queries a list of "neighbors" (e.g. accessible file servers on the local net).
   * Items on that list may be used with `mount()`.
   */
  async listNeighbors(): Promise<Neighbor[]> {
    const { lines } = await protocol.sendCommand('listneighbors');
    return protocol.parse(lines, ['neighbor'], valueMap => new Neighbor(valueMap));
  },
});
