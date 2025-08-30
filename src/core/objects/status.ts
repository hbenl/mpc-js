import { getOptionalNumber, getOptionalBoolean, parseOptionalNumber } from '../util';

/**
 * The current status of the player
 */
export class Status {

	/**
	 * the name of the current partition
	 */
	partition?: string;

	state?: 'play' | 'stop' | 'pause';

	/**
	 * index of the currently playing or stopped on song within the playlist
	 */
	song?: number;

	/**
	 * playlist songid of the currently playing or stopped on song
	 */
	songId?: number;

	/**
	 * index of the next song within the playlist
	 */
	nextSong?: number;

	/**
	 * playlist songid of the next song
	 */
	nextSongId?: number;

	/**
	 * total time elapsed within the current song in seconds
	 */
	elapsed?: number;

	/**
	 * duration of the current song in seconds
	 */
	duration?: number;

	/**
	 * current bitrate in kbps
	 */
	bitRate?: number;

	/**
	 *  The format emitted by the decoder plugin during playback, format: "samplerate:bits:channels".
	 */
	audio?: string;

	sampleRate?: number;

	bitDepth?: number;

	channels?: number;

	/**
	 * 0-100
	 */
	volume?: number;

	/**
	 * crossfade in seconds
	 */
	xfade?: number;

	/**
	 * mixramp threshold in dB
	 */
	mixrampdb?: number;

	/**
	 * mixramp delay in seconds
	 */
	mixrampDelay?: number;

	/**
	 * 31-bit unsigned integer, the playlist version number
	 */
	playlistVersion?: number;

	/**
	 * integer, the length of the playlist
	 */
	playlistLength?: number;

	repeat?: boolean;

	random?: boolean;

	single?: boolean | 'oneshot';

	consume?: boolean;

	/**
	 * update job id
	 */
	updating?: number;

	error?: string;

	constructor(valueMap: Map<string, string>) {
		this.partition = valueMap.get('partition');
		this.state = <'play' | 'stop' | 'pause'>valueMap.get('state');
		this.song = getOptionalNumber(valueMap, 'song');
		this.songId = getOptionalNumber(valueMap, 'songid');
		this.nextSong = getOptionalNumber(valueMap, 'nextsong');
		this.nextSongId = getOptionalNumber(valueMap, 'nextsongid');
		this.elapsed = getOptionalNumber(valueMap, 'elapsed');
		this.duration = getOptionalNumber(valueMap, 'duration');
		this.bitRate = getOptionalNumber(valueMap, 'bitrate');
		this.audio = valueMap.get('audio');
		const splitAudio = this.audio ? this.audio.split(':') : [];
		this.sampleRate = parseOptionalNumber(splitAudio[0]);
		this.bitDepth = parseOptionalNumber(splitAudio[1]);
		this.channels = parseOptionalNumber(splitAudio[2]);
		this.volume = getOptionalNumber(valueMap, 'volume');
		this.xfade = getOptionalNumber(valueMap, 'xfade');
		this.mixrampdb = getOptionalNumber(valueMap, 'mixrampdb');
		this.mixrampDelay = getOptionalNumber(valueMap, 'mixrampdelay');
		this.playlistVersion = getOptionalNumber(valueMap, 'playlist');
		this.playlistLength = getOptionalNumber(valueMap, 'playlistlength');
		this.repeat = getOptionalBoolean(valueMap, 'repeat');
		this.random = getOptionalBoolean(valueMap, 'random');
		const singleString = valueMap.get('single');
		if (singleString !== undefined) {
			this.single = (singleString === 'oneshot') ? 'oneshot' : Boolean(Number(singleString));
		}
		this.consume = getOptionalBoolean(valueMap, 'consume');
		this.updating = getOptionalNumber(valueMap, 'updating_db');
		this.error = valueMap.get('error');
	}
}
