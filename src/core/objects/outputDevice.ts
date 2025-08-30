export class OutputDevice {

	/** ID of the output. May change between executions. */
	id: number;

	/** Name of the output. It can be any. */
	name: string;

	/** Status of the output. */
	enabled: boolean;

	plugin?: string;

	attributes: Map<string, string>;

	constructor(valueMap: Map<string, string>) {

		if (!valueMap.has('outputid')) throw new Error('ID not found for OutputDevice object');
		if (!valueMap.has('outputname')) throw new Error('Name not found for OutputDevice object');
		if (!valueMap.has('outputenabled')) throw new Error('Enabled flag not found for OutputDevice object');

		this.id = Number(valueMap.get('outputid')!);
		this.name = valueMap.get('outputname')!;
		this.enabled = Boolean(Number(valueMap.get('outputenabled')!));
		this.plugin = valueMap.get('plugin');

		this.attributes = new Map<string, string>();
		const attrsString = valueMap.get('attribute');
		if (attrsString) {
			const attrStrings = attrsString.split(';');
			for (const attrString of attrStrings) {
				const keyAndValue = attrString.split('=');
				if (keyAndValue.length === 2) {
					this.attributes.set(keyAndValue[0]!, keyAndValue[1]!);
				}
			}
		}
	}
}
