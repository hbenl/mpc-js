import { getOptionalDate, parseOptionalNumber } from '../util.js';

/**
 * The types of objects in the music database
 */
export declare type DirectoryEntryType = 'file' | 'song' | 'playlist' | 'directory';

/**
 * Base class for objects in the music database.
 */
export class DirectoryEntry {

  path: string;
  lastModified?: Date;
  entryType: DirectoryEntryType;

  constructor(valueMap: Map<string, string>, pathKey: string, entryType: DirectoryEntryType) {

    if (!valueMap.has(pathKey)) throw new Error('Path not found for DirectoryEntry object');

    this.entryType = entryType;
    this.path = valueMap.get(pathKey)!;
    this.lastModified = getOptionalDate(valueMap,'Last-Modified');
  }

  static fromValueMap(valueMap: Map<string, string>, withMetadata = true): DirectoryEntry {
    if (valueMap.get('file')) {
      if (withMetadata) {
        return new Song(valueMap);
      } else {
        return new File(valueMap);
      }
    } else if (valueMap.get('directory')) {
      return new Directory(valueMap);
    } else if (valueMap.get('playlist')) {
      return new Playlist(valueMap);
    } else {
      const keys = [ ...valueMap.keys() ].map(key => `'${key}'`).join(', ');
      throw new Error(`Couldn't determine type of directory entry with keys ${keys}`)
    }
  }

  isFile(): this is File { return this.entryType === 'file'; }
  isSong(): this is Song { return this.entryType === 'song'; }
  isPlaylist(): this is Playlist { return this.entryType === 'playlist'; }
  isDirectory(): this is Directory { return this.entryType === 'directory'; }
}

export class File extends DirectoryEntry {

  declare entryType: 'file';
  size?: number;

  constructor(valueMap: Map<string, string>) {
    super(valueMap, 'file', 'file');
    this.size = valueMap.has('size') ? Number(valueMap.get('size')) : undefined;
  }
}

export class Song extends DirectoryEntry {

  declare entryType: 'song';

  /**
   * the song title
   */
  title?: string;

  /**
   * same as title, but for sorting
   */
  titleSort?: string;

  /**
   * a name for this song. This is not the song title. The exact meaning of this tag is not well-defined.
   * It is often used by badly configured internet radio stations with broken tags to squeeze both
   * the artist name and the song title in one tag
   */
  name?: string;

  /**
   * the artist name. Its meaning is not well-defined; see “composer” and “performer” for more specific tags
   */
  artist?: string;

  /**
   * same as artist, but for sorting. This usually omits prefixes such as “The”
   */
  artistSort?: string;

  /**
   * the artist who composed the song
   */
  composer?: string;

  /**
   * same as composer, but for sorting
   */
  composerSort?: string;

  /**
   * the artist who performed the song
   */
  performer?: string;

  /**
   * the conductor who conducted the song
   */
  conductor?: string;

  /**
   * the album name
   */
  album?: string;

  /**
   * same as album, but for sorting
   */
  albumSort?: string;

  /**
   * on multi-artist albums, this is the artist name which shall be used for the whole album.
   * The exact meaning of this tag is not well-defined
   */
  albumArtist?: string;

  /**
   * same as albumArtist, but for sorting
   */
  albumArtistSort?: string;

  /**
   * the decimal track number within the album
   */
  track?: string;

  /**
   * the decimal disc number in a multi-disc album
   */
  disc?: string;

  /**
   * the name of the label or publisher
   */
  label?: string;

  /**
   * the song’s release date. This is usually a 4-digit year
   */
  date?: string;

  /**
   * the song’s original release date
   */
  originalDate?: string;

  /**
   * the music genre
   */
  genre?: string;

  /**
   * the mood of the audio with a few keywords
   */
  mood?: string;

  /**
   * “a work is a distinct intellectual or artistic creation,
   * which can be expressed in the form of one or more audio recordings”
   */
  work?: string;

  /**
   * the ensemble performing this song, e.g. “Wiener Philharmoniker”
   */
  ensemble?: string;

  /**
   * name of the movement, e.g. “Andante con moto”
   */
  movement?: string;

  /**
   * movement number, e.g. “2” or “II”
   */
  movementNumber?: string;

  /**
   * If this is true players supporting this tag will display the work,
   * movement, and movementnumber` instead of the track title
   */
  showMovement?: boolean;

  /**
   * location of the recording, e.g. “Royal Albert Hall”
   */
  location?: string;

  /**
   * “used if the sound belongs to a larger category of sounds/music”
   */
  grouping?: string;

  /**
   * a human-readable comment about this song. The exact meaning of this tag is not well-defined
   */
  comment?: string;

  /**
   * the artist id in the MusicBrainz database
   */
  musicBrainzArtistId?: string;

  /**
   * the album id in the MusicBrainz database
   */
  musicBrainzAlbumId?: string;

