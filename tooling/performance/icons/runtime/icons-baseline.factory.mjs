import { NodeRepositoryFileSystem } from "../../../shared/runtime/node-repository-file-system.mjs";
import { RepositoryFileWalker } from "../../../shared/runtime/repository-file.walker.mjs";
import { RepositoryJsonReader } from "../../../shared/runtime/repository-json.reader.mjs";
import { RepositoryPathResolver } from "../../../shared/runtime/repository-path.resolver.mjs";
import { ModuleImportRunner } from "../../shared/runtime/module-import.runner.mjs";
import { NodeBenchmarkHost } from "../../shared/runtime/node-benchmark.host.mjs";
import { NodeProcessHost } from "../../shared/runtime/node-process.host.mjs";
import { NumericSampleStatistics } from "../../shared/runtime/numeric-sample.statistics.mjs";
import { PackageDistributionInspector } from "../../shared/runtime/package-distribution.inspector.mjs";
import { iconsBaseline } from "../constants/icons-baseline.constant.mjs";
import { IconsBaselineRunner } from "./icons-baseline.runner.mjs";

/**
 * @description Composes Node and repository capabilities required by the Icons comparison.
 */
export class IconsBaselineFactory {
  /**
   * @description Creates one independent Icons distribution comparison runner.
   * @returns {IconsBaselineRunner} Fully composed development-only Icons runner.
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
    const repositoryRoot = paths.resolve(".");

    return new IconsBaselineRunner(
      new ModuleImportRunner(
        new NodeProcessHost(repositoryRoot),
        new NumericSampleStatistics(),
        paths.resolve(iconsBaseline.probePath),
        iconsBaseline.sampleCount,
      ),
      distribution,
      host,
      paths.resolve(iconsBaseline.packagePath),
    );
  }
}
