import type { MPDError, MPDInitialResponse, MPDResponse } from "./protocol.js";
import { concatUint8Arrays } from "./util.js";

export function decodeLines() {

  const decoder = new TextDecoder();

  let buffer: Uint8Array| undefined;
  let binaryLength: number | undefined;

  return new TransformStream<ArrayBuffer, string | ArrayBuffer>({
    transform(data, controller) {
      const chunk = new Uint8Array(data);
      buffer = buffer ? concatUint8Arrays(buffer, chunk) : chunk;

      while (true) {
        if (binaryLength === undefined) {
          const lineSeparatorIndex = buffer.indexOf(10);
          if (lineSeparatorIndex < 0) {
            break;
          }

          const decodedLine = decoder.decode(buffer.subarray(0, lineSeparatorIndex));
          buffer = buffer.subarray(lineSeparatorIndex + 1);

          if (decodedLine.startsWith("binary: ")) {
            binaryLength = parseInt(decodedLine.substring(8));
          } else {
            controller.enqueue(decodedLine);
          }
        } else {
          if (buffer.length <= binaryLength) {
            break;
          }
          controller.enqueue(buffer.slice(0, binaryLength).buffer);
          buffer = buffer.subarray(binaryLength + 1);
          binaryLength = undefined;
        }
      }
    }
  });
}

export function groupResponseLines() {

  const initialRegExp = /^OK MPD ([0-9]+)\.([0-9]+)\.([0-9]+)/;
  const failureRegExp = /ACK \[([0-9]+)@[0-9]+\] \{[^\}]*\} (.*)/;

  let initialized = false;
  let receivingList = false;
  let currentResponse: MPDResponse = { lines: [] };

  return new TransformStream<string | ArrayBuffer, MPDInitialResponse | MPDResponse | MPDError>({
    transform(data, controller) {

      if (!initialized) {

        if (typeof data === 'string') {
          const match = initialRegExp.exec(data);
          if (match) {
            initialized = true;
            controller.enqueue({ version: [ Number(match[1]), Number(match[2]), Number(match[3]) ] });
            return;
          }
        }

        controller.error(`Unexpected initial message: ${data}`);

      } else if (typeof data === 'string') {

        if (data === 'OK') {

          if (!receivingList) {
            controller.enqueue(currentResponse);
            currentResponse = { lines: [] };
          }
          receivingList = false;

        } else if (data === 'list_OK') {

          controller.enqueue(currentResponse);
          currentResponse = { lines: [] };
          receivingList = true;

        } else if (data.startsWith('ACK [')) {

          let mpdError: MPDError;
          const match = failureRegExp.exec(data);
          if (match != null) {
            mpdError = { errorCode: Number(match[1]), errorMessage: match[2]! };
          } else {
            mpdError = { errorCode: -1, errorMessage: `Unknown error: ${data}` };
          }
          controller.enqueue(mpdError);
          currentResponse = { lines: [] };

        } else {
          currentResponse.lines.push(data);
        }

      } else {
        currentResponse.binary = data;
      }
    }
  });
}
