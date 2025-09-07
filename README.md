# mpc.js

mpc.js is a javascript client library for the [Music Player Daemon](https://www.musicpd.org/).

It features a Promise-based API for all [mpd commands](https://www.musicpd.org/doc/protocol/command_reference.html),
type definitions for [Typescript](https://www.typescriptlang.org/) and works in both
[node.js](https://nodejs.org/) and current browsers (connecting to mpd through a WebSocket bridge
like [websockify](https://github.com/novnc/websockify)).

## Documentation

### Using in node.js

#### ESM
```
import { MPC } from 'mpc-js';
const mpc = new MPC();
await mpc.connectTCP('localhost', 6600);
...
```

#### CommonJS
```
const { MPC } = require('mpc-js');
const mpc = new MPC();
mpc.connectTCP('localhost', 6600).then(async () => {
  ...
});
```

### Using in the browser
To use mpc-js in the browser, you first need to set up a WebSocket bridge through which the browser can connect to mpd:
```
npx github:endpointservices/websockify-js 8000 localhost:6600
```
If you use a bundler, you can `import { MPC } from 'mpc-js'` just as in node.
Otherwise you can copy one of the bundles that can be used directly in the browser into your web folder:

#### ESM
Import [`dist/browser/mpc.min.mjs`](https://unpkg.com/mpc-js@latest/dist/browser/mpc.min.mjs) in your module:
```
<script type="module">
  import { MPC } from './mpc.min.mjs';
  const mpc = new MPC();
  await mpc.connectWebSocket('ws://localhost:8000/');
  ...
</script>
```

#### UMD
Use [`dist/browser/mpc.umd.min.js`](https://unpkg.com/mpc-js@latest/dist/browser/mpc.umd.min.js), which defines the global variable `MPC`:
```
<script src="./mpc.umd.min.js"></script>
<script>
  const mpc = new MPC();
  mpc.connectWebSocket('ws://localhost:8000/').then(async () => {
    ...
  });
</script>
```

### API

[Typedoc](https://typedoc.org/)-generated API documentation is available [here](https://hbenl.github.io/mpc-js/typedoc/classes/node.MPC.html).

### Events

The following events are emitted by the client:

* `ready` - The connection to mpd has been initialized
* `socket-error` - An error event from the underlying socket implementation, the error is passed
  to the event listeners
* `socket-end` - The socket was closed by mpd
* `changed` - There was a change in one or more of mpd's subsystems, the list of changed subsystems
  is passed to the event listeners. This list may contain:
  * `database` - the song database has been modified after `update`
  * `update` - a database update has started or finished; if the database was modified during the update, the `database` event is also emitted
  * `stored_playlist` - a stored playlist has been modified, renamed, created or deleted
  * `playlist` - the current playlist has been modified
  * `player` - the player has been started, stopped or seeked
  * `mixer` - the volume has been changed
  * `output` - an audio output has been enabled or disabled
  * `options` - options like `repeat`, `random`, `crossfade`, replay gain
  * `sticker` - the sticker database has been modified
  * `subscription`: a client has subscribed or unsubscribed to a channel
  * `message`: a message was received on a channel this client is subscribed to; this event is only emitted when the queue is empty
* `changed-<subsystem>` - There was a change in `<subsystem>`

## Examples

Create a client and connect to mpd
```
const mpc = new MPC();

// connect via TCP (when running in node.js)
mpc.connectTCP('localhost', 6600);

// ... or a Unix socket (when running in node.js)
mpc.connectUnixSocket('/run/mpd/socket');

// ... or a WebSocket (when running in a browser)
mpc.connectWebSocket('ws://localhost:8000/');
```
The `connect` methods will return a Promise that is resolved when the connection to mpd has been established or rejected when the connection attempt fails.

### Controlling playback

```
mpc.playback.play();

mpc.playback.next();

mpc.playback.stop();
```

### Changing the current playlist

Clear the playlist and add a directory
```
mpc.currentPlaylist.clear();

mpc.currentPlaylist.add('ambient/Loscil/2010 - Endless Falls');
```

Search the playlist for songs whose title contains 'dub' and delete them
```
mpc.currentPlaylist.playlistSearch('Title', 'dub').then(
  items => items.forEach(item => mpc.currentPlaylist.deleteId(item.id)));
```

### Observing state changes

```
mpc.on('changed-player', () => { 
  mpc.status.status().then(status => { 
    if (status.state == 'play') { 
      mpc.status.currentSong().then(song => console.log(`Playing '${song.title}'`));
    } else {
      console.log('Stopped playback');
    }
  });
});

mpc.playback.play();
Playing 'Lake Orchard'

mpc.playback.stop();
Stopped playback
```

### Exploring the mpd database

List the contents of a directory
```
mpc.database.listFiles('ambient/Loscil/2010 - Endless Falls').then(console.log);

[ File {
    entryType: 'file',
    path: '01. Endless Falls.mp3',
    lastModified: 2014-07-03T18:28:07.000Z,
    size: 19280819 },
  File {
    entryType: 'file',
    path: '02. Estuarine.mp3',
    lastModified: 2014-07-03T18:29:15.000Z,
    size: 20292272 },
(...)
]
```

List metadata for the contents of a directory
```
mpc.database.listInfo('ambient/Loscil/2010 - Endless Falls').then(console.log);

[ Song {
    entryType: 'song',
    path: 'ambient/Loscil/2010 - Endless Falls/01. Endless Falls.mp3',
    lastModified: 2014-07-03T18:28:07.000Z,
    title: 'Endless Falls',
    name: undefined,
    artist: 'Loscil',
    artistSort: undefined,
    composer: undefined,
    performer: undefined,
    album: 'Endless Falls',
    albumSort: undefined,
    albumArtist: 'Loscil',
    albumArtistSort: undefined,
    track: '01/08',
    disc: undefined,
    date: '2010',
    genre: 'Experimental, Ambient',
    comment: undefined,
    musicBrainzArtistId: undefined,
    musicBrainzAlbumId: undefined,
    musicBrainzAlbumArtistId: undefined,
    musicBrainzTrackId: undefined,
    musicBrainzReleaseTrackId: undefined,
    duration: 475 },
(...)
]
```

List song titles from Loscil in 2006, grouped by album
```
mpc.database.list('Title', [['Artist', 'Loscil'], ['Date', '2006']], ['Album']).then(console.log);

Map {
  [ 'Stases' ] => [ 'B15-A', 'Biced', 'Cotom', 'Faint Liquid', 'Micro Hydro', 'Nautical2',
  'Resurgence', 'Sous-marin', 'Still Upon The Ocean Floor', 'Stratus', 'Subaquatic', 'Windless' ],
  [ 'Plume' ] => [ 'Bellows', 'Charlie', 'Chinook', 'Halcyon',
  'Mistral', 'Motoc', 'Rorschach', 'Steam', 'Zephyr' ],
  [ 'Idol Tryouts Two: Ghostly International Vol. Two' ] => [ 'Umbra' ] }

```
