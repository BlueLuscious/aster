/**
 * @description Configuration for one canonical catalogue source family and its generated outputs.
 * @typedef {object} ICatalogueSourceFamily
 * @property {"icon" | "collection"} kind - Semantic source-family discriminator.
 * @property {string} sourceDirectory - Package-relative root containing canonical modules.
 * @property {string} sourceSuffix - Exact canonical module filename suffix.
 * @property {string} symbolSuffix - Symbol suffix appended to the PascalCase source slug.
 * @property {string} definitionFactory - Public Core factory expected at the canonical export.
 * @property {readonly string[]} excludedDirectories - Reserved source-root directories excluded from discovery.
 * @property {string} barrelPath - Package-relative generated barrel path.
 * @property {string} authorityPath - Package-relative generated aggregate authority path.
 * @property {string} authorityName - Exported aggregate authority symbol.
 * @property {string} definitionType - Public Core definition contract retained by the aggregate.
 * @property {string} authorityDescription - Stable generated authority description.
 * @property {string} authorityRemarks - Stable generated authority relationship context.
 */

export {};
