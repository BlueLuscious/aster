import type { CollectionMetadataSource } from "../../../source/contracts/index.js";
import type { ICollectionValidationContract } from "./collection-validation-contract.contract.js";
import type { IValidatedSvgEntry } from "./validated-svg-entry.contract.js";

/**
 * @description Complete validation evidence available only when no blocking diagnostic exists.
 */
export interface ISvgValidationEvidence {
  /**
   * @description Collection metadata source whose identity matched the complete unit.
   */
  readonly collectionMetadata: CollectionMetadataSource;

  /**
   * @description Accepted collection visual-rule authority.
   */
  readonly collectionContract: ICollectionValidationContract;

  /**
   * @description Validated entries in canonical logical identity order.
   */
  readonly entries: readonly IValidatedSvgEntry[];
}
