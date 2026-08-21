/**
 * @description Deterministic programming error raised for an invalid authored definition.
 */
export class IconDefinitionError extends TypeError {
  /**
   * @description Stable Aster-owned code for invalid authored Core data.
   */
  static readonly code = "ASTER-CORE-001";

  /**
   * @description Stable Aster-owned code for invalid authored Core data.
   */
  readonly code = IconDefinitionError.code;

  /**
   * @description Logical object path at which validation failed.
   */
  readonly path: string;

  /**
   * @description Creates one deterministic definition validation error.
   * @param path - Logical path to the invalid value.
   * @param reason - Stable explanation of the violated invariant.
   */
  constructor(path: string, reason: string) {
    super(`${IconDefinitionError.code} at ${path}: ${reason}.`);
    this.name = "IconDefinitionError";
    this.path = path;
  }
}

Object.freeze(IconDefinitionError);
