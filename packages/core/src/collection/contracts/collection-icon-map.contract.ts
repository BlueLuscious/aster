import type { IconVariantMap } from "../../definition/contracts/index.js";

/**
 * @description Explicit collection-local glyph aliases mapped to selected concrete treatments.
 * @remarks Both dictionary key levels are preserved through `Collection.define()`.
 */
export interface CollectionIconMap {
  /**
   * @description Selected treatments sharing one glyph identity under a collection-local alias.
   */
  readonly [alias: string]: IconVariantMap;
}
