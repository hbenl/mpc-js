export function stringStartsWith(str: string, prefix: string): boolean {
  return ((str.length >= prefix.length) && (str.substring(0, prefix.length) == prefix));
}

export function getOptionalNumber(valueMap: Map<string, string>, key: string): number | undefined {
  return valueMap.has(key) ? Number(valueMap.get(key)) : undefined;
}

export function getOptionalDate(valueMap: Map<string, string>, key: string): Date | undefined {
  return valueMap.has(key) ? new Date(valueMap.get(key)!) : undefined;
}

export function getOptionalBoolean(valueMap: Map<string, string>, key: string): boolean | undefined {
  return valueMap.has(key) ? Boolean(Number(valueMap.get(key))) : undefined;
}

export function parseOptionalNumber(num: string | undefined): number | undefined {
  return (num !== undefined) ? Number(num) : undefined;
}
