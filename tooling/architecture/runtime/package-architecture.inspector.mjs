import { packageBoundaries } from "../constants/package-boundaries.constant.mjs";
import { repositoryArchitecturePaths } from "../constants/repository-architecture-paths.constant.mjs";

/**
 * @description Acquires workspace packages and coordinates package, module, and dependency policy.
 */
export class PackageArchitectureInspector {
  /**
   * @description Repository filesystem inspection capability.
   * @type {import("../../shared/contracts/internal/repository-file-system.contract.mjs").IRepositoryFileSystem}
   */
  #fileSystem;

  /**
   * @description Strict package manifest acquisition capability.
   * @type {import("../../shared/runtime/repository-json.reader.mjs").RepositoryJsonReader}
   */
  #json;

  /**
   * @description Optional workspace package directory reader.
   * @type {import("../../shared/runtime/repository-directory.reader.mjs").RepositoryDirectoryReader}
   */
  #directories;

  /**
   * @description Production dependency field reader.
   * @type {import("./runtime-dependency.reader.mjs").RuntimeDependencyReader}
   */
  #dependencies;

  /**
   * @description Package source-module boundary inspector.
   * @type {import("./package-module.inspector.mjs").PackageModuleInspector}
   */
  #modules;

  /**
   * @description Recognised package policies keyed by package identity.
   * @type {ReadonlyMap<string, import("../contracts/internal/package-architecture-policy.contract.mjs").IPackageArchitecturePolicy>}
   */
  #policies;

  /**
   * @description Repository path composition capability.
   * @type {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver}
   */
  #paths;

  /**
   * @description Factory supplying one independent dependency graph per inspection.
   * @type {() => import("./workspace-dependency.graph.mjs").WorkspaceDependencyGraph}
   */
  #graphFactory;

  /**
   * @description Creates a workspace package architecture inspector.
   * @param {import("../../shared/contracts/internal/repository-file-system.contract.mjs").IRepositoryFileSystem} fileSystem - Filesystem inspection capability.
   * @param {import("../../shared/runtime/repository-json.reader.mjs").RepositoryJsonReader} json - Strict JSON reader.
   * @param {import("../../shared/runtime/repository-directory.reader.mjs").RepositoryDirectoryReader} directories - Package directory reader.
   * @param {import("./runtime-dependency.reader.mjs").RuntimeDependencyReader} dependencies - Runtime dependency reader.
   * @param {import("./package-module.inspector.mjs").PackageModuleInspector} modules - Package source-module inspector.
   * @param {ReadonlyMap<string, import("../contracts/internal/package-architecture-policy.contract.mjs").IPackageArchitecturePolicy>} policies - Recognised package policies by identity.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   * @param {() => import("./workspace-dependency.graph.mjs").WorkspaceDependencyGraph} graphFactory - Fresh dependency graph factory.
   */
  constructor(
    fileSystem,
    json,
    directories,
    dependencies,
    modules,
    policies,
    paths,
    graphFactory,
  ) {
    this.#fileSystem = fileSystem;
    this.#json = json;
    this.#directories = directories;
    this.#dependencies = dependencies;
    this.#modules = modules;
    this.#policies = policies;
    this.#paths = paths;
    this.#graphFactory = graphFactory;
  }

  /**
   * @description Inspects manifests, dependencies, package policies, modules, and graph cycles.
   * @param {string} workspaceRoot - Absolute repository root.
   * @param {import("./architecture-issue.collector.mjs").ArchitectureIssueCollector} issues - Ordered issue collector.
   * @returns {Promise<void>} Completion after every workspace package is inspected.
   */
  async inspect(workspaceRoot, issues) {
    const packagesRoot = this.#paths.resolve(
      workspaceRoot,
      repositoryArchitecturePaths.packages,
    );
    const records = await this.#records(packagesRoot, issues);
    const names = new Set(records.map((record) => record.name));
    const graph = this.#graphFactory();

    for (const record of records) {
      const dependencies = this.#dependencies.read(record.manifest);
      const workspaceDependencies = new Set();

      for (const [name, specifier] of Object.entries(dependencies)) {
        if (!names.has(name)) {
          continue;
        }

        workspaceDependencies.add(name);

        if (
          typeof specifier !== "string" ||
          !specifier.startsWith(packageBoundaries.workspaceProtocolPrefix)
        ) {
          issues.add(`${record.name} must use the workspace protocol for ${name}`);
        }
      }

      graph.add(record.name, workspaceDependencies);

      const policy = this.#policies.get(record.name);

      if (policy !== undefined) {
        await policy.inspect(record, dependencies, workspaceDependencies, issues);
      }

      await this.#modules.inspect(
        workspaceRoot,
        packagesRoot,
        record,
        names,
        workspaceDependencies,
        issues,
      );
    }

    graph.inspectCycles(issues);
  }

  /**
   * @description Acquires valid uniquely named workspace package records.
   * @param {string} packagesRoot - Absolute workspace packages root.
   * @param {import("./architecture-issue.collector.mjs").ArchitectureIssueCollector} issues - Ordered issue collector.
   * @returns {Promise<readonly import("../types/internal/workspace-package-record.type.mjs").TWorkspacePackageRecord[]>} Acquired package records.
   */
  async #records(packagesRoot, issues) {
    const records = [];
    const names = new Set();

    for (const directory of await this.#directories.read(packagesRoot)) {
      const packageRoot = this.#paths.resolve(packagesRoot, directory);
      const manifestPath = this.#paths.resolve(
        packageRoot,
        repositoryArchitecturePaths.packageManifest,
      );

      if (!(await this.#fileSystem.exists(manifestPath))) {
        issues.add(`packages/${directory} must contain package.json`);
        continue;
      }

      const manifest = await this.#json.read(manifestPath);

      if (typeof manifest.name !== "string" || manifest.name.length === 0) {
        issues.add(`packages/${directory}/package.json must declare a package name`);
        continue;
      }

      if (names.has(manifest.name)) {
        issues.add(`Duplicate workspace package name: ${manifest.name}`);
        continue;
      }

      if (manifest.type !== "module") {
        issues.add(`${manifest.name} must declare ESM through package.json#type`);
      }

      names.add(manifest.name);
      records.push(Object.freeze({ directory, name: manifest.name, manifest, packageRoot }));
    }

    return Object.freeze(records);
  }
}
