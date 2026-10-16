/**
 * @import { ICatalogueSourceOutput } from "./catalogue-source-output.contract.mjs"
 * @import { ICatalogueSourceDirectory } from "./catalogue-source-directory.contract.mjs"
 */

/**
 * @description Complete validated catalogue generation plan split by publication lifecycle.
 * @typedef {object} ICatalogueSourcePlan
 * @property {readonly ICatalogueSourceOutput[]} outputs - Fixed-path generated outputs replaced independently.
 * @property {readonly ICatalogueSourceDirectory[]} directories - Ordered exclusively owned directories published independently through staging and rollback.
 */

export {};
