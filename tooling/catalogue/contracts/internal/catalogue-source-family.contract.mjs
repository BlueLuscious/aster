/**
 * @description Configuration for one canonical catalogue source family and its public facades.
 * @typedef {object} ICatalogueSourceFamily
 * @property {"icon" | "collection"} kind - Semantic source-family discriminator.
 * @property {string} sourceDirectory - Package-relative root containing canonical modules.
 * @property {string} sourceSuffix - Exact canonical module filename suffix.
 * @property {string} symbolSuffix - Symbol suffix appended to the PascalCase source slug.
 * @property {string} definitionFactory - Public Core factory expected at the canonical export.
 * @property {string} definitionModule - Public package module owning the definition factory.
 * @property {readonly string[]} excludedDirectories - Reserved source-root directories excluded from discovery.
 * @property {string} facadeDirectory - Package-relative generated public facade directory.
 */

export {};
