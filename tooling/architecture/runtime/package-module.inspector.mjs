import { packageBoundaries } from "../constants/package-boundaries.constant.mjs";
import { repositoryArchitecturePaths } from "../constants/repository-architecture-paths.constant.mjs";
import { sourceModule } from "../constants/source-module.constant.mjs";

/**
 * @description Inspects package source imports against repository module boundaries.
 */
export class PackageModuleInspector {
  /**
   * @description Repository source acquisition capability.
   * @type {import("../../shared/contracts/internal/repository-file-system.contract.mjs").IRepositoryFileSystem}
   */
  #fileSystem;

  /**
   * @description Static module specifier extraction authority.
   * @type {import("./module-specifier.extractor.mjs").ModuleSpecifierExtractor}
   */
  #moduleSpecifiers;

  /**
   * @description Repository path composition and containment capability.
   * @type {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver}
   */
  #paths;

  /**
   * @description Deterministic repository source walker.
   * @type {import("../../shared/runtime/repository-file.walker.mjs").RepositoryFileWalker}
   */
  #files;

  /**
   * @description Creates a package source-module inspector.
   * @param {import("../../shared/contracts/internal/repository-file-system.contract.mjs").IRepositoryFileSystem} fileSystem - Repository text acquisition capability.
   * @param {import("../../shared/runtime/repository-file.walker.mjs").RepositoryFileWalker} files - Deterministic source walker.
   * @param {import("./module-specifier.extractor.mjs").ModuleSpecifierExtractor} moduleSpecifiers - Static module specifier extractor.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   */
  constructor(fileSystem, files, moduleSpecifiers, paths) {
    this.#fileSystem = fileSystem;
    this.#files = files;
    this.#moduleSpecifiers = moduleSpecifiers;
    this.#paths = paths;
  }

  /**
   * @description Inspects all recognised source imports for one workspace package.
   * @param {string} workspaceRoot - Absolute repository root.
   * @param {string} packagesRoot - Absolute workspace packages root.
   * @param {import("../types/internal/workspace-package-record.type.mjs").TWorkspacePackageRecord} record - Acquired package record.
   * @param {ReadonlySet<string>} packageNames - All recognised workspace package identities.
   * @param {ReadonlySet<string>} workspaceDependencies - Declared direct workspace dependencies.
   * @param {import("./architecture-issue.collector.mjs").ArchitectureIssueCollector} issues - Ordered issue collector.
   * @returns {Promise<void>} Completion after all package modules are inspected.
   */
  async inspect(
    workspaceRoot,
    packagesRoot,
    record,
    packageNames,
    workspaceDependencies,
    issues,
  ) {
    const modules = await this.#files.collect(
      this.#paths.resolve(record.packageRoot, repositoryArchitecturePaths.source),
      (path) => sourceModule.extensionPattern.test(path),
    );

