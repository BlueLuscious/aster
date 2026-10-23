/**
 * @description Validated metadata-only collection data extracted from one canonical definition source.
 * @typedef {object} ICatalogueCollectionManifestData
 * @property {{ namespace?: string, name: string }} identity - Complete portable identity with the field semantics of Core's `CollectionIdentity`.
 * @property {{ displayName: string, description: string | undefined, tags: readonly string[] | undefined, licence: string | undefined, attribution: string | undefined }} metadata - Core `CollectionMetadata` fields, retaining explicit undefined values for absent optional metadata.
 */

export {};
