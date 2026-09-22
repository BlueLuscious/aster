import type { IconDefinition } from "@luscious-garden/aster-core";

/**
 * @description Asynchronously resolves one exact distributed icon definition.
 * @remarks Native dynamic-import rejections are preserved for the caller to classify.
 */
export interface IconDefinitionLoader {
  /**
   * @description Loads the canonical definition targeted by this loader.
   * @returns Promise resolving to the exact immutable icon definition.
   */
  (): Promise<IconDefinition>;
}
