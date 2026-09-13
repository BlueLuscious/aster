/**
 * @import { ICatalogueCollectionMemberReference } from "./catalogue-collection-member-reference.contract.mjs"
 */

/**
 * @description One validated canonical catalogue source module.
 * @typedef {object} ICatalogueSourceModule
 * @property {string} name - Canonical definition name derived from and verified against source.
 * @property {string | undefined} variant - Optional canonical icon rendition.
 * @property {string} symbol - Exact exported definition symbol.
 * @property {string} sourcePath - Absolute canonical source path.
 * @property {string} relativePath - Slash-separated package-relative canonical source path.
 * @property {readonly ICatalogueCollectionMemberReference[]} memberReferences - Imported members retained by a collection source.
 */

export {};
