/**
 * @description Decodes one Node module-hook source without changing its exact UTF-8 content.
 * @param {string | ArrayBuffer | ArrayBufferView} source - Module source supplied by a Node load hook.
 * @returns {string} Decoded source text.
 */
export function decodeModuleSource(source) {
  if (typeof source === "string") {
    return source;
  }

  if (ArrayBuffer.isView(source)) {
    return new TextDecoder().decode(
      new Uint8Array(source.buffer, source.byteOffset, source.byteLength),
    );
  }

  return new TextDecoder().decode(source);
}
