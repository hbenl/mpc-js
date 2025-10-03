import { MPDProtocol } from '../protocol.js';

export class PartitionCommands {

  constructor(private protocol: MPDProtocol) {}

  /**
   * Switch the client to a different partition.
   */
  async partition(name: string): Promise<void> {
    await this.protocol.sendCommand(`partition "${name}"`);
  }

  /**
   * Returns a list of partitions.
   */
  async listPartitions(): Promise<string[]> {
    const { lines } = await this.protocol.sendCommand('listpartitions');
    return this.protocol.parse(lines, ['partition'], 
      valueMap => valueMap.get('partition')!);
  }

  /**
   * Create a new partition.
   */
  async newPartition(name: string): Promise<void> {
    await this.protocol.sendCommand(`newpartition "${name}"`);
  }

  /**
   * Delete a partition. The partition must be empty (no connected clients and no outputs).
   */
  async deletePartition(name: string): Promise<void> {
    await this.protocol.sendCommand(`delpartition "${name}"`);
  }

  /**
   * Move an output to the current partition.
   */
  async moveOutput(outputName: string): Promise<void> {
    await this.protocol.sendCommand(`moveoutput "${outputName}"`);
  }
}
