import { MPDProtocol } from '../protocol';

export class StickerCommands {

	constructor(private protocol: MPDProtocol) {}

	/**
	 * Reads a sticker value for the specified object.
	 */
	async getSticker(type: string, uri: string, name: string): Promise<string> {
		const cmd = `sticker get ${type} "${uri}" "${name}"`;
		const lines = await this.protocol.sendCommand(cmd);
		return lines[0].substring(name.length + 10);
	}

	/**
	 * Adds a sticker value to the specified object.
	 * If a sticker item with that name already exists, it is replaced.
	 */
	async setSticker(type: string, uri: string, name: string, value: string): Promise<void> {
		const cmd = `sticker set ${type} "${uri}" "${name}" "${value}"`;
		await this.protocol.sendCommand(cmd);
	}

	/**
	 * Deletes a sticker value from the specified object.
	 * If you do not specify a sticker name, all sticker values are deleted.
	 */
	async deleteSticker(type: string, uri: string, name?: string): Promise<void> {
		let cmd = `sticker delete ${type} "${uri}"`;
		if (name) {
			cmd += ` "${name}"`;
		}
		await this.protocol.sendCommand(cmd);
	}

	/**
	 * Lists the stickers for the specified object.
	 * Returns a Map with sticker names as keys.
	 */
	async listStickers(type: string, uri: string): Promise<Map<string, string>> {
		const cmd = `sticker list ${type} "${uri}"`;
		const lines = await this.protocol.sendCommand(cmd);
		const stickerMap = new Map<string, string>();
		lines.forEach(line => {
			const separatorIndex = line.indexOf('=');
			stickerMap.set(line.substring(9, separatorIndex), line.substring(separatorIndex + 1));
		});
		return stickerMap;
	}

	/**
	 * Searches the sticker database for stickers with the specified name,
	 * below the specified directory (`uri`).
	 * Returns a Map with the URIs of the matching songs as keys.
	 */
	async findStickers(
		type: string,
		uri: string,
		name: string,
		value?: string, 
		operator: '=' | '<' | '>' = '='
	): Promise<Map<string, string>> {

		let cmd = `sticker find ${type} "${uri}" "${name}"`;
		if (value) {
			cmd += ` ${operator} "${value}"`;
		}
		const lines = await this.protocol.sendCommand(cmd);
		const fileAndStickers = this.protocol.parse(lines, ['file'], valueMap => valueMap);
		const stickerMap = new Map<string, string>();
		fileAndStickers.forEach(fileAndSticker => {
			const fileValue = fileAndSticker.get('file');
			let stickerValue = fileAndSticker.get('sticker');
			if (fileValue && stickerValue) {
				stickerValue = stickerValue.substring(name.length + 1);
				stickerMap.set(fileValue, stickerValue);
			}
		});
		return stickerMap;
	}
}
