import type { IconMetadata } from "@aster/core";
import type { IconImportDraft } from "./icon-import-draft.contract.js";

/**
 * @description Complete reviewed input for constructing one portable definition.
 */
export interface IconImportDefinitionRequest {
  /**
   * @description Accepted metadata-free geometry draft.
   */
  readonly draft: IconImportDraft;

  /**
   * @description Complete host-reviewed portable metadata.
   */
  readonly metadata: IconMetadata;
}
