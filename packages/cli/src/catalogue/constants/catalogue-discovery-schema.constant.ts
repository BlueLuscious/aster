/**
 * @description Immutable closed fields accepted across catalogue discovery records.
 */
export const catalogueDiscoverySchema = Object.freeze({
  /** @description Complete fields accepted on an icon identity. */
  iconIdentityFields: Object.freeze(["namespace", "name", "variant"] as const),
  /** @description Complete fields accepted on a collection identity. */
  collectionIdentityFields: Object.freeze(["namespace", "name"] as const),
  /** @description Complete fields accepted on a discovery container. */
  fields: Object.freeze(["icons", "collections"] as const),
  /** @description Complete fields accepted on an icon discovery record. */
  iconFields: Object.freeze([
    "identity",
    "metadata",
    "memberships",
    "searchTerms",
  ] as const),
  /** @description Required fields on an icon discovery record. */
  requiredIconFields: Object.freeze([
    "identity",
    "metadata",
    "memberships",
  ] as const),
  /** @description Complete fields accepted on a collection discovery record. */
  collectionFields: Object.freeze([
    "identity",
    "metadata",
    "icons",
    "searchTerms",
  ] as const),
  /** @description Required fields on a collection discovery record. */
  requiredCollectionFields: Object.freeze([
    "identity",
    "metadata",
    "icons",
  ] as const),
  /** @description Complete fields accepted on lightweight icon metadata. */
  iconMetadataFields: Object.freeze([
    "displayName",
    "tags",
    "rtl",
    "licence",
    "attribution",
    "deprecated",
    "replacedBy",
  ] as const),
  /** @description Required fields on lightweight icon metadata. */
  requiredIconMetadataFields: Object.freeze([
    "displayName",
    "rtl",
    "deprecated",
  ] as const),
  /** @description Complete fields accepted on collection metadata. */
  collectionMetadataFields: Object.freeze([
    "displayName",
    "description",
    "tags",
    "licence",
    "attribution",
  ] as const),
  /** @description Required fields on collection metadata. */
  requiredCollectionMetadataFields: Object.freeze(["displayName"] as const),
});
