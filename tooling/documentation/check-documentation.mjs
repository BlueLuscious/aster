import process from "node:process";
import { fileURLToPath } from "node:url";

import { NodeRepositoryFileSystem } from "../shared/runtime/node-repository-file-system.mjs";
import { RepositoryDirectoryReader } from "../shared/runtime/repository-directory.reader.mjs";
import { RepositoryFileWalker } from "../shared/runtime/repository-file.walker.mjs";
import { RepositoryPathResolver } from "../shared/runtime/repository-path.resolver.mjs";

/**
 * @description Node filesystem capability composed for documentation verification.
 */
const repositoryFileSystem = new NodeRepositoryFileSystem();

/**
 * @description Repository path capability composed for documentation verification.
 */
const repositoryPaths = new RepositoryPathResolver();

/**
 * @description Optional directory membership reader used by documentation mirroring.
 */
const repositoryDirectories = new RepositoryDirectoryReader(repositoryFileSystem);

/**
 * @description Deterministic Markdown file walker used by documentation inspection.
 */
const repositoryFiles = new RepositoryFileWalker(repositoryFileSystem, repositoryPaths);

/**
 * @description Absolute path to the repository root containing the documentation command.
 */
const defaultWorkspaceRoot = repositoryPaths.resolve(
  repositoryPaths.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

/**
 * @description Canonical documentation entries required by repository policy.
 */
const requiredDocumentationEntries = Object.freeze([
  "index.md",
  "architecture/index.md",
  "collections/index.md",
  "decisions/index.md",
  "governance/index.md",
  "packages/index.md",
  "tooling/index.md",
]);

/**
 * @description Local-reference patterns forbidden from canonical documentation.
 */
const forbiddenLocalReferences = Object.freeze([
  { label: "a local planning path", pattern: /\bplans[\\/]/iu },
  { label: "an epic identifier", pattern: /\bepic\s+\d+\b/iu },
  { label: "a phase identifier", pattern: /\bphase\s+\d+\b/iu },
  { label: "an absolute Windows user path", pattern: /\b[A-Z]:\\Users\\/u },
  { label: "an absolute macOS user path", pattern: /\/Users\/[^/\s]+/u },
]);

/**
 * @description Status values accepted for canonical architecture decision records.
 */
const acceptedDecisionStatuses = new Set(["Proposed", "Accepted", "Rejected", "Superseded"]);

/**
 * @description Verifies that canonical documentation entry points exist.
 * @param {string} documentationRoot - Absolute canonical documentation root.
 * @param {string} workspaceRoot - Absolute repository root.
 * @param {string[]} issues - Mutable issue collection populated by the check.
 * @returns {Promise<void>} Completion after every required entry is inspected.
 */
async function validateRequiredHierarchy(documentationRoot, workspaceRoot, issues) {
  for (const entry of requiredDocumentationEntries) {
    const path = repositoryPaths.resolve(documentationRoot, entry);

    if (!(await repositoryFileSystem.exists(path))) {
      issues.push(
        `Missing canonical documentation entry: ${repositoryPaths.display(workspaceRoot, path)}`,
      );
    }
  }
}

/**
 * @description Verifies that package documentation mirrors real workspace packages.
 * @param {string} documentationRoot - Absolute canonical documentation root.
 * @param {string} workspaceRoot - Absolute repository root.
 * @param {string[]} issues - Mutable issue collection populated by the check.
 * @returns {Promise<void>} Completion after source and documentation members are compared.
 */
async function validatePackageMirroring(documentationRoot, workspaceRoot, issues) {
  const sourceMembers = await repositoryDirectories.read(
    repositoryPaths.resolve(workspaceRoot, "packages"),
  );
  const documentedMembers = await repositoryDirectories.read(
    repositoryPaths.resolve(documentationRoot, "packages"),
  );

  for (const member of sourceMembers) {
    if (!documentedMembers.includes(member)) {
      issues.push(`Missing packages documentation for repository member: ${member}`);
    }
  }

  for (const member of documentedMembers) {
    if (!sourceMembers.includes(member)) {
      issues.push(`Documentation describes a missing packages member: ${member}`);
    }
  }
}

/**
 * @description Verifies that canonical prose does not depend on local-only references.
 * @param {string} workspaceRoot - Absolute repository root.
 * @param {string} path - Absolute Markdown file path.
 * @param {string} content - Markdown content to inspect.
 * @param {string[]} issues - Mutable issue collection populated by the check.
 * @returns {void} This validation mutates only the provided issue collection.
 */
function validateLocalReferences(workspaceRoot, path, content, issues) {
  for (const reference of forbiddenLocalReferences) {
    if (reference.pattern.test(content)) {
      issues.push(`${repositoryPaths.display(workspaceRoot, path)} contains ${reference.label}`);
    }
  }
}

/**
 * @description Extracts local Markdown link targets from one document.
 * @param {string} content - Markdown source containing zero or more links.
 * @returns {string[]} Link targets that require repository resolution.
 */
function extractLocalLinks(content) {
  const targets = [];
  const linkPattern = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/gu;

  for (const match of content.matchAll(linkPattern)) {
    const target = match[1].replace(/^<|>$/gu, "");

    if (target.startsWith("#") || /^[a-z][a-z\d+.-]*:/iu.test(target)) {
      continue;
    }

    targets.push(target);
  }

  return targets;
}

/**
 * @description Verifies that local Markdown links resolve inside the repository.
 * @param {string} workspaceRoot - Absolute repository root.
 * @param {string} path - Absolute Markdown file containing the links.
 * @param {string} content - Markdown content to inspect.
 * @param {string[]} issues - Mutable issue collection populated by the check.
 * @returns {Promise<void>} Completion after all local targets are resolved.
 */
async function validateLocalLinks(workspaceRoot, path, content, issues) {
  for (const target of extractLocalLinks(content)) {
    const targetWithoutFragment = decodeURIComponent(target.split("#", 1)[0]);
    const resolvedTarget = repositoryPaths.resolve(
      repositoryPaths.dirname(path),
      targetWithoutFragment,
    );
    const escapesWorkspace = !repositoryPaths.contains(workspaceRoot, resolvedTarget);

    if (escapesWorkspace) {
      issues.push(
        `${repositoryPaths.display(workspaceRoot, path)} links outside the repository: ${target}`,
      );
    } else if (!(await repositoryFileSystem.exists(resolvedTarget))) {
      issues.push(
        `${repositoryPaths.display(workspaceRoot, path)} contains a broken local link: ${target}`,
      );
    }
  }
}

/**
 * @description Verifies the stable filename, heading, status, and index entry of each ADR.
 * @param {string} documentationRoot - Absolute canonical documentation root.
 * @param {string} workspaceRoot - Absolute repository root.
 * @param {string[]} issues - Mutable issue collection populated by the check.
 * @returns {Promise<void>} Completion after all decision records are inspected.
 */
async function validateDecisionRecords(documentationRoot, workspaceRoot, issues) {
  const decisionRoot = repositoryPaths.resolve(documentationRoot, "decisions");
  const decisionFiles = await repositoryFiles.collect(decisionRoot, (path) =>
    path.endsWith(".md"),
  );
  const decisionIndex = await repositoryFileSystem.readText(
    repositoryPaths.resolve(decisionRoot, "index.md"),
  );

  for (const path of decisionFiles) {
    const filename = repositoryPaths.display(workspaceRoot, path).split("/").at(-1);

    if (filename === "index.md" || filename === "template.md") {
      continue;
    }

    const filenameMatch = /^(\d{4})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/u.exec(filename);

    if (!filenameMatch) {
      issues.push(
        `Decision record has an invalid filename: ${repositoryPaths.display(workspaceRoot, path)}`,
      );
      continue;
    }

    const content = await repositoryFileSystem.readText(path);
    const identifier = filenameMatch[1];
    const headingPattern = new RegExp(`^# ${identifier}:\\s+\\S`, "mu");
    const statusMatch = /^Status:\s+\*\*([^*]+)\*\*$/mu.exec(content);

    if (!headingPattern.test(content)) {
      issues.push(`${repositoryPaths.display(workspaceRoot, path)} has no matching decision heading`);
    }

    if (!statusMatch || !acceptedDecisionStatuses.has(statusMatch[1])) {
      issues.push(`${repositoryPaths.display(workspaceRoot, path)} has no accepted decision status`);
    }

    if (!content.includes("## Consequences")) {
      issues.push(`${repositoryPaths.display(workspaceRoot, path)} has no consequences section`);
    }

    if (!decisionIndex.includes(`](${filename})`)) {
      issues.push(`${repositoryPaths.display(workspaceRoot, path)} is missing from the decision index`);
    }
  }
}

/**
 * @description Verifies canonical documentation for one explicit workspace.
 * @param {string} workspaceRoot - Absolute repository root to verify.
 * @returns {Promise<{ issues: string[], markdownFileCount: number }>} Verification result.
 */
export async function verifyDocumentation(workspaceRoot) {
  const documentationRoot = repositoryPaths.resolve(workspaceRoot, "docs/en");
  const issues = [];

  await validateRequiredHierarchy(documentationRoot, workspaceRoot, issues);
  await validatePackageMirroring(documentationRoot, workspaceRoot, issues);

  const markdownFiles = await repositoryFiles.collect(documentationRoot, (path) =>
    path.endsWith(".md"),
  );

  for (const path of markdownFiles) {
    const content = await repositoryFileSystem.readText(path);

    validateLocalReferences(workspaceRoot, path, content, issues);
    await validateLocalLinks(workspaceRoot, path, content, issues);
  }

  await validateDecisionRecords(documentationRoot, workspaceRoot, issues);

  return { issues, markdownFileCount: markdownFiles.length };
}

/**
 * @description Adapts documentation verification to terminal output and process exit state.
 * @returns {Promise<void>} Completion after diagnostics are printed and exit state is set.
 */
async function main() {
  const result = await verifyDocumentation(defaultWorkspaceRoot);

  if (result.issues.length > 0) {
    process.stderr.write(
      `Documentation verification failed:\n${result.issues.map((issue) => `- ${issue}`).join("\n")}\n`,
    );
    process.exitCode = 1;
    return;
  }

  process.stdout.write(
    `Documentation verification passed for ${result.markdownFileCount} canonical files.\n`,
  );
}

if (
  process.argv[1] !== undefined &&
  repositoryPaths.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await main();
}
