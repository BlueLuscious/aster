import { Buffer } from "node:buffer";
import { registerHooks } from "node:module";
import { relative, resolve, sep } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

import { moduleImportProbe } from "../constants/module-import-probe.constant.mjs";

/**
 * @description Inspects one package import in an isolated process and records evaluated package
 * modules.
 */
export class ModuleImportProbe {
  /** @description Process-global symbol used only inside the disposable probe process. */
  #evaluationSymbol = Symbol.for(moduleImportProbe.evaluationSymbolKey);

  /**
   * @description Imports one public specifier while instrumenting emitted modules beneath its
   * package root.
   * @param {string} specifier - Public package specifier to import.
   * @param {string} packagePath - Absolute or process-relative package root.
   * @returns {Promise<{ specifier: string, exports: readonly string[], evaluatedModules: readonly string[], importNanoseconds: number }>} Immutable import evidence.
   */
  async inspect(specifier, packagePath) {
    if (specifier.length === 0 || packagePath.length === 0) {
      throw new TypeError(
        "Module import probes require a specifier and package path.",
      );
    }

    const distributionRoot = resolve(packagePath, "dist");
    const distributionPrefix = pathToFileURL(`${distributionRoot}${sep}`).href;
    const evaluations = new Set();
    globalThis[this.#evaluationSymbol] = evaluations;

    const hooks = registerHooks({
      load: (url, context, nextLoad) => {
        const result = nextLoad(url, context);

        if (
          url.startsWith(distributionPrefix)
          && result.format === "module"
          && result.source !== null
          && result.source !== undefined
        ) {
          const marker =
            `globalThis[Symbol.for(${JSON.stringify(moduleImportProbe.evaluationSymbolKey)})]`
            + `.add(${JSON.stringify(url)});\n`;
          const source =
            typeof result.source === "string"
              ? result.source
              : Buffer.from(result.source).toString("utf8");

          return Object.freeze({
            ...result,
            source: `${marker}${source}`,
          });
        }

        return result;
      },
    });
    const startedAt = process.hrtime.bigint();

    try {
      const imported = await import(specifier);
      const importNanoseconds = Number(process.hrtime.bigint() - startedAt);
      const evaluatedModules = [...evaluations]
        .map((url) =>
          relative(distributionRoot, fileURLToPath(url)).split(sep).join("/"),
        )
        .sort();

      return Object.freeze({
        specifier,
        exports: Object.freeze(Object.keys(imported).sort()),
        evaluatedModules: Object.freeze(evaluatedModules),
        importNanoseconds,
      });
    } finally {
      hooks.deregister();
      delete globalThis[this.#evaluationSymbol];
    }
  }
}
