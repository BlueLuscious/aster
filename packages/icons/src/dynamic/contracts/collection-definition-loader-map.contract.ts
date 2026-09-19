import type {
  CollectionDefinitionLoader,
} from "./collection-definition-loader.contract.js";

/**
 * @description Immutable exact-loader lookup indexed by canonical collection identity keys.
 * @remarks Unknown keys resolve to `undefined`; the map performs no error adaptation.
 */
export interface CollectionDefinitionLoaderMap {
  /** @description Exact loader when the canonical collection identity is distributed. */
  readonly [key: string]: CollectionDefinitionLoader | undefined;
}
