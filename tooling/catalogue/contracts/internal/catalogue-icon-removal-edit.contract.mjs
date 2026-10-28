/**
 * @description One complete authored collection preimage and narrowly edited postimage.
 * @typedef {object} ICatalogueIconRemovalEdit
 * @property {string} path - Workspace-relative canonical collection path.
 * @property {string} before - Exact original UTF-8-decoded text, including any BOM.
 * @property {string} after - Text retaining all bytes outside the selected deletions.
 * @property {readonly import("./catalogue-icon-removal-change.contract.mjs").ICatalogueIconRemovalChange[]} changes - Ascending, non-overlapping deletions.
 * @property {readonly string[]} aliases - Affected collection aliases in source order.
 * @property {boolean} empty - Whether the collection has no remaining members.
 */
export {};
