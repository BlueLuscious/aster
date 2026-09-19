/**
 * @import { ICatalogueSourceOutput } from "./catalogue-source-output.contract.mjs"
 */

/**
 * @description Complete validated catalogue generation plan split by publication lifecycle.
 * @typedef {object} ICatalogueSourcePlan
 * @property {readonly ICatalogueSourceOutput[]} outputs - Fixed-path generated outputs replaced independently.
 * @property {readonly ICatalogueSourceOutput[]} facades - Public facades published as one owned directory.
 */

export {};
