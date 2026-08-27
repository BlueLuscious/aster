import process from "node:process";
import { CliBaselineFactory } from "./runtime/cli-baseline.factory.mjs";

/**
 * @description Executes the development-only CLI comparison and writes one JSON report.
 * @returns {Promise<void>} Completion after report output.
 */
async function main() {
  const report = await new CliBaselineFactory().create().run();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

await main();
