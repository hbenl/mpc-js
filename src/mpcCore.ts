import { MPDProtocol } from './protocol.js';
import { type StatusCommands, createStatusCommands } from './commands/status.js';
import { type PlaybackCommands, createPlaybackCommands } from './commands/playback.js';
import { type PlaybackOptionsCommands, createPlaybackOptionsCommands } from './commands/playbackOptions.js';
import { type CurrentPlaylistCommands, createCurrentPlaylistCommands } from './commands/currentPlaylist.js';
import { type StoredPlaylistsCommands, createStoredPlaylistsCommands } from './commands/storedPlaylists.js';
import { type DatabaseCommands, createDatabaseCommands } from './commands/database.js';
import { type MountCommands, createMountCommands } from './commands/mount.js';
import { type StickerCommands, createStickerCommands } from './commands/sticker.js';
import { type ConnectionCommands, createConnectionCommands } from './commands/connection.js';
import { type PartitionCommands, createPartitionCommands } from './commands/partition.js';
import { type OutputDeviceCommands, createOutputDeviceCommands } from './commands/outputDevice.js';
import { type ReflectionCommands, createReflectionCommands } from './commands/reflection.js';
import { type ClientToClientCommands, createClientToClientCommands } from './commands/clientToClient.js';

export class MPCCore extends MPDProtocol {

  readonly status: StatusCommands;
  readonly playback: PlaybackCommands;
  readonly playbackOptions: PlaybackOptionsCommands;
  readonly currentPlaylist: CurrentPlaylistCommands;
  readonly storedPlaylists: StoredPlaylistsCommands;
  readonly database: DatabaseCommands;
  readonly mounts: MountCommands;
  readonly stickers: StickerCommands;
  readonly connection: ConnectionCommands;
  readonly partition: PartitionCommands;
  readonly outputDevices: OutputDeviceCommands;
  readonly reflection: ReflectionCommands;
  readonly clientToClient: ClientToClientCommands;

  constructor() {
    super();
    this.status = createStatusCommands(this);
    this.playback = createPlaybackCommands(this);
    this.playbackOptions = createPlaybackOptionsCommands(this);
    this.currentPlaylist = createCurrentPlaylistCommands(this);
    this.storedPlaylists = createStoredPlaylistsCommands(this);
    this.database = createDatabaseCommands(this);
    this.mounts = createMountCommands(this);
    this.stickers = createStickerCommands(this);
    this.connection = createConnectionCommands(this);
    this.partition = createPartitionCommands(this);
    this.outputDevices = createOutputDeviceCommands(this);
    this.reflection = createReflectionCommands(this);
    this.clientToClient = createClientToClientCommands(this);
  }
}
