import { NodeRepositoryFileSystem } from "../../shared/runtime/node-repository-file-system.mjs";
import { RepositoryDirectoryReader } from "../../shared/runtime/repository-directory.reader.mjs";
import { RepositoryFileWalker } from "../../shared/runtime/repository-file.walker.mjs";
import { RepositoryJsonReader } from "../../shared/runtime/repository-json.reader.mjs";
import { RepositoryPathResolver } from "../../shared/runtime/repository-path.resolver.mjs";
import { packageBoundaries } from "../constants/package-boundaries.constant.mjs";
import { ArchitectureVerifier } from "./architecture-verifier.mjs";
import { BuildPackagePolicy } from "./build-package.policy.mjs";
import { CliPackagePolicy } from "./cli-package.policy.mjs";
import { CorePackagePolicy } from "./core-package.policy.mjs";
import { ModuleSpecifierExtractor } from "./module-specifier.extractor.mjs";
import { PackageArchitectureInspector } from "./package-architecture.inspector.mjs";
import { PackageModuleInspector } from "./package-module.inspector.mjs";
import { PortableCompilerPolicy } from "./portable-compiler.policy.mjs";
import { RootPackageExportPolicy } from "./root-package-export.policy.mjs";
import { RuntimeDependencyReader } from "./runtime-dependency.reader.mjs";
import { WorkspaceArchitectureInspector } from "./workspace-architecture.inspector.mjs";
import { WorkspaceDependencyGraph } from "./workspace-dependency.graph.mjs";

/**
 * @description Composes architecture verification from private repository capabilities and policies.
 */
export class ArchitectureVerifierFactory {
  /**
   * @description Creates one independently stateful architecture verifier.
   * @returns {ArchitectureVerifier} Fully composed architecture verifier.
   */
  create() {
    const fileSystem = new NodeRepositoryFileSystem();
    const paths = new RepositoryPathResolver();
    const directories = new RepositoryDirectoryReader(fileSystem);
    const files = new RepositoryFileWalker(fileSystem, paths);
    const json = new RepositoryJsonReader(fileSystem);
    const compiler = new PortableCompilerPolicy(fileSystem, json, paths);
    const rootExport = new RootPackageExportPolicy();
    /** @type {Map<string, import("../contracts/internal/package-architecture-policy.contract.mjs").IPackageArchitecturePolicy>} */
    const policies = new Map();

    policies.set(
      packageBoundaries.names.core,
      new CorePackagePolicy(compiler, rootExport),
    );
    policies.set(
      packageBoundaries.names.build,
      new BuildPackagePolicy(compiler, rootExport),
    );
    policies.set(
      packageBoundaries.names.cli,
      new CliPackagePolicy(compiler, rootExport),
    );
    const modules = new PackageModuleInspector(
      fileSystem,
      files,
      new ModuleSpecifierExtractor(),
      paths,
    );

    return new ArchitectureVerifier([
      new WorkspaceArchitectureInspector(fileSystem, json, paths),
      new PackageArchitectureInspector(
        fileSystem,
        json,
        directories,
        new RuntimeDependencyReader(),
        modules,
        policies,
        paths,
        () => new WorkspaceDependencyGraph(),
      ),
    ]);
  }
}
