import { MPDProtocol } from '../protocol.js';

export interface ConnectionCommands extends ReturnType<typeof createConnectionCommands>{}

export const createConnectionCommands = (protocol: MPDProtocol) => ({

  /**
   * Closes the connection to MPD. MPD will try to send the remaining output buffer before it
   * actually closes the connection, but that cannot be guaranteed. This command will not
   * generate a response.
   */
  close(): void {
    protocol.sendCommand('close');
  },

  /**
   * Kills MPD.
   */
  kill(): void {
    protocol.sendCommand('kill');
  },

  /**
   * This is used for authentication with the server. `password` is simply the plaintext password.
   */
  async password(password: string): Promise<void> {
    const cmd = `password "${password}"`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Does nothing but return "OK".
   */
  async ping(): Promise<void> {
    await protocol.sendCommand('ping');
  },

  /**
   * Shows a list of available tag types. It is an intersection of the
   * metadata_to_use setting and this client's tag mask.
   * About the tag mask: each client can decide to disable any number of tag types,
   * which will be omitted from responses to this client.
   * That is a good idea, because it makes responses smaller.
   */
  async tagTypes(): Promise<string[]> {
    const { lines } = await protocol.sendCommand('tagtypes');
    return lines.map(line => line.substring(9));
  },

  /**
   * Remove one or more tags from the list of tag types the client is interested in.
   * These will be omitted from responses to this client.
   */
  async disableTagTypes(names: string[]): Promise<void> {
    if (names.length < 1) return;
    const cmd = `tagtypes disable ${names.join(' ')}`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Re-enable one or more tags from the list of tag types for this client.
   * These will no longer be hidden from responses to this client.
   */
  async enableTagTypes(names: string[]): Promise<void> {
    if (names.length < 1) return;
    const cmd = `tagtypes enable ${names.join(' ')}`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Clear the list of tag types this client is interested in.
   * This means that MPD will not send any tags to this client.
   */
  async clearTagTypes(): Promise<void> {
    await protocol.sendCommand('tagtypes clear');
  },

  /**
   * Announce that this client is interested in all tag types.
   * This is the default setting for new clients.
   */
  async allTagTypes(): Promise<void> {
    await protocol.sendCommand('tagtypes all');
  },
});
