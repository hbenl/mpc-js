import type { MPDError, MPDInitialResponse, MPDResponse } from "./protocol.js";

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

export function isInitialResponse(response: MPDInitialResponse | MPDResponse | MPDError): response is MPDInitialResponse {
  return 'version' in response;
}

export function isError(response: MPDInitialResponse | MPDResponse | MPDError): response is MPDError {
  return 'errorMessage' in response;
}

/**
 * Helper function for parsing a response from the daemon into an array of objects
 * @param lines    The daemon response
 * @param markers  Markers are keys denoting the start of a new object within the response
 * @param convert  Converts a key-value Map from the response into the desired target object
 */
export function parse<T>(lines: string[], markers: string[], convert: (valueMap: Map<string, string>) => T): T[] {
  const result = new Array<T>();
  let currentValueMap = new Map<string, string>();
  let lineCount = 0;

  lines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex);
      const value = line.substring(colonIndex + 2);
      if ((lineCount > 0) && markers.some(marker => (marker == key))) {
        result.push(convert(currentValueMap));
        currentValueMap = new Map<string, string>();
      }
      if (currentValueMap.has(key)) {
        const multiValue = [currentValueMap.get(key), value].join(';');
        currentValueMap.set(key, multiValue);
      }
      else {
        currentValueMap.set(key, value);
      }
      lineCount++;
    }
  });
  if (lineCount > 0) {
    result.push(convert(currentValueMap));
  }

  return result;
}
