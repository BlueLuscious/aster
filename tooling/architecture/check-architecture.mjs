import process from "node:process";
import { fileURLToPath } from "node:url";

import { RepositoryPathResolver } from "../shared/runtime/repository-path.resolver.mjs";
import { ArchitectureVerifierFactory } from "./runtime/architecture-verifier.factory.mjs";

/**
 * @description Repository path capability used by the architecture command adapter.
 */
const repositoryPaths = new RepositoryPathResolver();

/**
 * @description Private architecture verifier composition authority.
 */
const architectureVerifiers = new ArchitectureVerifierFactory();

/**
 * @description Absolute repository root containing the architecture command.
 */
const defaultWorkspaceRoot = repositoryPaths.resolve(
  repositoryPaths.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

/**
 * @description Verifies accepted repository architecture for one explicit workspace.
 * @param {string} workspaceRoot - Absolute repository root to verify.
 * @returns {Promise<readonly string[]>} Architecture findings in deterministic order.
 */
export async function verifyArchitecture(workspaceRoot) {
  return architectureVerifiers.create().verify(workspaceRoot);
}

if (
  process.argv[1] !== undefined &&
  repositoryPaths.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const issues = await verifyArchitecture(defaultWorkspaceRoot);

  if (issues.length > 0) {
    process.stderr.write(
      `Architecture verification failed:\n${issues.map((issue) => `- ${issue}`).join("\n")}\n`,
    );
    process.exitCode = 1;
  } else {
    process.stdout.write("Architecture verification passed.\n");
  }
}
