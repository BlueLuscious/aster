import { rm, stat } from "node:fs/promises";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { RepositoryPathResolver } from "../shared/runtime/repository-path.resolver.mjs";

/**
 * @description Repository path capability composed for guarded package cleanup.
 */
const repositoryPaths = new RepositoryPathResolver();

/**
 * @description Only generated directory name accepted by the initial package cleaner.
 */
const acceptedOutputDirectory = "dist";

/**
 * @description Determines whether an absolute path contains a package manifest.
 * @param {string} packageRoot - Absolute candidate package root.
 * @returns {Promise<boolean>} Whether the candidate contains `package.json`.
 */
async function isPackageRoot(packageRoot) {
  try {
    const manifest = await stat(repositoryPaths.resolve(packageRoot, "package.json"));

    return manifest.isFile();
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

/**
 * @description Removes one statically accepted generated package output.
 * @remarks The output must resolve to the direct `dist` child of a package root.
 * @param {string} packageRoot - Absolute or relative package directory containing `package.json`.
 * @param {string} outputDirectory - Requested generated directory name.
 * @returns {Promise<void>} Completion after the output is absent.
 */
export async function cleanPackageOutput(packageRoot, outputDirectory) {
  const resolvedPackageRoot = repositoryPaths.resolve(packageRoot);
  const resolvedOutput = repositoryPaths.resolve(resolvedPackageRoot, outputDirectory);
  const relation = repositoryPaths.relative(resolvedPackageRoot, resolvedOutput);
  const escapesPackage = !repositoryPaths.contains(resolvedPackageRoot, resolvedOutput);

  if (!(await isPackageRoot(resolvedPackageRoot))) {
    throw new Error(`Refusing to clean a directory without package.json: ${resolvedPackageRoot}`);
  }

  if (
    outputDirectory !== acceptedOutputDirectory ||
    relation !== acceptedOutputDirectory ||
    escapesPackage
  ) {
    throw new Error("Refusing to clean anything except the direct package dist directory");
  }

  await rm(resolvedOutput, { recursive: true, force: true });
}

/**
 * @description Adapts guarded package cleanup to the command line.
 * @returns {Promise<void>} Completion after cleanup or diagnostic output.
 */
async function main() {
  const outputDirectory = process.argv[2];

  if (outputDirectory === undefined) {
    process.stderr.write("Package cleanup requires an output directory.\n");
    process.exitCode = 1;
    return;
  }

  try {
    await cleanPackageOutput(process.cwd(), outputDirectory);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

if (
  process.argv[1] !== undefined &&
  repositoryPaths.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await main();
}
