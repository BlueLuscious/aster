/**
 * @description Deterministic programming error raised for an invalid SVG render operation.
 */
export class SvgRenderError extends TypeError {
  /**
   * @description Stable Aster-owned code for invalid SVG render operations.
   */
  static readonly code = "ASTER-SVG-001";

  /**
   * @description Stable Aster-owned code for invalid SVG render operations.
   */
  readonly code = SvgRenderError.code;

  /**
   * @description Logical value path at which rendering failed.
   */
  readonly path: string;

  /**
   * @description Creates one deterministic SVG render error.
   * @param path - Logical path to the invalid value.
   * @param reason - Stable explanation of the violated invariant.
   */
  constructor(path: string, reason: string) {
    super(`${SvgRenderError.code} at ${path}: ${reason}.`);
    this.name = "SvgRenderError";
    this.path = path;
  }
}

Object.freeze(SvgRenderError);
