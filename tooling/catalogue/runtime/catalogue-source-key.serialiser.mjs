import { catalogueSourceFamilyKinds } from "../constants/catalogue-source-family-kinds.constant.mjs";

/**
 * @description Serialises canonical icon and collection identities to shared distribution keys.
 */
export class CatalogueSourceKeySerialiser {
  /**
   * @description Serialises one complete source identity for its semantic family.
   * @param {"icon" | "collection"} familyKind - Semantic source-family discriminator.
   * @param {{ namespace?: string, name: string, variant?: string }} identity - Complete portable identity.
   * @returns {string} Canonical textual distribution key.
   */
  serialise(familyKind, identity) {
    const namespace = identity.namespace === undefined
      ? ""
      : `${identity.namespace}/`;
    const variant = familyKind === catalogueSourceFamilyKinds.icon
      && identity.variant !== undefined
      ? `@${identity.variant}`
      : "";

    return `${namespace}${identity.name}${variant}`;
  }
}
