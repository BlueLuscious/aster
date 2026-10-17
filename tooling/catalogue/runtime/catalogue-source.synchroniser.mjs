import { CatalogueSourceError } from "./catalogue-source.error.mjs";

/**
 * @description Plans, verifies and publishes deterministic generated catalogue sources.
 */
export class CatalogueSourceSynchroniser {
  /**
   * @description Generated source persistence capability.
   * @type {import("../contracts/internal/catalogue-source-file-system.contract.mjs").ICatalogueSourceFileSystem}
   */
  #fileSystem;

  /**
   * @description Canonical source-module inspector.
   * @type {import("./catalogue-source-module.inspector.mjs").CatalogueSourceModuleInspector}
   */
  #modules;

  /**
   * @description Generated public facade planning authority.
   * @type {import("./catalogue-source-facade.planner.mjs").CatalogueSourceFacadePlanner}
   */
  #facades;

  /**
   * @description Metadata-only distribution manifest planning authority.
   * @type {import("./catalogue-source-manifest.planner.mjs").CatalogueSourceManifestPlanner}
   */
  #manifest;

  /**
   * @description Exact asynchronous definition-loader planning authority.
   * @type {import("./catalogue-source-dynamic.planner.mjs").CatalogueSourceDynamicPlanner}
   */
  #dynamic;

  /** @description Derived package export planning authority. @type {import("./catalogue-source-exports.planner.mjs").CatalogueSourceExportsPlanner} */
  #exports;

  /**
   * @description Repository path composition capability.
   * @type {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver}
   */
  #paths;

  /**
   * @description Cross-family source relationship inspector.
   * @type {import("./catalogue-source-relationship.inspector.mjs").CatalogueSourceRelationshipInspector}
   */
  #relationships;

  /**
   * @description Deterministic recursive file traversal capability.
   * @type {import("../../shared/runtime/repository-file.walker.mjs").RepositoryFileWalker}
   */
  #files;

  /** @description Package-relative exclusively owned generated facade root. */
  #facadeRoot;

  /**
   * @description Ordered immutable catalogue source-family configurations.
   * @type {readonly import("../contracts/internal/catalogue-source-family.contract.mjs").ICatalogueSourceFamily[]}
   */
  #families;

