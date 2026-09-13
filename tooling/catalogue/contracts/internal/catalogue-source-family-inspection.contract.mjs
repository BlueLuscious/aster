/**
 * @import { ICatalogueSourceFamily } from "./catalogue-source-family.contract.mjs"
 * @import { ICatalogueSourceModule } from "./catalogue-source-module.contract.mjs"
 */

/**
 * @description Complete validated discovery result for one catalogue source family.
 * @typedef {object} ICatalogueSourceFamilyInspection
 * @property {ICatalogueSourceFamily} family - Inspected source-family configuration.
 * @property {readonly ICatalogueSourceModule[]} modules - Canonically ordered source modules.
 */

export {};
