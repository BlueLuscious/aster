import process from "node:process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { RepositoryPathResolver } from "../shared/runtime/repository-path.resolver.mjs";
import { CatalogueSourceSynchronisationCommand } from "./runtime/catalogue-source-synchronisation.command.mjs";
import { CatalogueSourceSynchroniserFactory } from "./runtime/catalogue-source-synchroniser.factory.mjs";

/**
 * @description Repository path capability used by the catalogue source command adapter.
 */
const repositoryPaths = new RepositoryPathResolver();

/**
 * @description Absolute Icons package root owned by this repository command.
 */
const iconsPackageRoot = repositoryPaths.resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../packages/icons",
);

/**
 * @description Private catalogue source synchroniser composition authority.
 */
const catalogueSourceSynchroniser = new CatalogueSourceSynchroniserFactory().create();

/**
 * @description Synchronises generated Icons catalogue sources for one explicit package root.
 * @param {string} packageRoot - Absolute or relative Icons package root.
 * @param {boolean} checkOnly - Whether to report drift without writing.
 * @returns {Promise<{ changedPaths: readonly string[], outputCount: number }>} Immutable synchronisation result.
 */
export async function synchroniseIconsCatalogue(packageRoot, checkOnly = false) {
  return catalogueSourceSynchroniser.synchronise(
    repositoryPaths.resolve(packageRoot),
    checkOnly,
  );
}

if (
  process.argv[1] !== undefined &&
  repositoryPaths.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await new CatalogueSourceSynchronisationCommand(
    catalogueSourceSynchroniser,
    process,
  ).run(iconsPackageRoot);
}
