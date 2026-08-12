import { BenchmarkRunner } from "../shared/runtime/benchmark.runner.mjs";
import { NodeBenchmarkHost } from "../shared/runtime/node-benchmark.host.mjs";
import { PackageDistributionInspector } from "../shared/runtime/package-distribution.inspector.mjs";
import { CoreBaselineRunner } from "./runtime/core-baseline.runner.mjs";

/**
 * @description Explicit Node host for the Core development baseline.
 */
const benchmarkHost = new NodeBenchmarkHost();

/**
 * @description Complete Core development baseline composition.
 */
const coreBaselineRunner = new CoreBaselineRunner(
  new BenchmarkRunner(benchmarkHost),
  new PackageDistributionInspector(),
  benchmarkHost,
);

process.stdout.write(`${JSON.stringify(await coreBaselineRunner.run(), null, 2)}\n`);
