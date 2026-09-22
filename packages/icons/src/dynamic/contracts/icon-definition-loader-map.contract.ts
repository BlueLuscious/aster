import type { IconDefinitionLoader } from "./icon-definition-loader.contract.js";

/**
 * @description Immutable exact-loader lookup indexed by canonical icon identity keys.
 * @remarks Unknown keys resolve to `undefined`; the map performs no error adaptation.
 */
export interface IconDefinitionLoaderMap {
  /** @description Exact loader when the canonical icon identity is distributed. */
  readonly [key: string]: IconDefinitionLoader | undefined;
}
