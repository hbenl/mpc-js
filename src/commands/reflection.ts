import { MPDProtocol } from '../protocol.js';
import { Decoder } from '../objects/decoder.js';
import { parse } from '../util.js';

export interface ReflectionCommands extends ReturnType<typeof createReflectionCommands>{}

export const createReflectionCommands = (protocol: MPDProtocol) => ({

  /**
   * Dumps configuration values that may be interesting for the client.
   * This command is only permitted to "local" clients (connected via UNIX domain socket).
   * The following response attributes are available:
   * * `music_directory`: The absolute path of the music directory.
   */
  async config(): Promise<Map<string, string>> {
    const { lines } = await protocol.sendCommand('config');
    return parse(lines, [], valueMap => valueMap)[0]!;
  },

  /**
   * Shows which commands the current user has access to.
   */
  async commands(): Promise<string[]> {
    const { lines } = await protocol.sendCommand('commands');
    return lines.map(line => line.substring(9));
  },

  /**
   * Shows which commands the current user has access to.
   */
  async notCommands(): Promise<string[]> {
    const { lines } = await protocol.sendCommand('notcommands');
    return lines.map(line => line.substring(9));
  },

  /**
   * Gets a list of available URL handlers.
   */
  async urlHandlers(): Promise<string[]> {
    const { lines } = await protocol.sendCommand('urlhandlers');
    return lines.map(line => line.substring(9));
  },

  /**
   * Returns a list of decoder plugins with their supported suffixes and MIME types.
   */
  async decoders(): Promise<Decoder[]> {
    const { lines } = await protocol.sendCommand('decoders');
    const decoders: Decoder[] = [];
    let currentDecoder: Decoder;
    lines.forEach(line => {
      if (line.startsWith('plugin')) {
        if (currentDecoder) {
          decoders.push(currentDecoder);
        }
        currentDecoder = new Decoder(line.substring(8));
      }
      else if (line.startsWith('suffix')) {
        currentDecoder.suffixes.push(line.substr(8));
      }
      else if (line.startsWith('mime_type')) {
        currentDecoder.mimeTypes.push(line.substr(11));
      }
    });
    return decoders;
  },
});
