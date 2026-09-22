/**
 * @description Deterministic programming error raised for malformed Import API input.
 */
export class IconImportError extends TypeError {
  /**
   * @description Stable Aster-owned code for malformed Import API input.
   */
  static readonly code = "ASTER-IMPORT-001";

  /**
   * @description Stable Aster-owned code for this error occurrence.
   */
  readonly code = IconImportError.code;

  /**
   * @description Logical value path at which the API contract was violated.
   */
  readonly path: string;

  /**
   * @description Creates one deterministic Import contract error.
   * @param path - Logical path to the invalid value.
   * @param reason - Stable explanation of the violated invariant.
   */
  constructor(path: string, reason: string) {
    super(`${IconImportError.code} at ${path}: ${reason}.`);
    this.name = "IconImportError";
    this.path = path;
  }
}

Object.freeze(IconImportError);
