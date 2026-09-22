import process from "node:process";

import { CliCommandEvaluationProbe } from "./runtime/cli-command-evaluation.probe.mjs";

/** @description Closed command scenario key received by the disposable probe process. */
const scenarioKey = process.argv[2] ?? "";

/** @description Complete development-only CLI command evaluation probe composition. */
const commandEvaluationProbe = new CliCommandEvaluationProbe();

process.stdout.write(
  `${JSON.stringify(await commandEvaluationProbe.inspect(scenarioKey))}\n`,
);
