/**
 * @import { ICatalogueSourceOutput } from "./catalogue-source-output.contract.mjs"
 * @import { ICatalogueSourceDirectory } from "./catalogue-source-directory.contract.mjs"
 * @import { ICatalogueSourcePackageEdit } from "./catalogue-source-package-edit.contract.mjs"
 */

/**
 * @description Complete validated catalogue generation plan split by publication lifecycle.
 * @typedef {object} ICatalogueSourcePlan
 * @property {readonly ICatalogueSourceOutput[]} outputs - Fixed-path generated outputs replaced independently.
 * @property {readonly ICatalogueSourceDirectory[]} directories - Ordered exclusively owned directories published independently through staging and rollback.
 * @property {ICatalogueSourcePackageEdit | undefined} packageEdit - Partial package-manifest edit, published after generated files without claiming the manual file as generated.
 */

export {};
