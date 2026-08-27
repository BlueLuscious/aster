/**
 * @description Validates closed numeric controls shared by benchmark runners.
 */
export class BenchmarkConfigurationValidator {
  /**
   * @description Rejects values that cannot represent a finite positive operation count.
   * @param {number} value - Candidate configuration value.
   * @param {string} path - Logical configuration path.
   * @returns {void} Nothing.
   */
  positiveInteger(value, path) {
    if (!Number.isSafeInteger(value) || value <= 0) {
      throw new TypeError(`${path} must be a positive safe integer.`);
    }
  }
}
