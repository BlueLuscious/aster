import type {
  CollectionIdentity,
  IconIdentity,
} from "@aster/core";

/**
 * @description Formats portable identities into the canonical unambiguous CLI representation.
 */
export class CatalogueIdentityFormatter {
  /**
   * @description Formats one portable icon identity with optional namespace and variant.
   * @param identity - Accepted portable icon identity.
   * @returns Canonical `[namespace/]name[@variant]` value.
   */
  icon(identity: IconIdentity): string {
    return `${identity.namespace === undefined ? "" : `${identity.namespace}/`}${identity.name}${identity.variant === undefined ? "" : `@${identity.variant}`}`;
  }

  /**
   * @description Formats one portable collection identity with an optional namespace.
   * @param identity - Accepted portable collection identity.
   * @returns Canonical `[namespace/]name` value.
   */
  collection(identity: CollectionIdentity): string {
    return `${identity.namespace === undefined ? "" : `${identity.namespace}/`}${identity.name}`;
  }
}
