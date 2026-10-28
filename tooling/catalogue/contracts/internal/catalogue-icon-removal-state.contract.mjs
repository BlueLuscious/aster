/**
 * @description Exact source publication state retained by one explicit removal session.
 * @typedef {object} ICatalogueIconRemovalState
 * @property {string} path - Workspace-relative canonical target.
 * @property {string} before - Complete original UTF-8 text.
 * @property {string | undefined} after - Planned text, or absence for the selected definition.
 * @property {string} original - Independent recovery copy, relative to the evidence root.
 * @property {string} prepared - Exclusive publication stage, relative to the evidence root.
 * @property {string} displaced - Quarantined actual preimage, relative to the evidence root.
 * @property {boolean} moved - Whether the original target was displaced.
 * @property {boolean} published - Whether the planned replacement was linked into place.
 * @property {boolean} restored - Whether guarded restoration completed.
 */
export {};
