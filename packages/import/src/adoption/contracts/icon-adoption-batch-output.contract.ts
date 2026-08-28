import type { IconAdoptionOutput } from "./icon-adoption-output.contract.js";

/**
 * @description Canonically ordered all-or-nothing adoption batch output.
 */
export interface IconAdoptionBatchOutput {
  /**
   * @description Successful adoptions ordered by portable identity.
   */
  readonly entries: readonly IconAdoptionOutput[];
}
