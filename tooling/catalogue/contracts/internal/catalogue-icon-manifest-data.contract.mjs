/**
 * @description Validated metadata-only icon data extracted from one canonical definition source.
 * @typedef {object} ICatalogueIconManifestData
 * @property {{ namespace?: string, name: string, variant?: string }} identity - Complete portable icon identity.
 * @property {string} displayName - Human-readable icon name.
 * @property {readonly string[] | undefined} tags - Optional intrinsic discovery terms.
 * @property {string} rtl - Authored right-to-left geometry policy.
 * @property {string | undefined} licence - Optional effective artwork licence.
 * @property {string | undefined} attribution - Optional effective artwork attribution.
 * @property {boolean} deprecated - Whether consumers should migrate from the identity.
 * @property {{ namespace?: string, name: string, variant?: string } | undefined} replacedBy - Optional complete replacement identity.
 */

export {};
