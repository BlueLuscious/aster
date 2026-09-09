/**
 * @description Plans, verifies and writes deterministic aggregate catalogue source files.
 */
export class CatalogueSourceSynchroniser {
  /** @type {import("../contracts/internal/catalogue-source-file-system.contract.mjs").ICatalogueSourceFileSystem} */
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
   * @description Repository path composition capability.
   * @type {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver}
   */
  #paths;

  /** @type {readonly import("../contracts/internal/catalogue-source-family.contract.mjs").ICatalogueSourceFamily[]} */
  #families;

  /**
   * @description Creates one deterministic catalogue source synchroniser.
   * @param {import("../contracts/internal/catalogue-source-file-system.contract.mjs").ICatalogueSourceFileSystem} fileSystem - Generated source persistence capability.
   * @param {import("./catalogue-source-module.inspector.mjs").CatalogueSourceModuleInspector} modules - Canonical source-module inspector.
   * @param {import("./catalogue-source.serialiser.mjs").CatalogueSourceSerialiser} serialiser - Generated source serialiser.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   * @param {readonly import("../contracts/internal/catalogue-source-family.contract.mjs").ICatalogueSourceFamily[]} families - Ordered catalogue source-family configurations.
   */
  constructor(fileSystem, modules, serialiser, paths, families) {
    this.#fileSystem = fileSystem;
    this.#modules = modules;
    this.#serialiser = serialiser;
    this.#paths = paths;
    this.#families = Object.freeze([...families]);
  }

  /**
   * @description Computes every generated output and either verifies or writes its exact content.
   * @param {string} packageRoot - Absolute Icons package root.
   * @param {boolean} checkOnly - Whether drift must be reported without writing.
   * @returns {Promise<{ changedPaths: readonly string[], outputCount: number }>} Immutable synchronisation result.
   */
  async synchronise(packageRoot, checkOnly) {
    const outputs = await this.#plan(packageRoot);
    const changedPaths = [];

    for (const output of outputs) {
      const current = (await this.#fileSystem.exists(output.path))
        ? await this.#fileSystem.readText(output.path)
        : undefined;

      if (current === output.content) {
        continue;
      }

      changedPaths.push(output.relativePath);

      if (!checkOnly) {
        await this.#fileSystem.writeText(output.path, output.content);
      }
    }

    return Object.freeze({
      changedPaths: Object.freeze(changedPaths),
      outputCount: outputs.length,
    });
  }

  /**
   * @description Plans complete generated outputs only after every source family is valid.
   * @param {string} packageRoot - Absolute Icons package root.
   * @returns {Promise<readonly import("../contracts/internal/catalogue-source-output.contract.mjs").ICatalogueSourceOutput[]>} Complete generated output plan.
   */
  async #plan(packageRoot) {
    const outputs = [];

    for (const family of this.#families) {
      const modules = await this.#modules.inspect(packageRoot, family);
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

    return Object.freeze(outputs);
  }
}
