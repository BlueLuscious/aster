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
   * @description Deterministic TypeScript source serialiser.
   * @type {import("./catalogue-source.serialiser.mjs").CatalogueSourceSerialiser}
   */
  #serialiser;

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
   * @param {import("./catalogue-source.serialiser.mjs").CatalogueSourceSerialiser} serialiser - Generated source serialiser.
   * @param {import("./catalogue-source-facade.planner.mjs").CatalogueSourceFacadePlanner} facades - Generated public facade planner.
   * @param {import("./catalogue-source-manifest.planner.mjs").CatalogueSourceManifestPlanner} manifest - Metadata-only distribution manifest planner.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   * @param {import("./catalogue-source-relationship.inspector.mjs").CatalogueSourceRelationshipInspector} relationships - Cross-family relationship inspector.
   * @param {import("../../shared/runtime/repository-file.walker.mjs").RepositoryFileWalker} files - Deterministic recursive file traversal capability.
   * @param {readonly import("../contracts/internal/catalogue-source-family.contract.mjs").ICatalogueSourceFamily[]} families - Ordered catalogue source-family configurations.
   * @param {string} facadeRoot - Package-relative exclusively owned generated facade root.
   */
  constructor(
    fileSystem,
    modules,
    serialiser,
    facades,
    manifest,
    paths,
    relationships,
    files,
    families,
    facadeRoot,
  ) {
    this.#fileSystem = fileSystem;
    this.#modules = modules;
    this.#serialiser = serialiser;
    this.#facades = facades;
    this.#manifest = manifest;
    this.#paths = paths;
    this.#relationships = relationships;
    this.#files = files;
    this.#families = Object.freeze([...families]);
    this.#facadeRoot = facadeRoot;
  }

  /**
   * @description Computes every generated output and either verifies or writes its exact content.
   * @param {string} packageRoot - Absolute Icons package root.
   * @param {boolean} checkOnly - Whether drift must be reported without writing.
   * @returns {Promise<{ changedPaths: readonly string[], outputCount: number }>} Immutable synchronisation result.
   */
  async synchronise(packageRoot, checkOnly) {
    const { outputs, facades } = await this.#plan(packageRoot);
    const outputChanges = await this.#changedOutputs(outputs);
    const facadeChanges = await this.#changedFacades(packageRoot, facades);
    const changedPaths = [...outputChanges, ...facadeChanges];

    if (!checkOnly) {
      const outputChangeSet = new Set(outputChanges);

      for (const output of outputs) {
        if (outputChangeSet.has(output.relativePath)) {
          await this.#fileSystem.writeText(output.path, output.content);
        }
      }

      if (facadeChanges.length > 0) {
        const generatedRoot = this.#paths.resolve(
          packageRoot,
          this.#facadeRoot,
        );
        await this.#fileSystem.replaceDirectory(
          generatedRoot,
          facades.map((facade) =>
            Object.freeze({
              relativePath: this.#paths.display(generatedRoot, facade.path),
              content: facade.content,
            }),
          ),
        );
      }
    }

    return Object.freeze({
      changedPaths: Object.freeze(changedPaths),
      outputCount: outputs.length + facades.length,
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

    for (const { family, modules } of inspections) {
      outputs.push(
        Object.freeze({
          path: this.#paths.resolve(packageRoot, family.barrelPath),
          relativePath: family.barrelPath,
          content: this.#serialiser.barrel(family, modules),
        }),
        Object.freeze({
          path: this.#paths.resolve(packageRoot, family.authorityPath),
          relativePath: family.authorityPath,
          content: this.#serialiser.authority(family, modules),
        }),
      );
    }

    outputs.push(this.#manifest.plan(packageRoot, inspections));

    return Object.freeze({
      outputs: Object.freeze(outputs),
      facades: this.#facades.plan(packageRoot, inspections),
    });
  }

  /**
   * @description Finds absent or stale independently replaced generated outputs.
   * @param {readonly import("../contracts/internal/catalogue-source-output.contract.mjs").ICatalogueSourceOutput[]} outputs - Expected generated outputs.
   * @returns {Promise<readonly string[]>} Package-relative changed output paths.
   */
  async #changedOutputs(outputs) {
    const changedPaths = [];

    for (const output of outputs) {
      const current = (await this.#fileSystem.exists(output.path))
        ? await this.#fileSystem.readText(output.path)
        : undefined;

      if (current !== output.content) {
        changedPaths.push(output.relativePath);
      }
    }

    return Object.freeze(changedPaths);
  }

  /**
   * @description Finds absent, stale or obsolete files beneath the owned facade root.
   * @param {string} packageRoot - Absolute Icons package root.
   * @param {readonly import("../contracts/internal/catalogue-source-output.contract.mjs").ICatalogueSourceOutput[]} facades - Expected generated facade outputs.
   * @returns {Promise<readonly string[]>} Package-relative changed facade paths.
   */
  async #changedFacades(packageRoot, facades) {
    const generatedRoot = this.#paths.resolve(
      packageRoot,
      this.#facadeRoot,
    );
    const changedPaths = [];
    const expectedPaths = new Set(facades.map((facade) => facade.path));

    for (const facade of facades) {
      const current = (await this.#fileSystem.exists(facade.path))
        ? await this.#fileSystem.readText(facade.path)
        : undefined;

      if (current !== facade.content) {
        changedPaths.push(facade.relativePath);
      }
    }

    const existingPaths = await this.#files.collect(generatedRoot, () => true);

    for (const path of existingPaths) {
      if (!expectedPaths.has(path)) {
        changedPaths.push(this.#paths.display(packageRoot, path));
      }
    }

    return Object.freeze(changedPaths);
  }
}
