/**
 * @description Immutable version-one metadata fields, policies, and resource limits.
 */
export const metadataSchema = Object.freeze({
  schemaVersion: 1,
  maximumContentLength: 1_000_000,
  maximumDepth: 64,
  collectionFields: Object.freeze([
    "schemaVersion",
    "name",
    "slug",
    "status",
    "description",
    "package",
    "licence",
    "attribution",
    "allowIconLicenceOverride",
    "defaultSize",
    "minimumSize",
    "presentationDefaults",
    "presentationOverrides",
    "validation",
  ] as const),
  packageFields: Object.freeze(["name", "version"] as const),
  iconFields: Object.freeze([
    "schemaVersion",
    "name",
    "variant",
    "displayName",
    "rtl",
    "licence",
    "attribution",
    "deprecated",
    "replacedBy",
  ] as const),
  identityFields: Object.freeze([
    "collection",
    "name",
    "variant",
  ] as const),
  rtlPolicies: Object.freeze(["preserve", "mirror"] as const),
  statuses: Object.freeze(["experimental", "stable"] as const),
} as const);
