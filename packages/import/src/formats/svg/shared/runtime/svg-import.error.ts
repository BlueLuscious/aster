/**
 * @description Deterministic programming error raised by an impossible SVG import state.
 */
export class SvgImportError extends TypeError {
  /**
   * @description Stable Aster-owned code for an invalid internal SVG import state.
   */
  static readonly #code = "ASTER-IMPORT-002";

  /**
   * @description Stable Aster-owned code for this internal SVG import failure.
   */
  readonly code = SvgImportError.#code;

  /**
   * @description Logical value path at which the contract was violated.
   */
  readonly path: string;

  /**
   * @description Creates one deterministic internal SVG import error.
   * @param path - Logical path to the invalid value.
   * @param reason - Stable explanation of the violated invariant.
   */
  constructor(path: string, reason: string) {
    super(`${SvgImportError.#code} at ${path}: ${reason}.`);
    this.name = "SvgImportError";
    this.path = path;
  }
}

Object.freeze(SvgImportError);
