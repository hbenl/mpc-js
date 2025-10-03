import { MPDProtocol } from '../protocol.js';
import { DirectoryEntry, File, GroupedTagList, Song, Playlist, Directory, SongCount, GroupedSongCount } from '../objects/database.js';

export class DatabaseCommands {

  constructor(private protocol: MPDProtocol) {}

  /**
   * Counts the number of songs and their total playtime in the database that match exactly.
   * `filter` is either a filter expression as described
   * [here](https://www.musicpd.org/doc/html/protocol.html#filter-syntax)
   * or an array of tuples containing a tag and the value that it should match.
   * Note that tags are case sensitive and that the MPD documentation incorrectly lists all
   * tags as lower-case. Use `mpc.reflection.tagTypes()` to get the correct list of tags
   * supported by MPD.
   */
  async count(filter: string | [string, string][] = []): Promise<SongCount> {
    let cmd = 'count';
    cmd = addFilter(cmd, filter);
    const { lines } = await this.protocol.sendCommand(cmd);
    return this.protocol.parse(lines, [], valueMap => new SongCount(valueMap))[0]!;
  }

  /**
   * Counts the number of songs and their total playtime in the database that match exactly.
   * `filter` is either a filter expression as described
   * [here](https://www.musicpd.org/doc/html/protocol.html#filter-syntax)
   * or an array of tuples containing a tag and the value that it should match.
   * The results are grouped by tag `groupingTag` (e.g. 'Artist', 'Album', 'Date', 'Genre')
   * Note that tags are case sensitive and that the MPD documentation incorrectly lists all
   * tags as lower-case. Use `mpc.reflection.tagTypes()` to get the correct list of tags
   * supported by MPD.
   */
  async countGrouped(groupingTag: string, filter: string | [string, string][] = []): Promise<GroupedSongCount[]> {
    let cmd = 'count';
    cmd = addFilter(cmd, filter);
    cmd += ` group ${groupingTag}`;
    const { lines } = await this.protocol.sendCommand(cmd);
    return this.protocol.parse(lines, [groupingTag], valueMap => new GroupedSongCount(valueMap, groupingTag));
  }

  /**
   * Finds songs in the database that match exactly.
   * `start` and `end` can be used to query only a portion of the real response.
   * `sort` sorts the result by the specified tag. The sort is descending if the tag is prefixed with a
   * minus (‘-‘). Without sort, the order is undefined. Only the first tag value will be used,
   * if multiple of the same type exist. To sort by “Artist”, “Album” or “AlbumArtist”, you should
   * specify “ArtistSort”, “AlbumSort” or “AlbumArtistSort” instead. These will automatically fall back
   * to the former if “*Sort” doesn’t exist. “AlbumArtist” falls back to just “Artist”. The type
   * “Last-Modified” can sort by file modification time.
   * `filter` is either a filter expression as described
   * [here](https://www.musicpd.org/doc/html/protocol.html#filter-syntax)
   * or an array of tuples containing a tag or one of the special parameters listed below
   * and the value that it should match. Supported special parameters are:
   * * 'any' checks all tag values
   * * 'file' checks the full path (relative to the music directory)
   * * 'base' restricts the search to songs in the given directory (also relative to the music directory)
   * * 'modified-since' compares the file's time stamp with the given value (ISO 8601 or UNIX time stamp)
   * Note that tags are case sensitive and that the MPD documentation incorrectly lists all
   * tags as lower-case. Use `mpc.reflection.tagTypes()` to get the correct list of tags
   * supported by MPD.
   */
  async find(filter: string | [string, string][], start?: number, end?: number, sort?: string): Promise<Song[]> {
    let cmd = 'find';
    cmd = addFilter(cmd, filter);
    cmd = addSort(cmd, sort);
    cmd = addWindow(cmd, start, end);
    const { lines } = await this.protocol.sendCommand(cmd);
    return this.protocol.parse(lines, ['file'], valueMap => <Song>DirectoryEntry.fromValueMap(valueMap, true));
  }

  /**
   * Finds songs in the database that match exactly and adds them to the current playlist.
   * Parameters have the same meaning as for `find()`.
   */
  async findAdd(filter: string | [string, string][], start?: number, end?: number, sort?: string): Promise<void> {
    let cmd = 'findadd';
    cmd = addFilter(cmd, filter);
    cmd = addSort(cmd, sort);
    cmd = addWindow(cmd, start, end);
    await this.protocol.sendCommand(cmd);
  }

