import { registerHooks } from "node:module";
import { relative, resolve, sep } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

import { moduleImportProbe } from "../constants/module-import-probe.constant.mjs";
import { decodeModuleSource } from "./module-source.decoder.mjs";

/**
 * @description Inspects one package import in an isolated process and records evaluated package
 * modules.
 */
export class ModuleImportProbe {
  /** @description Process-global symbol used only inside the disposable probe process. */
  #evaluationSymbol = Symbol.for(moduleImportProbe.evaluationSymbolKey);

  /**
   * @description Imports distinct resolved modules without installing evaluation hooks, then measures cached reuse separately.
   * @param {readonly string[]} specifiers - Distinct public specifiers or absolute fixture URLs.
   * @returns {Promise<{ instrumentation: false, resolved: readonly string[], firstImportNanoseconds: number, cachedImportNanoseconds: number, exports: readonly Readonly<{ names: readonly string[], signature: string }>[], cachedReferencesRetained: boolean }>} Native evidence with `instrumentation: false`, distinct resolved module URLs, first/cached import nanoseconds and cached-reference identity status.
   * Each `exports` entry retains export `names` and their deterministic `signature`; no cold OS cache or complete dependency-module count is claimed.
   */
  async inspectNative(specifiers) {
    if (
      specifiers.length === 0 ||
      !specifiers.every(
        (value) => typeof value === "string" && value.length > 0,
      )
    ) {
      throw new TypeError("Native imports require non-empty specifiers.");
    }
    const startedAt = process.hrtime.bigint();
    /** @type {Record<string, unknown>[]} */
    const modules = [];
    for (const specifier of specifiers) {
      modules.push(await import(specifier));
    }
    const firstImportNanoseconds = Number(process.hrtime.bigint() - startedAt);
    const cachedAt = process.hrtime.bigint();
    const cached = [];
    for (const specifier of specifiers) {
      cached.push(await import(specifier));
    }
    const cachedImportNanoseconds = Number(process.hrtime.bigint() - cachedAt);
    const resolved = specifiers.map((specifier) =>
      import.meta.resolve(specifier),
    );
    const identities = resolved.map((specifier) => {
      const url = new URL(specifier);
      url.search = "";
      url.hash = "";
      return url.href;
    });
    if (new Set(identities).size !== identities.length) {
      throw new TypeError("Native import inputs resolve to repeated modules.");
    }
    const { BenchmarkEvidence } = await import("./benchmark-evidence.mjs");
    const evidence = new BenchmarkEvidence();
    return Object.freeze({
      instrumentation: false,
      resolved: Object.freeze(resolved),
      firstImportNanoseconds,
      cachedImportNanoseconds,
      exports: Object.freeze(
        modules.map((module) =>
          Object.freeze({
            names: Object.freeze(Object.keys(module).sort()),
            signature: evidence.fingerprint(this.#exportProjection(module)),
          }),
        ),
      ),
      cachedReferencesRetained: cached.every(
        (module, index) => module === modules[index],
      ),
    });
  }

  /**
   * @description Projects complete data exports and callable names into unambiguous tagged JSON.
   * @remarks Callable implementation identity belongs to recorded source bytes, not this shape signature.
   * @param {unknown} value - Exported data from a trusted compiled or synthetic module.
   * @returns {unknown} Tagged serialisable export shape, preserving array order and undefined values.
   */
  #exportProjection(value) {
    if (value === null) {
      return ["null"];
    }
    if (Array.isArray(value)) {
      return ["array", value.map((entry) => this.#exportProjection(entry))];
    }
    if (typeof value === "object") {
      return [
        "object",
        Object.keys(value)
          .sort()
          .map((key) => [key, this.#exportProjection(Reflect.get(value, key))]),
      ];
    }
    if (typeof value === "function") {
      return ["function", value.name];
    }
    if (typeof value === "undefined") {
      return ["undefined"];
    }
    return [typeof value, value];
  }

  /**
   * @description Imports one public specifier while instrumenting emitted modules beneath its
   * package root.
   * @param {string} specifier - Public package specifier to import.
   * @param {string} packagePath - Absolute or process-relative package root.
   * @returns {Promise<{ specifier: string, exports: readonly string[], evaluatedModules: readonly string[], importNanoseconds: number }>} Original `specifier`, sorted public `exports`, package-owned `evaluatedModules` and measured `importNanoseconds`.
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
    Reflect.set(globalThis, this.#evaluationSymbol, evaluations);

    const hooks = registerHooks({
      load: (url, context, nextLoad) => {
        const result = nextLoad(url, context);

        if (
          url.startsWith(distributionPrefix) &&
          result.format === "module" &&
          result.source !== null &&
          result.source !== undefined
        ) {
          const marker =
            `globalThis[Symbol.for(${JSON.stringify(moduleImportProbe.evaluationSymbolKey)})]` +
            `.add(${JSON.stringify(url)});\n`;
          const source = decodeModuleSource(result.source);

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
      Reflect.deleteProperty(globalThis, this.#evaluationSymbol);
    }
  }
}
