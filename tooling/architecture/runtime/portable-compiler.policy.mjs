import { compilerBaseline } from "../constants/compiler-baseline.constant.mjs";
import { repositoryArchitecturePaths } from "../constants/repository-architecture-paths.constant.mjs";

/**
 * @description Enforces host-independent compiler overrides for portable production packages.
 */
export class PortableCompilerPolicy {
  /**
   * @description Repository filesystem inspection capability.
   * @type {import("../../shared/contracts/internal/repository-file-system.contract.mjs").IRepositoryFileSystem}
   */
  #fileSystem;

  /**
   * @description Strict repository JSON acquisition capability.
   * @type {import("../../shared/runtime/repository-json.reader.mjs").RepositoryJsonReader}
   */
  #json;

  /**
   * @description Repository path composition capability.
   * @type {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver}
   */
  #paths;

  /**
   * @description Creates a portable compiler policy from repository acquisition capabilities.
   * @param {import("../../shared/contracts/internal/repository-file-system.contract.mjs").IRepositoryFileSystem} fileSystem - Filesystem inspection capability.
   * @param {import("../../shared/runtime/repository-json.reader.mjs").RepositoryJsonReader} json - Strict JSON reader.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   */
  constructor(fileSystem, json, paths) {
    this.#fileSystem = fileSystem;
    this.#json = json;
    this.#paths = paths;
  }

  /**
   * @description Inspects optional package compiler overrides.
   * @param {string} packageRoot - Absolute package root.
   * @param {string} packageName - Package identity used in findings.
   * @param {import("./architecture-issue.collector.mjs").ArchitectureIssueCollector} issues - Ordered issue collector.
   * @returns {Promise<void>} Completion after package compiler settings are inspected.
   */
  async inspect(packageRoot, packageName, issues) {
    const configurationPath = this.#paths.resolve(
      packageRoot,
      repositoryArchitecturePaths.packageConfiguration,
    );

    if (!(await this.#fileSystem.exists(configurationPath))) {
      return;
    }

    const configuration = await this.#json.read(configurationPath);
    const options = /** @type {Record<string, unknown>} */ (
      configuration.compilerOptions ?? {}
    );

    if (
      Array.isArray(options.lib) &&
      options.lib.some((entry) => entry !== compilerBaseline.target)
    ) {
      issues.add(`${packageName} cannot add host libraries to compilerOptions.lib`);
    }

    if (Array.isArray(options.types) && options.types.length > 0) {
      issues.add(`${packageName} cannot add ambient compilerOptions.types`);
    }
  }
}
