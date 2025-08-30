import { MPDProtocol } from '../protocol.js';
import { OutputDevice } from '../objects/outputDevice.js';

export class OutputDeviceCommands {

	constructor(private protocol: MPDProtocol) {}

	/**
	 * Returns information about all outputs.
	 */
	async outputs(): Promise<OutputDevice[]> {
		const lines = await this.protocol.sendCommand('outputs');
		return this.protocol.parse(lines, ['outputid'], valueMap => new OutputDevice(valueMap));
	}

	/**
	 * Turns an output on.
	 */
	async enableOutput(id: number): Promise<void> {
		const cmd = `enableoutput ${id}`;
		await this.protocol.sendCommand(cmd);
	}

	/**
	 * Turns an output off.
	 */
	async disableOutput(id: number): Promise<void> {
		const cmd = `disableoutput ${id}`;
		await this.protocol.sendCommand(cmd);
	}

	/**
	 * Turns an output on or off, depending on the current state.
	 */
	async toggleOutput(id: number): Promise<void> {
		const cmd = `toggleoutput ${id}`;
		await this.protocol.sendCommand(cmd);
	}

	/**
	 * Set a runtime attribute. These are specific to the output plugin, and
	 * supported values are shown in the result of the `outputs` command.
	 */
	async outputSet(id: number, name: string, value: string): Promise<void> {
		const cmd = `outputset ${id} "${name}" "${value}"`;
		await this.protocol.sendCommand(cmd);
	}
}
