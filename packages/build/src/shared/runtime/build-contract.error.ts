/**
 * @description Deterministic programming error raised for an invalid build-service value.
 */
export class BuildContractError extends TypeError {
  /**
   * @description Stable Aster-owned code for invalid build-service input.
   */
  readonly code = "ASTER-BUILD-001";

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
    super(`ASTER-BUILD-001 at ${path}: ${reason}.`);
    this.name = "BuildContractError";
    this.path = path;
  }
}
