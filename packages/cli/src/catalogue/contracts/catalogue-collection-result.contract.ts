import type {
  CollectionIdentity,
  CollectionMetadata,
  IconIdentity,
} from "@aster/core";
import type { catalogueResultKinds } from "../constants/catalogue-result-kinds.constant.js";

/**
 * @description Immutable catalogue result for one portable collection and its member evidence.
 */
export interface CatalogueCollectionResult {
  /**
   * @description Discriminator for a portable collection result.
   */
  readonly kind: typeof catalogueResultKinds.collection;

  /**
   * @description Provider that supplied the accepted collection record.
   */
  readonly catalogue: string;

  /**
   * @description Stable portable collection identity.
   */
  readonly identity: CollectionIdentity;

  /**
   * @description Complete portable collection metadata.
   */
  readonly metadata: CollectionMetadata;

  /**
   * @description Stable identities of icons directly retained by the collection.
   */
  readonly icons: readonly IconIdentity[];
}
