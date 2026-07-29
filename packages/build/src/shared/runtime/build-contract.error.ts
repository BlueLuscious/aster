/**
 * @description Deterministic programming error raised for an invalid build-service value.
 */
export class BuildContractError extends TypeError {
  /**
   * @description Canonical Aster-owned code used to construct invalid build-service errors.
   */
  static readonly #code = "ASTER-BUILD-001";

  /**
   * @description Stable Aster-owned code for invalid build-service input.
   */
  readonly code = BuildContractError.#code;

  /**
   * @description Logical value path at which the contract was violated.
   */
  readonly path: string;

  /**
   * @description Creates one deterministic build contract error.
   * @param path - Logical path to the invalid value.
   * @param reason - Stable explanation of the violated invariant.
   */
  constructor(path: string, reason: string) {
    super(`${BuildContractError.#code} at ${path}: ${reason}.`);
    this.name = "BuildContractError";
    this.path = path;
  }
}