  /**
   * the album artist id in the MusicBrainz database
   */
  musicBrainzAlbumArtistId?: string;

  /**
   * the track id in the MusicBrainz database
   */
  musicBrainzTrackId?: string;

  /**
   * the release group id in the MusicBrainz database
   */
  musicBrainzReleaseGroupId?: string;

  /**
   * the release track id in the MusicBrainz database
   */
  musicBrainzReleaseTrackId?: string;

  /**
   * the work id in the MusicBrainz database
   */
  musicBrainzWorkId?: string;

  /**
   * the duration of the song in seconds; may contain a fractional part
   */
  duration?: number;

  /**
   *  The format emitted by the decoder plugin, format: "samplerate:bits:channels".
   */
  format?: string;

  sampleRate?: number;

  bitDepth?: number;

  channels?: number;

  constructor(valueMap: Map<string, string>) {
    super(valueMap, 'file', 'song');
    this.title = valueMap.get('Title');
    this.titleSort = valueMap.get('TitleSort');
    this.name =  valueMap.get('Name');
    this.artist = valueMap.get('Artist');
    this.artistSort = valueMap.get('ArtistSort');
    this.composer = valueMap.get('Composer');
    this.composerSort = valueMap.get('ComposerSort');
    this.performer = valueMap.get('Performer');
    this.conductor = valueMap.get('Conductor');
    this.album = valueMap.get('Album');
    this.albumSort = valueMap.get('AlbumSort');
    this.albumArtist = valueMap.get('AlbumArtist');
    this.albumArtistSort = valueMap.get('AlbumArtistSort');
    this.track = valueMap.get('Track');
    this.disc = valueMap.get('Disc');
    this.label = valueMap.get('Label');
    this.date = valueMap.get('Date');
    this.originalDate = valueMap.get('OriginalDate');
    this.genre = valueMap.get('Genre');
    this.mood = valueMap.get('Mood');
    this.work = valueMap.get('Work');
    this.ensemble = valueMap.get('Ensemble');
    this.movement = valueMap.get('Movement');
    this.movementNumber = valueMap.get('MovementNumber');
    this.showMovement = valueMap.get('ShowMovement') === '1';
    this.location = valueMap.get('Location');
    this.grouping = valueMap.get('Grouping');
    this.comment = valueMap.get('Comment');
    this.musicBrainzArtistId = valueMap.get('MUSICBRAINZ_ARTISTID');
    this.musicBrainzAlbumId = valueMap.get('MUSICBRAINZ_ALBUMID');
    this.musicBrainzAlbumArtistId = valueMap.get('MUSICBRAINZ_ALBUMARTISTID');
    this.musicBrainzTrackId = valueMap.get('MUSICBRAINZ_TRACKID');
    this.musicBrainzReleaseGroupId = valueMap.get('MUSICBRAINZ_RELEASEGROUPID');
    this.musicBrainzReleaseTrackId = valueMap.get('MUSICBRAINZ_RELEASETRACKID');
    this.musicBrainzWorkId = valueMap.get('MUSICBRAINZ_WORKID');
    const durationString = valueMap.get('duration') || valueMap.get('Time');
    this.duration = durationString ? Number(durationString) : undefined;
    this.format = valueMap.get('format');
    const splitFormat = this.format ? this.format.split(':') : [];
    this.sampleRate = parseOptionalNumber(splitFormat[0]);
    this.bitDepth = parseOptionalNumber(splitFormat[1]);
    this.channels = parseOptionalNumber(splitFormat[2]);
  }
}

export class Playlist extends DirectoryEntry {

  declare entryType: 'playlist';

  constructor(valueMap: Map<string, string>) {
    super(valueMap, 'playlist', 'playlist');
  }
}

export class Directory extends DirectoryEntry {

  declare entryType: 'directory';

  constructor(valueMap: Map<string, string>) {
    super(valueMap, 'directory', 'directory');
  }
}

export class SongCount {

  songs: number;
  playtime: number;

  constructor(valueMap: Map<string, string>) {

    if (!valueMap.has('songs')) throw new Error('Number of songs not found for SongCount object');
    if (!valueMap.has('playtime')) throw new Error('Playtime of songs not found for SongCount object');

    this.songs = Number(valueMap.get('songs'));
    this.playtime = Number(valueMap.get('playtime'));
  }
}

export class GroupedSongCount extends SongCount {

  group: string;

  constructor(valueMap: Map<string, string>, groupingTag: string) {
    super(valueMap);

    if (!valueMap.has(groupingTag)) throw new Error(`'${groupingTag}' not found for GroupedSongCount object`);

    this.group = valueMap.get(groupingTag)!;
  }
}

export class GroupedTagList {
  constructor(
    public group: string[],
    public tags: string[]
  ) {}
}

export class Picture {
  constructor(
    public data: ArrayBuffer,
    public type: string
  ) {}
}
