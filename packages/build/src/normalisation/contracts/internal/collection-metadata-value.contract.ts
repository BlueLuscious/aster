import type { CollectionPresentationPolicy } from "@aster/core";

/**
 * @description Structured collection-authored metadata accepted from a replaceable metadata decoder.
 */
export interface ICollectionMetadataValue {
  /**
   * @description Canonical metadata source identifier that produced this value.
   */
  readonly sourceId: string;

  /**
   * @description Canonical collection slug owning the metadata.
   */
  readonly collection: string;

  /**
   * @description Resolved portable collection presentation policy.
   */
  readonly presentation: CollectionPresentationPolicy;

  /**
   * @description Default effective artwork licence identifier.
   */
  readonly licence?: string;

  /**
   * @description Default artwork attribution retained when required.
   */
  readonly attribution?: string;

  /**
   * @description Whether icon-authored metadata may replace the collection artwork licence.
   */
  readonly allowIconLicenceOverride: boolean;
}
