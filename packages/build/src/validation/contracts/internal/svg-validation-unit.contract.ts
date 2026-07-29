import type {
  CollectionMetadataSource,
  IconMetadataSource,
} from "../../../source/contracts/index.js";
import type { ICollectionValidationContract } from "./collection-validation-contract.contract.js";
import type { ISvgValidationEntry } from "./svg-validation-entry.contract.js";

/**
 * @description Complete configured generation unit validated without filesystem-order authority.
 */
export interface ISvgValidationUnit {
  /**
   * @description Required metadata source establishing collection identity.
   */
  readonly collectionMetadata: CollectionMetadataSource;

  /**
   * @description Canonical SVG and syntax entries in arbitrary acquisition order.
   */
  readonly entries: readonly ISvgValidationEntry[];

  /**
   * @description Independently acquired icon metadata sources in arbitrary acquisition order.
   */
  readonly iconMetadata: readonly IconMetadataSource[];

  /**
   * @description Accepted collection-owned visual validation authority.
   */
  readonly collectionContract: ICollectionValidationContract;
}
