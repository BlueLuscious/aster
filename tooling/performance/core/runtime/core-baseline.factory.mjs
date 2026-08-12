import { NodeRepositoryFileSystem } from "../../../shared/runtime/node-repository-file-system.mjs";
import { RepositoryFileWalker } from "../../../shared/runtime/repository-file.walker.mjs";
import { RepositoryJsonReader } from "../../../shared/runtime/repository-json.reader.mjs";
import { RepositoryPathResolver } from "../../../shared/runtime/repository-path.resolver.mjs";
import { BenchmarkRunner } from "../../shared/runtime/benchmark.runner.mjs";
import { NodeBenchmarkHost } from "../../shared/runtime/node-benchmark.host.mjs";
import { NumericSampleStatistics } from "../../shared/runtime/numeric-sample.statistics.mjs";
import { PackageDistributionInspector } from "../../shared/runtime/package-distribution.inspector.mjs";
import { CoreBaselineRunner } from "./core-baseline.runner.mjs";

/**
 * @description Composes the Node and repository capabilities required by the Core comparison.
 */
export class CoreBaselineFactory {
  /**
   * @description Creates one independent Core comparison runner.
   * @returns {CoreBaselineRunner} Fully composed development-only Core runner.
   */
  create() {
    const host = new NodeBenchmarkHost();
    const fileSystem = new NodeRepositoryFileSystem();
    const paths = new RepositoryPathResolver();
    const files = new RepositoryFileWalker(fileSystem, paths);
    const distribution = new PackageDistributionInspector(
      fileSystem,
      new RepositoryJsonReader(fileSystem),
      paths,
      files,
    );

    return new CoreBaselineRunner(
      new BenchmarkRunner(host, new NumericSampleStatistics()),
      distribution,
      host,
    );
  }
}
