import { Buffer } from "node:buffer";
import { registerHooks } from "node:module";
import { relative, resolve, sep } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

import { cliCommandEvaluation } from "../constants/cli-command-evaluation.constant.mjs";

/**
 * @description Executes one real built-in CLI workflow while attributing evaluated CLI and Icons
 * distribution modules.
 */
export class CliCommandEvaluationProbe {
  /** @description Process-global symbol used only inside the disposable probe process. */
  #evaluationSymbol = Symbol.for(cliCommandEvaluation.evaluationSymbolKey);

  /**
   * @description Imports CLI, executes one configured workflow and records package-owned modules.
   * @param {string} scenarioKey - Closed configured workflow key.
   * @returns {Promise<{ name: string, result: string, scenarioNanoseconds: number, evaluatedModules: Readonly<{ cli: readonly string[], icons: readonly string[] }> }>} Immutable workflow evaluation evidence.
   */
  async inspect(scenarioKey) {
    const scenario = cliCommandEvaluation.scenarios[scenarioKey];

    if (scenario === undefined) {
      throw new TypeError(`Unknown CLI command evaluation scenario ${scenarioKey}.`);
    }

    const roots = Object.freeze(Object.fromEntries(
      Object.entries(cliCommandEvaluation.packagePaths).map(([name, path]) => {
        const distributionRoot = resolve(path, "dist");

        return [name, Object.freeze({
          distributionRoot,
          prefix: pathToFileURL(`${distributionRoot}${sep}`).href,
        })];
      }),
    ));
    const evaluations = new Set();
    globalThis[this.#evaluationSymbol] = evaluations;

    const hooks = registerHooks({
      load: (url, context, nextLoad) => {
        const result = nextLoad(url, context);

        if (
          Object.values(roots).some(({ prefix }) => url.startsWith(prefix))
          && result.format === "module"
          && result.source !== null
          && result.source !== undefined
        ) {
          const marker =
            `globalThis[Symbol.for(${JSON.stringify(cliCommandEvaluation.evaluationSymbolKey)})]`
            + `.add(${JSON.stringify(url)});\n`;
          const source = typeof result.source === "string"
            ? result.source
            : Buffer.from(result.source).toString("utf8");

          return Object.freeze({ ...result, source: `${marker}${source}` });
        }

        return result;
      },
    });
    const startedAt = process.hrtime.bigint();

    try {
      const { AsterCatalogue, AsterCommands } = await import("@luscious-garden/aster-cli");
      const result = await AsterCommands.execute(
        scenario.invocation,
        Object.freeze({
          catalogues: Object.freeze([AsterCatalogue]),
          productName: "Aster",
          productVersion: "0.0.0",
        }),
      );
      const scenarioNanoseconds = Number(process.hrtime.bigint() - startedAt);
      const evaluatedModules = Object.freeze(Object.fromEntries(
        Object.entries(roots).map(([name, { distributionRoot, prefix }]) => [
          name,
          Object.freeze([...evaluations]
            .filter((url) => url.startsWith(prefix))
            .map((url) => relative(distributionRoot, fileURLToPath(url)).split(sep).join("/"))
            .sort()),
        ]),
      ));

      return Object.freeze({
        name: scenario.name,
        result: result.ok
          ? `success:${result.payload.kind}`
          : `failure:${result.diagnostic.code}`,
        scenarioNanoseconds,
        evaluatedModules,
      });
    } finally {
      hooks.deregister();
      delete globalThis[this.#evaluationSymbol];
    }
  }
}
