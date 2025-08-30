import { getOptionalDate } from '../util.js';

export class StoredPlaylist {

  name: string;
  lastModified?: Date;

  constructor(valueMap: Map<string, string>) {

    if (!valueMap.has('playlist')) throw new Error('Name not found for StoredPlaylist object');

    this.name = valueMap.get('playlist')!;
    this.lastModified = getOptionalDate(valueMap, 'Last-Modified');
  }
}

export class PlaylistItem {

  id?: number;
  position?: number;
  title?: string;
  name?: string;
  artist?: string;
  album?: string;
  albumArtist?: string;
  track?: string;
  date?: string;
  genre?: string;
  duration?: number;
  path?: string;
  lastModified?: Date;

  constructor(valueMap: Map<string, string>) {
    this.id = valueMap.has('Id') ? Number(valueMap.get('Id')) : undefined;
    this.position = valueMap.has('Pos') ? Number(valueMap.get('Pos')) : undefined;
    this.title = valueMap.get('Title');
    this.name = valueMap.get('Name');
    this.artist = valueMap.get('Artist');
    this.album = valueMap.get('Album');
    this.albumArtist = valueMap.get('AlbumArtist');
    this.track = valueMap.get('Track');
    this.date = valueMap.get('Date');
    this.genre = valueMap.get('Genre');
    const durationString = valueMap.get('duration') || valueMap.get('Time');
    this.duration = durationString ? Number(durationString) : undefined;
    this.path = valueMap.get('file');
    this.lastModified = getOptionalDate(valueMap, 'Last-Modified');
  }
}

export class SongIdAndPosition {

  songId: number;
  position: number;

  constructor(valueMap: Map<string, string>) {
    this.songId = Number(valueMap.get('Id'));
    this.position = Number(valueMap.get('cpos'));
  }
}
