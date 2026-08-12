/**
 * @description Coordinates package identity, cleanup policy, and destructive filesystem execution.
 */
export class PackageOutputCleaner {
  /**
   * @description Package identity inspector guarding destructive execution.
   * @type {import("./package-root.inspector.mjs").PackageRootInspector}
   */
  #packages;

  /**
   * @description Output-boundary policy applied before destructive execution.
   * @type {import("./package-output-cleanup.policy.mjs").PackageOutputCleanupPolicy}
   */
  #policy;

  /**
   * @description Narrow filesystem capability permitted to remove accepted output.
   * @type {import("../contracts/internal/package-output-file-system.contract.mjs").IPackageOutputFileSystem}
   */
  #fileSystem;

  /**
   * @description Repository path capability used to resolve package roots.
   * @type {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver}
   */
  #paths;

  /**
   * @description Creates a guarded package output cleaner.
   * @param {import("./package-root.inspector.mjs").PackageRootInspector} packages - Package identity inspector.
   * @param {import("./package-output-cleanup.policy.mjs").PackageOutputCleanupPolicy} policy - Cleanup path policy.
   * @param {import("../contracts/internal/package-output-file-system.contract.mjs").IPackageOutputFileSystem} fileSystem - Destructive filesystem capability.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   */
  constructor(packages, policy, fileSystem, paths) {
    this.#packages = packages;
    this.#policy = policy;
    this.#fileSystem = fileSystem;
    this.#paths = paths;
  }

  /**
   * @description Removes one statically accepted generated package output.
   * @param {string} packageRoot - Absolute or relative package directory.
   * @param {string} outputDirectory - Requested generated directory name.
   * @returns {Promise<void>} Completion after the output is absent.
   */
  async clean(packageRoot, outputDirectory) {
    const resolvedPackageRoot = this.#paths.resolve(packageRoot);

    if (!(await this.#packages.inspect(resolvedPackageRoot))) {
      throw new Error(
        `Refusing to clean a directory without package.json: ${resolvedPackageRoot}`,
      );
    }

    await this.#fileSystem.removeTree(
      this.#policy.resolve(resolvedPackageRoot, outputDirectory),
    );
  }
}
