import type { IconDefinition } from "@aster/core";
import type { ISvgNormalisationRequest } from "./svg-normalisation-request.contract.js";

/**
 * @description Internal authority that converts validated SVG evidence into portable definitions.
 */
export interface ISvgNormaliser {
  /**
   * @description Normalises one complete successful validation unit.
   * @param request - Validated SVG evidence and linked structured metadata.
   * @returns Canonically ordered immutable portable icon definitions.
   */
  normalise(request: ISvgNormalisationRequest): readonly IconDefinition[];
}
