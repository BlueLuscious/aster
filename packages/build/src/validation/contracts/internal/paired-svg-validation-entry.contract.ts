import type { IconMetadataSource } from "../../../source/contracts/index.js";
import type { ISvgValidationEntry } from "./svg-validation-entry.contract.js";

/**
 * @description Canonical SVG entry resolved to exactly one independently acquired metadata source.
 */
export interface IPairedSvgValidationEntry extends ISvgValidationEntry {
  /**
   * @description Required icon metadata source with the same canonical identity.
   */
  readonly metadata: IconMetadataSource;
}
