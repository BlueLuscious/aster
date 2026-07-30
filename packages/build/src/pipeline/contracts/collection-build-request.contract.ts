import type { CollectionMetadataSource } from "../../source/contracts/index.js";
import type { CollectionBuildEntry } from "./collection-build-entry.contract.js";
import type { CollectionBuildFile } from "./collection-build-file.contract.js";

/**
 * @description Complete acquired values required to build one collection without host effects.
 */
export interface CollectionBuildRequest {
  /**
   * @description Selected collection metadata import source.
   */
  readonly collectionMetadata: CollectionMetadataSource;

  /**
   * @description Complete acquired SVG and icon metadata pairs.
   */
  readonly entries: readonly CollectionBuildEntry[];

  /**
   * @description Optional existing generated-root text snapshot used for ownership-safe planning.
   */
  readonly existingFiles?: readonly CollectionBuildFile[];
}
