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
   * Set the maximum binary response size for the current connection to
   * the specified number of bytes.
   * A bigger value means less overhead for transmitting large entities,
   * but it also means that the connection is blocked for a longer time.
   */
  async setBinaryLimit(size: number): Promise<void> {
    await protocol.sendCommand(`binarylimit ${size}`);
  },

  /**
   * Gets a list of available tag types. It is an intersection of the
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
   * Get the list of tag types configured by the `metadata_to_use` setting.
   */
  async getAvailableTagTypes(): Promise<string[]> {
    const { lines } = await protocol.sendCommand('tagtypes available');
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

  /**
   * Set the list of enabled tag types for this client. These will no longer
   * be hidden from responses to this client.
   */
  async setEnabledTagTypes(names: string[]): Promise<void> {
    let cmd = 'tagtypes reset';
    if (names.length > 0) {
      cmd += ` ${names.join(' ')}`;
    }
    await protocol.sendCommand(cmd);
  },

  /**
   * Get a list of enabled protocol features. Available features:
   * - `hide_playlists_in_root`: disables the listing of stored playlists for `listInfo()`.
   */
  async getEnabledProtocolFeatures(): Promise<string[]> {
    const { lines } = await protocol.sendCommand('protocol');
    return lines.map(line => line.substring(9));
  },

  /**
   * Lists all available protocol features.
   */
  async getAvailableProtocolFeatures(): Promise<string[]> {
    const { lines } = await protocol.sendCommand('protocol available');
    return lines.map(line => line.substring(9));
  },

  /**
   * Enables one or more features.
   */
  async enableProtocolFeatures(features: string[]): Promise<void> {
    if (features.length < 1) return;
    const cmd = `protocol enable ${features.join(' ')}`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Disables one or more features.
   */
  async disableProtocolFeatures(features: string[]): Promise<void> {
    if (features.length < 1) return;
    const cmd = `protocol disable ${features.join(' ')}`;
    await protocol.sendCommand(cmd);
  },

  /**
   * Enables all protocol features.
   */
  async enableAllProtocolFeatures(): Promise<void> {
    await protocol.sendCommand('protocol all');
  },

  /**
   * Disables all protocol features.
   */
  async disableAllProtocolFeatures(): Promise<void> {
    await protocol.sendCommand('protocol clear');
  },
});
