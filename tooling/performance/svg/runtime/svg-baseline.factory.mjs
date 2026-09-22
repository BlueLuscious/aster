import { NodeRepositoryFileSystem } from "../../../shared/runtime/node-repository-file-system.mjs";
import { RepositoryFileWalker } from "../../../shared/runtime/repository-file.walker.mjs";
import { RepositoryJsonReader } from "../../../shared/runtime/repository-json.reader.mjs";
import { RepositoryPathResolver } from "../../../shared/runtime/repository-path.resolver.mjs";
import { BenchmarkRunner } from "../../shared/runtime/benchmark.runner.mjs";
import { NodeBenchmarkHost } from "../../shared/runtime/node-benchmark.host.mjs";
import { NumericSampleStatistics } from "../../shared/runtime/numeric-sample.statistics.mjs";
import { PackageDistributionInspector } from "../../shared/runtime/package-distribution.inspector.mjs";
import { SvgBaselineFixtureFactory } from "./svg-baseline-fixture.factory.mjs";
import { SvgBaselineRunner } from "./svg-baseline.runner.mjs";

/**
 * @description Composes the Node and repository capabilities required by the SVG comparison.
 */
export class SvgBaselineFactory {
  /**
   * @description Creates one independent SVG comparison runner.
   * @returns {SvgBaselineRunner} Fully composed development-only SVG runner.
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

    return new SvgBaselineRunner(
      new BenchmarkRunner(host, new NumericSampleStatistics()),
      distribution,
      host,
      new SvgBaselineFixtureFactory().create(),
    );
  }
}
