import type {
  CollectionIdentity,
  IconIdentity,
  IconMetadata,
} from "@aster/core";

/**
 * @description Immutable catalogue result for one portable icon identity and its evidence.
 */
export interface CatalogueIconResult {
  /**
   * @description Discriminator for a portable icon result.
   */
  readonly kind: "icon";

  /**
   * @description Provider that supplied the accepted icon record.
   */
  readonly catalogue: string;

  /**
   * @description Stable portable icon identity.
   */
  readonly identity: IconIdentity;

  /**
   * @description Complete portable icon metadata retained by the accepted definition.
   */
  readonly metadata: IconMetadata;

  /**
   * @description Independent collections containing the icon in this provider.
   */
  readonly memberships: readonly CollectionIdentity[];
}
