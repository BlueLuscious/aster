import type { CollectionDefinition } from "@luscious-garden/aster-core";

/**
 * @description Asynchronously resolves one exact distributed collection definition.
 * @remarks Native dynamic-import rejections are preserved for the caller to classify.
 */
export interface CollectionDefinitionLoader {
  /**
   * @description Loads the canonical definition targeted by this loader.
   * @returns Promise resolving to the exact immutable collection definition.
   */
  (): Promise<CollectionDefinition>;
}