    for (const modulePath of modules) {
      const source = await this.#fileSystem.readText(modulePath);

      for (const specifier of this.#moduleSpecifiers.extract(source)) {
        if (specifier.startsWith(".")) {
          this.#inspectRelativeSpecifier(
            workspaceRoot,
            packagesRoot,
            record,
            modulePath,
            specifier,
            issues,
          );
          continue;
        }

        this.#inspectPackageSpecifier(
          workspaceRoot,
          record,
          modulePath,
          specifier,
          packageNames,
          workspaceDependencies,
          issues,
        );
      }
    }
  }

  /**
   * @description Inspects one relative module specifier against package-local boundaries.
   * @param {string} workspaceRoot - Absolute repository root.
   * @param {string} packagesRoot - Absolute packages root.
   * @param {import("../types/internal/workspace-package-record.type.mjs").TWorkspacePackageRecord} record - Acquired package record.
   * @param {string} modulePath - Importing module path.
   * @param {string} specifier - Relative module specifier.
   * @param {import("./architecture-issue.collector.mjs").ArchitectureIssueCollector} issues - Ordered issue collector.
   * @returns {void} Completion after all relative boundaries are inspected.
   */
  #inspectRelativeSpecifier(
    workspaceRoot,
    packagesRoot,
    record,
    modulePath,
    specifier,
    issues,
  ) {
    const target = this.#paths.resolve(this.#paths.dirname(modulePath), specifier);

    if (
      this.#paths.contains(packagesRoot, target) &&
      !this.#paths.contains(record.packageRoot, target)
    ) {
      issues.add(
        `${this.#paths.relative(workspaceRoot, modulePath)} imports another package through a relative path`,
      );
    }

    if (
      this.#paths.contains(
        this.#paths.resolve(workspaceRoot, repositoryArchitecturePaths.tooling),
        target,
      )
    ) {
      issues.add(
        `${this.#paths.relative(workspaceRoot, modulePath)} imports repository tooling into ${record.name}`,
      );
    }

    if (
      record.name === packageBoundaries.names.build &&
      this.#paths.resolve(modulePath) ===
        this.#paths.resolve(record.packageRoot, repositoryArchitecturePaths.packageEntry)
    ) {
      this.#inspectBuildRootExport(record.packageRoot, target, issues);
    }

    if (
      record.name === packageBoundaries.names.build &&
      this.#paths.contains(
        this.#paths.resolve(record.packageRoot, repositoryArchitecturePaths.buildNormalisation),
        modulePath,
      ) &&
      this.#paths.contains(
        this.#paths.resolve(
          record.packageRoot,
          repositoryArchitecturePaths.buildValidationRuntime,
        ),
        target,
      )
    ) {
      issues.add(
        `${this.#paths.relative(workspaceRoot, modulePath)} cannot import Validation runtime implementations`,
      );
    }

    if (record.name === packageBoundaries.names.cli) {
      this.#inspectCliShellBoundary(
        workspaceRoot,
        record.packageRoot,
        modulePath,
        target,
        issues,
      );
    }
  }

  /**
   * @description Enforces directional imports between private CLI shell subfeatures.
   * @param {string} workspaceRoot - Absolute repository root.
   * @param {string} packageRoot - Absolute CLI package root.
   * @param {string} modulePath - Importing source module.
   * @param {string} target - Resolved package-local import target.
   * @param {import("./architecture-issue.collector.mjs").ArchitectureIssueCollector} issues - Ordered issue collector.
   * @returns {void} Completion after private shell boundaries are inspected.
   */
  #inspectCliShellBoundary(
    workspaceRoot,
    packageRoot,
    modulePath,
    target,
    issues,
  ) {
    const parsing = this.#paths.resolve(
      packageRoot,
      repositoryArchitecturePaths.cliShellParsing,
    );
    const presentation = this.#paths.resolve(
      packageRoot,
      repositoryArchitecturePaths.cliShellPresentation,
    );
    const output = this.#paths.resolve(
      packageRoot,
      repositoryArchitecturePaths.cliShellOutput,
    );
    const outputRuntime = this.#paths.resolve(
      packageRoot,
      repositoryArchitecturePaths.cliShellOutputRuntime,
    );
    const source = this.#paths.relative(workspaceRoot, modulePath);

    if (
      this.#paths.contains(parsing, modulePath)
      && (
        this.#paths.contains(presentation, target)
        || this.#paths.contains(output, target)
      )
    ) {
      issues.add(`${source} cannot import presentation or output from CLI parsing`);
    }

    if (
      this.#paths.contains(output, modulePath)
      && (
        this.#paths.contains(parsing, target)
        || this.#paths.contains(presentation, target)
      )
    ) {
      issues.add(`${source} cannot import parsing or presentation from CLI output`);
    }

    if (
      this.#paths.contains(presentation, modulePath)
      && (
        this.#paths.contains(parsing, target)
        || this.#paths.contains(outputRuntime, target)
      )
    ) {
      issues.add(`${source} cannot import parsing or output runtime from CLI presentation`);
    }
  }

  /**
   * @description Inspects one external or workspace package specifier.
   * @param {string} workspaceRoot - Absolute repository root.
   * @param {import("../types/internal/workspace-package-record.type.mjs").TWorkspacePackageRecord} record - Acquired package record.
   * @param {string} modulePath - Importing module path.
   * @param {string} specifier - Package module specifier.
   * @param {ReadonlySet<string>} packageNames - All workspace package identities.
   * @param {ReadonlySet<string>} workspaceDependencies - Declared direct workspace dependencies.
   * @param {import("./architecture-issue.collector.mjs").ArchitectureIssueCollector} issues - Ordered issue collector.
   * @returns {void} Completion after package module boundaries are inspected.
   */
  #inspectPackageSpecifier(
    workspaceRoot,
    record,
    modulePath,
    specifier,
    packageNames,
    workspaceDependencies,
    issues,
  ) {
    if (
      record.name === packageBoundaries.names.build &&
      specifier.startsWith(sourceModule.nodeProtocolPrefix)
    ) {
      issues.add(
        `${this.#paths.relative(workspaceRoot, modulePath)} imports a Node adapter into @aster/build`,
      );
    }

    if (
      record.name === packageBoundaries.names.cli &&
      specifier.startsWith(sourceModule.nodeProtocolPrefix) &&
      !this.#paths.contains(
        this.#paths.resolve(record.packageRoot, repositoryArchitecturePaths.cliShell),
        modulePath,
      )
    ) {
      issues.add(
        `${this.#paths.relative(workspaceRoot, modulePath)} imports Node authority outside the CLI shell`,
      );
    }

    if (specifier === packageBoundaries.parser.dependency) {
      const implementationPath = this.#paths.resolve(
        record.packageRoot,
        packageBoundaries.parser.implementation,
      );

      if (
        record.name !== packageBoundaries.names.build ||
        this.#paths.resolve(modulePath) !== implementationPath
      ) {
        issues.add(
          `${this.#paths.relative(workspaceRoot, modulePath)} imports the XML parser outside its accepted private adapter`,
        );
      }
    }

    const workspaceDependency = [...packageNames]
      .sort((left, right) => right.length - left.length)
      .find((name) => specifier === name || specifier.startsWith(`${name}/`));

    if (
      workspaceDependency !== undefined &&
      workspaceDependency !== record.name &&
      !workspaceDependencies.has(workspaceDependency)
    ) {
      issues.add(
        `${record.name} imports undeclared workspace dependency ${workspaceDependency}`,
      );
    }
  }

  /**
   * @description Inspects private Build features exposed from its package root.
   * @param {string} packageRoot - Absolute Build package root.
   * @param {string} target - Resolved relative export target.
   * @param {import("./architecture-issue.collector.mjs").ArchitectureIssueCollector} issues - Ordered issue collector.
   * @returns {void} Completion after all private feature roots are inspected.
   */
  #inspectBuildRootExport(packageRoot, target, issues) {
    for (const feature of packageBoundaries.buildPrivateFeatureRoots) {
      if (this.#paths.contains(this.#paths.resolve(packageRoot, feature.path), target)) {
        issues.add(feature.issue);
      }
    }
  }
}