  /**
   * @description Creates one deterministic catalogue source synchroniser.
   * @param {import("../contracts/internal/catalogue-source-file-system.contract.mjs").ICatalogueSourceFileSystem} fileSystem - Generated source persistence capability.
   * @param {import("./catalogue-source-module.inspector.mjs").CatalogueSourceModuleInspector} modules - Canonical source-module inspector.
   * @param {import("./catalogue-source-facade.planner.mjs").CatalogueSourceFacadePlanner} facades - Generated public facade planner.
   * @param {import("./catalogue-source-manifest.planner.mjs").CatalogueSourceManifestPlanner} manifest - Metadata-only distribution manifest planner.
   * @param {import("./catalogue-source-dynamic.planner.mjs").CatalogueSourceDynamicPlanner} dynamic - Exact asynchronous definition-loader planner.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   * @param {import("./catalogue-source-relationship.inspector.mjs").CatalogueSourceRelationshipInspector} relationships - Cross-family relationship inspector.
   * @param {import("../../shared/runtime/repository-file.walker.mjs").RepositoryFileWalker} files - Deterministic recursive file traversal capability.
   * @param {readonly import("../contracts/internal/catalogue-source-family.contract.mjs").ICatalogueSourceFamily[]} families - Ordered catalogue source-family configurations.
   * @param {string} facadeRoot - Package-relative exclusively owned generated facade root.
   * @param {import("./catalogue-source-exports.planner.mjs").CatalogueSourceExportsPlanner} exports - Derived package export planner.
   */
  constructor(
    fileSystem,
    modules,
    facades,
    manifest,
    dynamic,
    paths,
    relationships,
    files,
    families,
    facadeRoot,
    exports,
  ) {
    this.#fileSystem = fileSystem;
    this.#modules = modules;
    this.#facades = facades;
    this.#manifest = manifest;
    this.#dynamic = dynamic;
    this.#paths = paths;
    this.#relationships = relationships;
    this.#files = files;
    this.#families = Object.freeze(
      families.map((family) =>
        Object.freeze({
          kind: family.kind,
          sourceDirectory: family.sourceDirectory,
          sourceSuffix: family.sourceSuffix,
          definitionFactory: family.definitionFactory,
          definitionModule: family.definitionModule,
          excludedDirectories: Object.freeze([...family.excludedDirectories]),
          facadeDirectory: family.facadeDirectory,
        }),
      ),
    );
    this.#facadeRoot = facadeRoot;
    this.#exports = exports;
  }

  /**
   * @description Computes every generated output and either verifies or writes its exact content.
   * @param {string} packageRoot - Absolute Icons package root.
   * @param {boolean} checkOnly - Whether drift must be reported without writing.
   * @returns {Promise<{ changedPaths: readonly string[], outputCount: number }>} Immutable synchronisation result.
   */
  async synchronise(packageRoot, checkOnly) {
    const plan = await this.#plan(packageRoot);
    this.#validateOwnership(packageRoot, plan);
    const { outputs, directories } = plan;
    const outputChanges = await this.#changedOutputs(outputs);
    const directoryChanges = [];

    for (const directory of directories) {
      directoryChanges.push(await this.#changedDirectory(packageRoot, directory));
    }

    const edit = plan.packageEdit;
    const changedPaths = [...outputChanges, ...directoryChanges.flat(), ...(edit ? [edit.output.relativePath] : [])];

    if (edit && await this.#fileSystem.readText(edit.output.path) !== edit.expectedContent) {
      throw new CatalogueSourceError("The package manifest changed during generation; retry without overwriting it.");
    }

    if (!checkOnly) {
      const outputChangeSet = new Set(outputChanges);

      for (const output of outputs) {
        if (outputChangeSet.has(output.relativePath)) {
          await this.#fileSystem.writeText(output.path, output.content);
        }
      }

      for (const [index, directory] of directories.entries()) {
        if (directoryChanges[index]?.length) {
          await this.#fileSystem.replaceDirectory(
            directory.root,
            directory.outputs.map((output) =>
              Object.freeze({
                relativePath: this.#paths.display(directory.root, output.path),
                content: output.content,
              }),
            ),
          );
        }
      }
      if (edit) {
        await this.#fileSystem.replaceText(edit.output.path, edit.expectedContent, edit.output.content);
      }
    }

    return Object.freeze({
      changedPaths: Object.freeze(changedPaths),
      outputCount: outputs.length + directories.reduce(
        (count, directory) => count + directory.outputs.length,
        0,
      ),
    });
  }

  /**
   * @description Plans complete generated outputs only after every source family is valid.
   * @param {string} packageRoot - Absolute Icons package root.
   * @returns {Promise<import("../contracts/internal/catalogue-source-plan.contract.mjs").ICatalogueSourcePlan>} Complete generated output plan.
   */
  async #plan(packageRoot) {
    const outputs = [];
    const inspections = [];

    this.#modules.reset();

    for (const family of this.#families) {
      const modules = await this.#modules.inspect(packageRoot, family);
      inspections.push(Object.freeze({ family, modules }));
    }

    this.#relationships.validate(inspections);

    outputs.push(this.#manifest.plan(packageRoot, inspections));
    outputs.push(this.#dynamic.plan(packageRoot, inspections));

    return Object.freeze({
      outputs: Object.freeze(outputs),
      directories: Object.freeze([
        Object.freeze({
          root: this.#paths.resolve(packageRoot, this.#facadeRoot),
          outputs: this.#facades.plan(packageRoot, inspections),
        }),
      ]),
      packageEdit: await this.#exports.plan(packageRoot, inspections),
    });
  }

  /**
   * @description Validates disjoint publication boundaries and complete output paths before disk comparison or writes.
   * @remarks Case-only collisions are rejected for consistent Windows and Unix ownership. These are lexical boundaries, not symlink resolution.
   * @param {string} packageRoot - Absolute owning package root.
   * @param {import("../contracts/internal/catalogue-source-plan.contract.mjs").ICatalogueSourcePlan} plan - Complete generated publication plan.
   * @returns {void} Completion after every ownership boundary and output is valid.
   */
  #validateOwnership(packageRoot, plan) {
    const boundaries = [
      ...plan.outputs.map((output) => output.path),
      ...plan.directories.map((directory) => directory.root),
      ...(plan.packageEdit ? [plan.packageEdit.output.path] : []),
    ];
    const sourceRoots = this.#families.map((family) =>
      this.#paths.resolve(packageRoot, family.sourceDirectory),
    );

    for (const [index, boundary] of boundaries.entries()) {
      if (
        !this.#paths.contains(packageRoot, boundary)
        || this.#paths.relative(packageRoot, boundary) === ""
      ) {
        throw new CatalogueSourceError(`Generated ownership escapes its package: ${boundary}`);
      }

      if (sourceRoots.some((source) => this.#overlaps(boundary, source))) {
        throw new CatalogueSourceError(`Generated ownership overlaps canonical sources: ${boundary}`);
      }

      if (boundaries.slice(0, index).some((other) => this.#overlaps(boundary, other))) {
        throw new CatalogueSourceError(`Overlapping generated publication ownership: ${boundary}`);
      }
    }

    this.#validateOutputs(packageRoot, packageRoot, plan.outputs);
    if (plan.packageEdit) {
      this.#validateOutputs(packageRoot, packageRoot, [plan.packageEdit.output]);
    }

    for (const directory of plan.directories) {
      this.#validateOutputs(packageRoot, directory.root, directory.outputs);
    }
  }

  /**
   * @description Determines whether two portable publication boundaries overlap, including case-only differences.
   * @param {string} left - First absolute path.
   * @param {string} right - Second absolute path.
   * @returns {boolean} Whether either boundary includes the other.
   */
  #overlaps(left, right) {
    return this.#paths.contains(left.toLowerCase(), right.toLowerCase())
      || this.#paths.contains(right.toLowerCase(), left.toLowerCase());
  }

  /**
   * @description Validates canonical contained file paths and rejects duplicate or file/directory-conflicting outputs.
   * @param {string} packageRoot - Absolute owning package root.
   * @param {string} root - Absolute owning file-set boundary.
   * @param {readonly import("../contracts/internal/catalogue-source-output.contract.mjs").ICatalogueSourceOutput[]} outputs - Complete expected files beneath that boundary.
   * @returns {void} Completion after every output path is valid.
   */
  #validateOutputs(packageRoot, root, outputs) {
    const expectedPaths = new Set();

    for (const output of outputs) {
      if (
        output.path !== this.#paths.resolve(output.path)
        || !this.#paths.contains(root, output.path)
        || this.#paths.relative(root, output.path) === ""
        || output.relativePath !== this.#paths.display(packageRoot, output.path)
      ) {
        throw new CatalogueSourceError(`Invalid generated output path: ${output.relativePath}`);
      }

      const key = output.path.toLowerCase();
      if (expectedPaths.has(key)) {
        throw new CatalogueSourceError(`Duplicate generated output path: ${output.relativePath}`);
      }
      expectedPaths.add(key);
    }

    for (const output of outputs) {
      let parent = this.#paths.dirname(output.path);
      while (this.#paths.relative(root, parent) !== "") {
        if (expectedPaths.has(parent.toLowerCase())) {
          throw new CatalogueSourceError(`Overlapping generated output paths: ${output.relativePath}`);
        }
        parent = this.#paths.dirname(parent);
      }
    }
  }

  /**
   * @description Compares expected file contents in plan order for either publication lifecycle.
   * @param {readonly import("../contracts/internal/catalogue-source-output.contract.mjs").ICatalogueSourceOutput[]} outputs - Expected generated outputs.
   * @returns {Promise<readonly string[]>} Package-relative changed output paths.
   */
  async #changedOutputs(outputs) {
    const changedPaths = [];

    for (const output of outputs) {
      const current = await this.#fileSystem.readTextIfPresent(output.path);

      if (current !== output.content) {
        changedPaths.push(output.relativePath);
      }
    }

    return Object.freeze(changedPaths);
  }

  /**
   * @description Finds absent, stale or obsolete files beneath one exclusively owned directory.
   * @param {string} packageRoot - Absolute Icons package root.
   * @param {import("../contracts/internal/catalogue-source-directory.contract.mjs").ICatalogueSourceDirectory} directory - Complete owned directory publication.
   * @returns {Promise<readonly string[]>} Package-relative changed paths, followed by obsolete paths in traversal order.
   */
  async #changedDirectory(packageRoot, directory) {
    const changedPaths = [...await this.#changedOutputs(directory.outputs)];
    const expectedPaths = new Set(directory.outputs.map((output) => output.path));
    const existingPaths = await this.#files.collect(directory.root, () => true);

    for (const path of existingPaths) {
      if (!expectedPaths.has(path)) {
        changedPaths.push(this.#paths.display(packageRoot, path));
      }
    }

    return Object.freeze(changedPaths);
  }
}
