/**
 * @description Expected executed-CLI package-version lookup failure without native path details.
 */
export class CliPackageVersionError extends Error {
  /**
   * @description Creates one source-specific failure for shell diagnostics.
   * @param message - Safe explanation of unavailable CLI package metadata.
   */
  constructor(message: string) {
    super(message);
    this.name = "CliPackageVersionError";
  }
}
