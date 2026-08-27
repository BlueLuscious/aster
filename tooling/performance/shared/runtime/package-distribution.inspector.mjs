import { packageDistribution } from "../constants/package-distribution.constant.mjs";

/**
 * @description Inspects emitted package shape without assigning bundler-specific meaning.
 */
export class PackageDistributionInspector {
  /**
   * @description Repository filesystem capability used to read emitted file sizes.
   * @type {import("../../../shared/contracts/internal/repository-file-system.contract.mjs").IRepositoryFileSystem}
   */
  #fileSystem;

  /**
   * @description Strict repository JSON acquisition capability.
   * @type {import("../../../shared/runtime/repository-json.reader.mjs").RepositoryJsonReader}
   */
  #json;

  /**
   * @description Repository path composition capability.
   * @type {import("../../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver}
   */
  #paths;

  /**
   * @description Deterministic emitted-file traversal capability.
   * @type {import("../../../shared/runtime/repository-file.walker.mjs").RepositoryFileWalker}
   */
  #files;

  /**
   * @description Creates an emitted-package inspector from repository filesystem capabilities.
   * @param {import("../../../shared/contracts/internal/repository-file-system.contract.mjs").IRepositoryFileSystem} fileSystem - Repository file acquisition capability.
   * @param {import("../../../shared/runtime/repository-json.reader.mjs").RepositoryJsonReader} json - Strict JSON acquisition capability.
   * @param {import("../../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   * @param {import("../../../shared/runtime/repository-file.walker.mjs").RepositoryFileWalker} files - Deterministic emitted-file traversal capability.
   */
  constructor(fileSystem, json, paths, files) {
    this.#fileSystem = fileSystem;
    this.#json = json;
    this.#paths = paths;
    this.#files = files;
  }

  /**
   * @description Reads modules, declarations, exports, and side-effect metadata for one package.
   * @param {string} packagePath - Workspace-relative or absolute package root.
   * @returns {Promise<{ files: number, bytes: number, moduleFiles: number, moduleBytes: number, declarationFiles: number, declarationBytes: number, exports: readonly string[], sideEffects: unknown, type: unknown, main: unknown, types: unknown, bin: unknown, engines: unknown, dependencies: unknown }>} Distribution summary.
   */
  async inspect(packagePath) {
    const packageRoot = this.#paths.resolve(packagePath);
    const manifest = await this.#json.read(
      this.#paths.resolve(packageRoot, packageDistribution.manifest),
    );
    const paths = await this.#files.collect(
      this.#paths.resolve(packageRoot, packageDistribution.outputDirectory),
      () => true,
    );
    const files = await Promise.all(
      paths.map(async (path) =>
        Object.freeze({ path, bytes: await this.#fileSystem.fileSize(path) }),
      ),
    );
    const modules = files.filter((file) =>
      file.path.endsWith(packageDistribution.moduleSuffix),
    );
    const declarations = files.filter((file) =>
      file.path.endsWith(packageDistribution.declarationSuffix),
    );

    return Object.freeze({
      files: files.length,
      bytes: files.reduce((total, file) => total + file.bytes, 0),
      moduleFiles: modules.length,
      moduleBytes: modules.reduce((total, file) => total + file.bytes, 0),
      declarationFiles: declarations.length,
      declarationBytes: declarations.reduce(
        (total, file) => total + file.bytes,
        0,
      ),
      exports: Object.freeze(Object.keys(manifest.exports ?? {}).sort()),
      sideEffects: manifest.sideEffects,
      type: manifest.type,
      main: manifest.main,
      types: manifest.types,
      bin: this.#record(manifest.bin),
      engines: this.#record(manifest.engines),
      dependencies: this.#record(manifest.dependencies),
    });
  }

  /**
   * @description Copies one optional manifest record into deterministic lexical key order.
   * @param {unknown} value - Candidate manifest member.
   * @returns {unknown} Immutable ordered record or the original scalar manifest value.
   */
  #record(value) {
    if (value === undefined) {
      return undefined;
    }

    if (value === null || typeof value !== "object" || Array.isArray(value)) {
      return value;
    }

    return Object.freeze(
      Object.fromEntries(
        Object.entries(value).sort(([left], [right]) =>
          left < right ? -1 : left > right ? 1 : 0,
        ),
      ),
    );
  }
}
