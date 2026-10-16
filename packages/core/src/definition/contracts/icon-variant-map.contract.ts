import type { IconDefinition } from "./icon-definition.contract.js";

/**
 * @description Explicit treatment-property selections containing concrete icon definitions.
 * @remarks Keys agree with the treatment property derived from each definition's identity.
 * Family consistency and non-empty collection groups are checked at construction boundaries.
 */
export interface IconVariantMap {
  /** @description Concrete definition selected under its canonical treatment property. */
  readonly [variantProperty: string]: IconDefinition;
}
