import { NodeRepositoryFileSystem } from "../../../shared/runtime/node-repository-file-system.mjs";
import { RepositoryFileWalker } from "../../../shared/runtime/repository-file.walker.mjs";
import { RepositoryJsonReader } from "../../../shared/runtime/repository-json.reader.mjs";
import { RepositoryPathResolver } from "../../../shared/runtime/repository-path.resolver.mjs";

/**
 * @description Inspects emitted package shape without assigning bundler-specific meaning.
 */
export class PackageDistributionInspector {
  /** @type {NodeRepositoryFileSystem} */
  #fileSystem;

  /** @type {RepositoryJsonReader} */
  #json;

  /** @type {RepositoryPathResolver} */
  #paths;

  /** @type {RepositoryFileWalker} */
  #files;

  /**
   * @description Creates an emitted-package inspector from repository filesystem capabilities.
   * @param {NodeRepositoryFileSystem} fileSystem - Repository file acquisition capability.
   * @param {RepositoryPathResolver} paths - Repository path capability.
   */
  constructor(
    fileSystem = new NodeRepositoryFileSystem(),
    paths = new RepositoryPathResolver(),
  ) {
    this.#fileSystem = fileSystem;
    this.#json = new RepositoryJsonReader(fileSystem);
    this.#paths = paths;
    this.#files = new RepositoryFileWalker(fileSystem, paths);
  }

  /**
   * @description Reads modules, declarations, exports, and side-effect metadata for one package.
   * @param {string} packagePath - Workspace-relative or absolute package root.
   * @returns {Promise<{ moduleFiles: number, moduleBytes: number, declarationFiles: number, declarationBytes: number, exports: readonly string[], sideEffects: unknown }>} Distribution summary.
   */
  async inspect(packagePath) {
    const packageRoot = this.#paths.resolve(packagePath);
    const manifest = await this.#json.read(
      this.#paths.resolve(packageRoot, "package.json"),
    );
    const paths = await this.#files.collect(
      this.#paths.resolve(packageRoot, "dist"),
      () => true,
    );
    const files = await Promise.all(
      paths.map(async (path) =>
        Object.freeze({ path, bytes: await this.#fileSystem.fileSize(path) }),
      ),
    );
    const modules = files.filter((file) => file.path.endsWith(".js"));
    const declarations = files.filter((file) => file.path.endsWith(".d.ts"));

    return Object.freeze({
      moduleFiles: modules.length,
      moduleBytes: modules.reduce((total, file) => total + file.bytes, 0),
      declarationFiles: declarations.length,
      declarationBytes: declarations.reduce(
        (total, file) => total + file.bytes,
        0,
      ),
      exports: Object.freeze(Object.keys(manifest.exports ?? {}).sort()),
      sideEffects: manifest.sideEffects,
    });
  }

}
