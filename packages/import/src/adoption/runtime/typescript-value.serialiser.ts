import { IconImportError } from "../../error/index.js";

/**
 * @description Serialises plain portable values as deterministic TypeScript literals.
 */
export class TypeScriptValueSerialiser {
  /**
   * @description Serialises one portable value with stable indentation and escaped separators.
   * @param value - Plain serialisable portable value.
   * @returns Deterministic TypeScript-compatible literal text.
   */
  serialise(value: unknown): string {
    const serialised = JSON.stringify(value, null, 2);

    if (serialised === undefined) {
      throw new IconImportError(
        "definition",
        "expected a serialisable portable value",
      );
    }

    return serialised
      .replaceAll("\u2028", String.raw`\u2028`)
      .replaceAll("\u2029", String.raw`\u2029`);
  }
}
