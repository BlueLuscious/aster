import { packageOutputCleanup } from "../constants/package-output-cleanup.constant.mjs";

/**
 * @description Inspects package identity through its direct manifest file.
 */
export class PackageRootInspector {
  /**
   * @description Package output filesystem capability.
   * @type {import("../contracts/internal/package-output-file-system.contract.mjs").IPackageOutputFileSystem}
   */
  #fileSystem;

  /**
   * @description Repository path composition capability.
   * @type {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver}
   */
  #paths;

  /**
   * @description Creates a package-root inspector.
   * @param {import("../contracts/internal/package-output-file-system.contract.mjs").IPackageOutputFileSystem} fileSystem - Package output filesystem capability.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   */
  constructor(fileSystem, paths) {
    this.#fileSystem = fileSystem;
    this.#paths = paths;
  }

  /**
   * @description Determines whether one resolved directory contains a direct package manifest.
   * @param {string} packageRoot - Resolved candidate package root.
   * @returns {Promise<boolean>} Whether the directory is an accepted package root.
   */
  async inspect(packageRoot) {
    return this.#fileSystem.isFile(
      this.#paths.resolve(packageRoot, packageOutputCleanup.manifest),
    );
  }
}
