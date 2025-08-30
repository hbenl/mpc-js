import { MPDProtocol } from '../protocol';

export class ClientToClientCommands {

	constructor(private protocol: MPDProtocol) {}

	/**
	 * Subscribe to a channel. The channel is created if it does not exist already.
	 * The name may consist of alphanumeric ASCII characters plus underscore, dash, dot and colon.
	 */
	async subscribe(channel: string): Promise<void> {
		const cmd = `subscribe ${channel}`;
		await this.protocol.sendCommand(cmd);
	}

	/**
	 * Unsubscribe from a channel.
	 */
	async unsubscribe(channel: string): Promise<void> {
		const cmd = `unsubscribe ${channel}`;
		await this.protocol.sendCommand(cmd);
	}

	/**
	 * Obtain a list of all channels.
	 */
	async channels(): Promise<string[]> {
		const lines = await this.protocol.sendCommand('channels');
		return lines.map(line => line.substring(9));
	}

	/**
	 * Reads messages for this client. Returns a Map containing the messages grouped by channel name.
	 */
	async readMessages(): Promise<Map<string, string[]>> {
		const lines = await this.protocol.sendCommand('readmessages');
		const messagesPerChannel = new Map<string, string[]>();
		for (let i = 0; i < lines.length; i += 2) {
			const channel = lines[i].substring(9);
			const message = lines[i + 1].substring(9);
			if (!messagesPerChannel.has(channel)) {
				messagesPerChannel.set(channel, []);
			}
			messagesPerChannel.get(channel)!.push(message);
		}
		return messagesPerChannel;
	}

	/**
	 * Send a message to the specified channel.
	 */
	async sendMessage(channel: string, text: string): Promise<void> {
		const cmd = `sendmessage ${channel} "${text}"`;
		await this.protocol.sendCommand(cmd);
	}
}
