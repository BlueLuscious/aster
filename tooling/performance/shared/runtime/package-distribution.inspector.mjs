import { readdir, readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * @description Inspects emitted package shape without assigning bundler-specific meaning.
 */
export class PackageDistributionInspector {
  /**
   * @description Reads modules, declarations, exports, and side-effect metadata for one package.
   * @param {string} packagePath - Workspace-relative or absolute package root.
   * @returns {Promise<{ moduleFiles: number, moduleBytes: number, declarationFiles: number, declarationBytes: number, exports: readonly string[], sideEffects: unknown }>} Distribution summary.
   */
  async inspect(packagePath) {
    const packageRoot = resolve(packagePath);
    const manifest = JSON.parse(
      await readFile(resolve(packageRoot, "package.json"), "utf8"),
    );
    const files = await this.#files(resolve(packageRoot, "dist"));
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

  /**
   * @description Recursively gathers emitted distribution files and byte sizes.
   * @param {string} directory - Absolute distribution directory to inspect.
   * @returns {Promise<readonly { path: string, bytes: number }[]>} Ordered emitted-file records.
   */
  async #files(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
      const path = resolve(directory, entry.name);

      if (entry.isDirectory()) {
        files.push(...(await this.#files(path)));
      } else if (entry.isFile()) {
        const information = await stat(path);
        files.push(Object.freeze({ path, bytes: information.size }));
      }
    }

    return Object.freeze(
      files.sort((left, right) => left.path.localeCompare(right.path)),
    );
  }
}
