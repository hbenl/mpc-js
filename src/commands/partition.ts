import { MPDProtocol } from '../protocol.js';

export interface PartitionCommands extends ReturnType<typeof createPartitionCommands>{}

export const createPartitionCommands = (protocol: MPDProtocol) => ({

  /**
   * Switch the client to a different partition.
   */
  async partition(name: string): Promise<void> {
    await protocol.sendCommand(`partition "${name}"`);
  },

  /**
   * Returns a list of partitions.
   */
  async listPartitions(): Promise<string[]> {
    const { lines } = await protocol.sendCommand('listpartitions');
    return protocol.parse(lines, ['partition'], 
      valueMap => valueMap.get('partition')!);
  },

  /**
   * Create a new partition.
   */
  async newPartition(name: string): Promise<void> {
    await protocol.sendCommand(`newpartition "${name}"`);
  },

  /**
   * Delete a partition. The partition must be empty (no connected clients and no outputs).
   */
  async deletePartition(name: string): Promise<void> {
    await protocol.sendCommand(`delpartition "${name}"`);
  },

  /**
   * Move an output to the current partition.
   */
  async moveOutput(outputName: string): Promise<void> {
    await protocol.sendCommand(`moveoutput "${outputName}"`);
  },
});
