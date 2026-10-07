/**
 * @description Expected project-version lookup failure without filesystem path details.
 */
export class ProjectPackageVersionError extends Error {
  /**
   * @description Creates one source-specific lookup failure for shell diagnostics.
   * @param message - Safe explanation of the unavailable project version evidence.
   */
  constructor(message: string) {
    super(message);
    this.name = "ProjectPackageVersionError";
  }
}
