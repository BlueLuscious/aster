import { NodeRepositoryFileSystem } from "../../../shared/runtime/node-repository-file-system.mjs";
import { RepositoryFileWalker } from "../../../shared/runtime/repository-file.walker.mjs";
import { RepositoryJsonReader } from "../../../shared/runtime/repository-json.reader.mjs";
import { RepositoryPathResolver } from "../../../shared/runtime/repository-path.resolver.mjs";
import { AsyncBenchmarkRunner } from "../../shared/runtime/async-benchmark.runner.mjs";
import { BenchmarkRunner } from "../../shared/runtime/benchmark.runner.mjs";
import { NodeBenchmarkHost } from "../../shared/runtime/node-benchmark.host.mjs";
import { NumericSampleStatistics } from "../../shared/runtime/numeric-sample.statistics.mjs";
import { PackageDistributionInspector } from "../../shared/runtime/package-distribution.inspector.mjs";
import { cliBaseline } from "../constants/cli-baseline.constant.mjs";
import { CliBaselineFixtureFactory } from "./cli-baseline-fixture.factory.mjs";
import { CliBaselineRunner } from "./cli-baseline.runner.mjs";
import { CliColdStartRunner } from "./cli-cold-start.runner.mjs";
import { NodeCliProcessHost } from "./node-cli-process.host.mjs";

/**
 * @description Composes Node and repository capabilities required by the CLI comparison.
 */
export class CliBaselineFactory {
  /**
   * @description Creates one independent CLI comparison runner.
   * @returns {CliBaselineRunner} Fully composed development-only CLI runner.
   */
  create() {
    const host = new NodeBenchmarkHost();
    const statistics = new NumericSampleStatistics();
    const fileSystem = new NodeRepositoryFileSystem();
    const paths = new RepositoryPathResolver();
    const files = new RepositoryFileWalker(fileSystem, paths);
    const distribution = new PackageDistributionInspector(
      fileSystem,
      new RepositoryJsonReader(fileSystem),
      paths,
      files,
    );

    return new CliBaselineRunner(
      new BenchmarkRunner(host, statistics, { warmupOperations: 20 }),
      new AsyncBenchmarkRunner(host, statistics, { warmupOperations: 5 }),
      new CliColdStartRunner(
        new NodeCliProcessHost(paths.resolve(".")),
        statistics,
      ),
      distribution,
      host,
      new CliBaselineFixtureFactory().create(),
      paths.resolve(cliBaseline.executablePath),
    );
  }
}