  /**
   * Searches for any song that matches. Parameters have the same meaning as for `find()`,
   * except that the search is a case insensitive substring search.
   */
  async search(filter: string | [string, string][], start?: number, end?: number, sort?: string): Promise<Song[]> {
    let cmd = 'search';
    cmd = addFilter(cmd, filter);
    cmd = addSort(cmd, sort);
    cmd = addWindow(cmd, start, end);
    const { lines } = await this.protocol.sendCommand(cmd);
    return this.protocol.parse(lines, ['file'], valueMap => <Song>DirectoryEntry.fromValueMap(valueMap, true));
  }

  /**
   * Searches for any song that matches and adds them to the current playlist.
   * Parameters have the same meaning as for `find()`, except that the search is a
   * case insensitive substring search.
   */
  async searchAdd(filter: string | [string, string][], start?: number, end?: number, sort?: string): Promise<void> {
    let cmd = 'searchadd';
    cmd = addFilter(cmd, filter);
    cmd = addSort(cmd, sort);
    cmd = addWindow(cmd, start, end);
    await this.protocol.sendCommand(cmd);
  }

  /**
   * Searches for any song that matches and adds them to the playlist named `name`.
   * If a playlist by that name doesn't exist it is created.
   * Parameters have the same meaning as for `find()`, except that the search is a
   * case insensitive substring search.
   */
  async searchAddPlaylist(name: string, filter: string | [string, string][], start?: number, end?: number, sort?: string): Promise<void> {
    let cmd = `searchaddpl ${name}`;
    cmd = addFilter(cmd, filter);
    cmd = addSort(cmd, sort);
    cmd = addWindow(cmd, start, end);
    await this.protocol.sendCommand(cmd);
  }

  /**
   * Lists the contents of the directory `uri`, including files are not recognized by MPD.
   * `uri` can be a path relative to the music directory or an URI understood by one of the
   * storage plugins. For example, "smb://SERVER" returns a list of all shares on the given
   * SMB/CIFS server; "nfs://servername/path" obtains a directory listing from the NFS server. 
   */
  async listFiles(uri?: string): Promise<(File | Directory)[]> {
    let cmd = 'listfiles';
    if (uri) {
      cmd += ` "${uri}"`;
    }
    const { lines } = await this.protocol.sendCommand(cmd);
    return this.protocol.parse(lines, ['file', 'directory'], valueMap => <File | Directory>DirectoryEntry.fromValueMap(valueMap, false));
  }

  /**
   * Lists the contents of the directory `uri`. When listing the root directory, this currently
   * returns the list of stored playlists. This behavior is deprecated; use `listPlaylists()`
   * instead. This command may be used to list metadata of remote files (e.g. `uri` beginning
   * with "http://" or "smb://"). Clients that are connected via UNIX domain socket may use this
   * command to read the tags of an arbitrary local file (`uri` is an absolute path).
   */
  async listInfo(uri?: string): Promise<(Song | Playlist | Directory)[]> {
    let cmd = 'lsinfo';
    if (uri) {
      cmd += ` "${uri}"`;
    }
    const { lines } = await this.protocol.sendCommand(cmd);
    return this.protocol.parse(lines, ['file', 'playlist', 'directory'], valueMap => <Song | Playlist | Directory>DirectoryEntry.fromValueMap(valueMap, true));
  }

  /**
   * Lists all songs and directories in `uri` recursively. Do not use this command to manage a
   * client-side copy of MPD's database. That is fragile and adds huge overhead.
   * It will break with large databases. Instead, query MPD whenever you need something.
   */
  async listAll(uri?: string): Promise<string[]> {
    let cmd = 'listall';
    if (uri) {
      cmd += ` "${uri}"`;
    }
    const { lines } = await this.protocol.sendCommand(cmd);
    return lines.map(line => line.substring(line.indexOf(':') + 2));
  }

  /**
   * Same as `listAll()`, except it also returns metadata info. Do not use this command to
   * manage a client-side copy of MPD's database. That is fragile and adds huge overhead.
   * It will break with large databases. Instead, query MPD whenever you need something.
   */
  async listAllInfo(uri?: string): Promise<(Song | Playlist | Directory)[]> {
    let cmd = 'listallinfo';
    if (uri) {
      cmd += ` "${uri}"`;
    }
    const { lines } = await this.protocol.sendCommand(cmd);
    return this.protocol.parse(lines, ['file', 'playlist', 'directory'], valueMap => <Song | Playlist | Directory>DirectoryEntry.fromValueMap(valueMap, true));
  }

