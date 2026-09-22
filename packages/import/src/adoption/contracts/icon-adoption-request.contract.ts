import type { IconMetadata } from "@luscious-garden/aster-core";
import type { IconImportSourceType } from "../../source/types/index.js";

/**
 * @description One acquired source and complete reviewed metadata adopted atomically.
 */
export interface IconAdoptionRequest {
  /**
   * @description Explicit format-discriminated source supplied by the host.
   */
  readonly source: IconImportSourceType;

  /**
   * @description Complete host-reviewed portable metadata.
   */
  readonly metadata: IconMetadata;
}
