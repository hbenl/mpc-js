export class Mount {

  path: string;
  storage: string;

  constructor(valueMap: Map<string, string>) {

    if (!valueMap.has('mount')) throw new Error('Path not found for Mount object');
    if (!valueMap.has('storage')) throw new Error('URI not found for Mount object');

    this.path = valueMap.get('mount')!;
    this.storage = valueMap.get('storage')!;
  }
}

export class Neighbor {

  neighbor: string;
  name: string;

  constructor(valueMap: Map<string, string>) {

    if (!valueMap.has('neighbor')) throw new Error('URI not found for Neighbor object');
    if (!valueMap.has('storage')) throw new Error('Name not found for Neighbor object');

    this.neighbor = valueMap.get('neighbor')!;
    this.name = valueMap.get('name')!;
  }
}
