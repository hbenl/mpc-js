export class Decoder {

	name: string;
	suffixes: string[];
	mimeTypes: string[];

	constructor(name: string) {
		this.name = name;
		this.suffixes = [];
		this.mimeTypes = [];
	}
}
