import type {
  CollectionIdentity,
  IconIdentity,
  IconGlyphIdentity,
} from "@luscious-garden/aster-core";

/**
 * @description Formats portable identities into the canonical unambiguous CLI representation.
 */
export class CatalogueIdentityFormatter {
  /**
   * @description Formats one portable icon identity with optional namespace and required treatment.
   * @param identity - Accepted portable icon identity.
   * @returns Canonical `[namespace/]name@variant` value.
   */
  icon(identity: IconIdentity): string {
    return `${this.glyph(identity)}@${identity.variant}`;
  }

  /**
   * @description Formats a glyph family without choosing any of its concrete treatments.
   * @param identity - Accepted portable namespace/name identity.
   * @returns Canonical `[namespace/]name` glyph key.
   */
  glyph(identity: IconGlyphIdentity): string {
    const namespace = !Object.hasOwn(identity, "namespace") || identity.namespace === undefined
      ? ""
      : `${identity.namespace}/`;
    return `${namespace}${identity.name}`;
  }

  /**
   * @description Formats one portable collection identity with an optional namespace.
   * @param identity - Accepted portable collection identity.
   * @returns Canonical `[namespace/]name` value.
   */
  collection(identity: CollectionIdentity): string {
    return this.glyph(identity);
  }
}
