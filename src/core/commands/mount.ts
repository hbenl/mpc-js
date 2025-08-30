import { MPDProtocol } from '../protocol';
import { Mount, Neighbor } from '../objects/mount';

export class MountCommands {

	constructor(private protocol: MPDProtocol) {}

	/**
	 * Mount the specified remote storage `uri` at the given `path`.
	 */
	async mount(path: string, uri: string): Promise<void> {
		const cmd = `mount "${path}" "${uri}"`;
		await this.protocol.sendCommand(cmd);
	}

	/**
	 * Unmounts the specified `path`.
	 */
	async unmount(path: string): Promise<void> {
		const cmd = `unmount "${path}"`;
		await this.protocol.sendCommand(cmd);
	}

	/**
	 * Queries a list of all mounts. By default, this contains just the configured `music_directory`.
	 */
	async listMounts(): Promise<Mount[]> {
		const lines = await this.protocol.sendCommand('listmounts');
		return this.protocol.parse(lines, ['mount'], valueMap => new Mount(valueMap));
	}

	/**
	 * Queries a list of "neighbors" (e.g. accessible file servers on the local net).
	 * Items on that list may be used with `mount()`.
	 */
	async listNeighbors(): Promise<Neighbor[]> {
		const lines = await this.protocol.sendCommand('listneighbors');
		return this.protocol.parse(lines, ['neighbor'], valueMap => new Neighbor(valueMap));
	}
}
