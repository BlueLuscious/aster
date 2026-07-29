import type { ISvgValidationEvidence } from "../../../validation/contracts/internal/svg-validation-evidence.contract.js";
import type { ICollectionMetadataValue } from "./collection-metadata-value.contract.js";
import type { IIconMetadataValue } from "./icon-metadata-value.contract.js";

/**
 * @description Complete validated SVG evidence and decoded metadata values required for normalisation.
 */
export interface ISvgNormalisationRequest {
  /**
   * @description Evidence proving that every SVG entry is safe and non-blocking.
   */
  readonly evidence: ISvgValidationEvidence;

  /**
   * @description Structured collection metadata linked to the validated collection source.
   */
  readonly collectionMetadata: ICollectionMetadataValue;

  /**
   * @description Structured icon metadata values linked to validated icon metadata sources.
   */
  readonly iconMetadata: readonly IIconMetadataValue[];
}