  /**
   * Lists unique tags values of the specified type. `type` can be any tag supported by MPD
   * or 'file', but 'file' is deprecated. `filter` specifies a filter like the one in `find()`.
   * Note that tags are case sensitive and that the MPD documentation incorrectly lists all
   * tags as lower-case. Use `mpc.reflection.tagTypes()` to get the correct list of tags
   * supported by MPD.
   */
  async list(type: string, filter: string | [string, string][] = []): Promise<string[]> {
    let cmd = `list ${type}`;
    cmd = addFilter(cmd, filter);
    const { lines } = await this.protocol.sendCommand(cmd);
    return lines.map(line => line.substring(type.length + 2));
  }

  /**
   * Lists unique tags values of the specified type. `type` can be any tag supported by MPD
   * or 'file', but 'file' is deprecated. `filter` specifies a filter like the one in `find()`.
   * `groupingTags` are used to group the results by one or more tags.
   * Note that tags are case sensitive and that the MPD documentation incorrectly lists all
   * tags as lower-case. Use `mpc.reflection.tagTypes()` to get the correct list of tags
   * supported by MPD.
   */
  async listGrouped(type: string, groupingTags: [string, ...string[]], filter: string | [string, string][] = []): Promise<GroupedTagList[]> {
    let cmd = `list ${type}`;
    cmd = addFilter(cmd, filter);
    groupingTags.forEach(tag => {
      cmd += ` group ${tag}`;
    });
    const { lines } = await this.protocol.sendCommand(cmd);

    const result: GroupedTagList[] = [];
    let currentGroup = new Array(groupingTags.length).fill("");
    let currentTags: string[] = [];
    function saveCurrentTags() {
      if (currentTags.length > 0) {
        result.push(new GroupedTagList(currentGroup, currentTags));
        currentGroup = [...currentGroup];
        currentTags = [];
      }
    }
    lines.forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex);
        const value = line.substring(colonIndex + 2);
        if (groupingTags.includes(key)) {
          saveCurrentTags();
          currentGroup[groupingTags.indexOf(key)] = value;
        } else {
          currentTags.push(value);
        }
      }
    });
    saveCurrentTags();

    return result;
  }

  /**
   * Read "comments" (i.e. key-value pairs) from the file specified by `uri`. This `uri` can be
   * a path relative to the music directory or an absolute path. This command may be used to list
   * metadata of remote files (e.g. `uri` beginning with "http://" or "smb://").
   * Comments with suspicious characters (e.g. newlines) are ignored silently.
   * The meaning of these depends on the codec, and not all decoder plugins support it.
   * For example, on Ogg files, this lists the Vorbis comments.
   */
  async readComments(uri: string): Promise<Map<string, string>> {
    const cmd = `readcomments "${uri}"`;
    const { lines } = await this.protocol.sendCommand(cmd);
    return this.protocol.parse(lines, [], valueMap => valueMap)[0]!;
  }

  /**
   * Updates the music database: find new files, remove deleted files, update modified files.
   * `uri` is a particular directory or song/file to update. If you do not specify it, everything
   * is updated. Returns a positive number identifying the update job. You can read the current
   * job id in the status response. 
   */
  async update(uri?: string): Promise<number> {
    let cmd = 'update';
    if (uri) {
      cmd += ` "${uri}"`;
    }
    const { lines } = await this.protocol.sendCommand(cmd);
    return Number(lines[0]!.substring(13));
  }

  /**
   * Same as `update()`, but also rescans unmodified files.
   */
  async rescan(uri?: string): Promise<number> {
    let cmd = 'rescan';
    if (uri) {
      cmd += ` "${uri}"`;
    }
    const { lines } = await this.protocol.sendCommand(cmd);
    return Number(lines[0]!.substring(13));
  }
}

function addFilter(cmd: string, filter: string | [string, string][]): string {
  if (typeof filter === 'string') {
    cmd += ` "${filter.replace(/\\/g, '\\\\').replace(/\"/g, '\\\"')}"`;
  } else {
    filter.forEach(tagAndNeedle => {
      cmd += ` ${tagAndNeedle[0]} "${tagAndNeedle[1]}"`;
    });
  }
  return cmd;
}

function addSort(cmd: string, sort?: string): string {
  if (sort !== undefined) {
    cmd += ` sort ${sort}`;
  }
  return cmd;
}

function addWindow(cmd: string, start?: number, end?: number): string {
  if (start !== undefined) {
    cmd += ` window ${start}:${(end !== undefined) ? end : ''}`;
  }
  return cmd;
}
