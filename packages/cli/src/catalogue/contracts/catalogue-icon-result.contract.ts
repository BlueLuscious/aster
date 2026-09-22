import type {
  CollectionIdentity,
  IconIdentity,
} from "@luscious-garden/aster-core";
import type { catalogueResultKinds } from "../constants/catalogue-result-kinds.constant.js";
import type { CatalogueIconMetadata } from "./catalogue-icon-metadata.contract.js";

/**
 * @description Immutable catalogue result for one portable icon identity and its evidence.
 */
export interface CatalogueIconResult {
  /**
   * @description Discriminator for a portable icon result.
   */
  readonly kind: typeof catalogueResultKinds.icon;

  /**
   * @description Provider that supplied the accepted icon record.
   */
  readonly catalogue: string;

  /**
   * @description Stable portable icon identity.
   */
  readonly identity: IconIdentity;

  /**
   * @description Lightweight portable metadata retained by accepted discovery.
   */
  readonly metadata: CatalogueIconMetadata;

  /**
   * @description Independent collections containing the icon in this provider.
   */
  readonly memberships: readonly CollectionIdentity[];
}
