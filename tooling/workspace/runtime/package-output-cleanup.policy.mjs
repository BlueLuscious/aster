import { packageOutputCleanup } from "../constants/package-output-cleanup.constant.mjs";

/**
 * @description Resolves and validates the only generated package output accepted for deletion.
 */
export class PackageOutputCleanupPolicy {
  /**
   * @description Repository path composition and containment capability.
   * @type {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver}
   */
  #paths;

  /**
   * @description Creates a guarded package output cleanup policy.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   */
  constructor(paths) {
    this.#paths = paths;
  }

  /**
   * @description Resolves one requested output and rejects every non-direct `dist` boundary.
   * @param {string} packageRoot - Resolved package root.
   * @param {string} outputDirectory - Requested output directory.
   * @returns {string} Resolved accepted output path.
   */
  resolve(packageRoot, outputDirectory) {
    const output = this.#paths.resolve(packageRoot, outputDirectory);
    const relation = this.#paths.relative(packageRoot, output);

    if (
      outputDirectory !== packageOutputCleanup.outputDirectory ||
      relation !== packageOutputCleanup.outputDirectory ||
      !this.#paths.contains(packageRoot, output)
    ) {
      throw new Error("Refusing to clean anything except the direct package dist directory");
    }

    return output;
  }
}
