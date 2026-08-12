import process from "node:process";
import { fileURLToPath } from "node:url";

import { RepositoryPathResolver } from "../shared/runtime/repository-path.resolver.mjs";
import { DocumentationVerifierFactory } from "./runtime/documentation-verifier.factory.mjs";

/**
 * @description Repository path capability used by the documentation command adapter.
 */
const repositoryPaths = new RepositoryPathResolver();

/**
 * @description Private documentation verifier composition authority.
 */
const documentationVerifiers = new DocumentationVerifierFactory();

/**
 * @description Absolute repository root containing the documentation command.
 */
const defaultWorkspaceRoot = repositoryPaths.resolve(
  repositoryPaths.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

/**
 * @description Verifies canonical documentation for one explicit workspace.
 * @param {string} workspaceRoot - Absolute repository root to verify.
 * @returns {Promise<{ issues: string[], markdownFileCount: number }>} Stable verification result.
 */
export async function verifyDocumentation(workspaceRoot) {
  return documentationVerifiers.create().verify(workspaceRoot);
}

if (
  process.argv[1] !== undefined &&
  repositoryPaths.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const result = await verifyDocumentation(defaultWorkspaceRoot);

  if (result.issues.length > 0) {
    process.stderr.write(
      `Documentation verification failed:\n${result.issues.map((issue) => `- ${issue}`).join("\n")}\n`,
    );
    process.exitCode = 1;
  } else {
    process.stdout.write(
      `Documentation verification passed for ${result.markdownFileCount} canonical files.\n`,
    );
  }
}
