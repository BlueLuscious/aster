/**
 * @import { ICatalogueCollectionMemberReference } from "./catalogue-collection-member-reference.contract.mjs"
 * @import { ICatalogueCollectionManifestData } from "./catalogue-collection-manifest-data.contract.mjs"
 * @import { ICatalogueIconManifestData } from "./catalogue-icon-manifest-data.contract.mjs"
 */

/**
 * @description Validated syntax-owned data extracted from one canonical catalogue source.
 * @typedef {object} ICatalogueSourceSyntaxInspection
 * @property {readonly ICatalogueCollectionMemberReference[]} memberReferences - Imported members retained by a collection source.
 * @property {ICatalogueIconManifestData | ICatalogueCollectionManifestData} manifest - Metadata-only distribution data.
 */

export {};
