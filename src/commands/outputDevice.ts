import { MPDProtocol } from '../protocol.js';
import { OutputDevice } from '../objects/outputDevice.js';

export interface OutputDeviceCommands extends ReturnType<typeof createOutputDeviceCommands>{}

export const createOutputDeviceCommands = (protocol: MPDProtocol) => ({

  /**
   * Returns information about all outputs.
   */
  async outputs(): Promise<OutputDevice[]> {
    const { lines } = await protocol.sendCommand('outputs');
    return protocol.parse(lines, ['outputid'], valueMap => new OutputDevice(valueMap));
  },

  /**
   * Turns an output on.
   */
  async enableOutput(id: number): Promise<void> {
    const cmd = `enableoutput ${id}`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Turns an output off.
   */
  async disableOutput(id: number): Promise<void> {
    const cmd = `disableoutput ${id}`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Turns an output on or off, depending on the current state.
   */
  async toggleOutput(id: number): Promise<void> {
    const cmd = `toggleoutput ${id}`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Set a runtime attribute. These are specific to the output plugin, and
   * supported values are shown in the result of the `outputs` command.
   */
  async outputSet(id: number, name: string, value: string): Promise<void> {
    const cmd = `outputset ${id} "${name}" "${value}"`;
    await protocol.sendCommand(cmd);
  },
});
