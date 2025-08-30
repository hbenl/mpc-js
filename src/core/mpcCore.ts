import { MPDProtocol } from './protocol.js';
import { StatusCommands, PlaybackCommands, PlaybackOptionsCommands, CurrentPlaylistCommands,
	StoredPlaylistsCommands, DatabaseCommands, MountCommands, StickerCommands, ConnectionCommands,
	PartitionCommands, OutputDeviceCommands, ReflectionCommands, ClientToClientCommands } from './commands/index.js';

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
		this.status = new StatusCommands(this);
		this.playback = new PlaybackCommands(this);
		this.playbackOptions = new PlaybackOptionsCommands(this);
		this.currentPlaylist = new CurrentPlaylistCommands(this);
		this.storedPlaylists = new StoredPlaylistsCommands(this);
		this.database = new DatabaseCommands(this);
		this.mounts = new MountCommands(this);
		this.stickers = new StickerCommands(this);
		this.connection = new ConnectionCommands(this);
		this.partition = new PartitionCommands(this);
		this.outputDevices = new OutputDeviceCommands(this);
		this.reflection = new ReflectionCommands(this);
		this.clientToClient = new ClientToClientCommands(this);
	}
}
