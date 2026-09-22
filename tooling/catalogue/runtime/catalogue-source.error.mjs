/**
 * @description Stable repository-tooling failure raised for invalid canonical catalogue sources.
 */
export class CatalogueSourceError extends Error {
  /**
   * @description Creates one actionable catalogue source failure.
   * @param {string} message - Stable explanation of the violated source convention.
   */
  constructor(message) {
    super(message);
    this.name = "CatalogueSourceError";
  }
}
