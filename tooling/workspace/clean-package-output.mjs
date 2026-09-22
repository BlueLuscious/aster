import process from "node:process";
import { fileURLToPath } from "node:url";

import { RepositoryPathResolver } from "../shared/runtime/repository-path.resolver.mjs";
import { NodePackageOutputFileSystem } from "./runtime/node-package-output-file-system.mjs";
import { PackageOutputCleanupCommand } from "./runtime/package-output-cleanup.command.mjs";
import { PackageOutputCleanupPolicy } from "./runtime/package-output-cleanup.policy.mjs";
import { PackageOutputCleaner } from "./runtime/package-output.cleaner.mjs";
import { PackageRootInspector } from "./runtime/package-root.inspector.mjs";

/**
 * @description Repository path capability composed for guarded package cleanup.
 */
const repositoryPaths = new RepositoryPathResolver();

/**
 * @description Node filesystem capability restricted to package output cleanup.
 */
const packageOutputFileSystem = new NodePackageOutputFileSystem();

/**
 * @description Complete guarded package output cleanup composition.
 */
const packageOutputCleaner = new PackageOutputCleaner(
  new PackageRootInspector(packageOutputFileSystem, repositoryPaths),
  new PackageOutputCleanupPolicy(repositoryPaths),
  packageOutputFileSystem,
  repositoryPaths,
);

/**
 * @description Removes one statically accepted generated package output.
 * @param {string} packageRoot - Absolute or relative package directory containing `package.json`.
 * @param {string} outputDirectory - Requested generated directory name.
 * @returns {Promise<void>} Completion after the output is absent.
 */
export async function cleanPackageOutput(packageRoot, outputDirectory) {
  await packageOutputCleaner.clean(packageRoot, outputDirectory);
}

if (
  process.argv[1] !== undefined &&
  repositoryPaths.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await new PackageOutputCleanupCommand(packageOutputCleaner, process).run();
}
