/**
 * @description Immutable, read-only proposal for removing one concrete canonical icon.
 * @typedef {object} ICatalogueIconRemovalPlan
 * @property {string} identity - Exact canonical selector.
 * @property {string} fingerprint - SHA-256 of the complete deterministic proposal and acquired inputs.
 * @property {string} removalPath - Workspace-relative selected canonical file.
 * @property {readonly import("./catalogue-icon-removal-input.contract.mjs").ICatalogueIconRemovalInput[]} inputs - Exact acquired file preimages.
 * @property {readonly { path: string, entries: readonly string[] }[]} inventories - Directory entry/kind snapshots.
 * @property {readonly string[]} absentPaths - Acquired absent paths that must remain absent.
 * @property {readonly import("./catalogue-icon-removal-edit.contract.mjs").ICatalogueIconRemovalEdit[]} edits - Exact collection changes.
 * @property {readonly string[]} generatedPaths - Workspace-relative source/export projections changed by the hypothetical removal.
 * @property {readonly { path: string, content: string | undefined }[]} outputs - Exact proposed generated/mixed-file postimages; undefined means an obsolete output disappears.
 * @property {readonly import("./catalogue-icon-removal-reference.contract.mjs").ICatalogueIconRemovalReference[]} references - Literal review notices, not proof of complete dependency detection.
 * @property {string} buildCommand - Existing build responsible for generated and emitted outputs after application.
 * @property {string} buildRoot - Owned workspace-relative emitted output boundary.
 */
export {};
