import { getOptionalNumber } from '../util.js';

export class Statistics {

	/**
	 * the number of artists in the database
	 */
	artists?: number;

	/**
	 * the number of albums in the database
	 */
	albums?: number;

	/**
	 * the number of sonds in the database
	 */
	songs?: number;

	/**
	 * daemon uptime in seconds
	 */
	uptime?: number;

	/**
	 * sum of all song lengths in the database in seconds
	 */
	dbPlaytime?: number;

	/**
	 * time of last database update
	 */
	dbUpdate?: Date;

	/**
	 * time length in seconds of music played
	 */
	playtime?: number;

	constructor(valueMap: Map<string, string>) {
		this.artists = getOptionalNumber(valueMap, 'artists');
		this.albums = getOptionalNumber(valueMap, 'albums');
		this.songs = getOptionalNumber(valueMap, 'songs');
		this.uptime = getOptionalNumber(valueMap, 'uptime');
		this.dbPlaytime = getOptionalNumber(valueMap, 'db_playtime');
		this.dbUpdate = valueMap.has('db_update') ? new Date(Number(valueMap.get('db_update')) * 1000) : undefined;
		this.playtime = getOptionalNumber(valueMap, 'playtime');
	}
}
