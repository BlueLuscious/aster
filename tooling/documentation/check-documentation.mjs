import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

/**
 * @description Absolute path to the repository root containing the documentation command.
 */
const defaultWorkspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

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
 * @description Converts an absolute repository path into a stable display path.
 * @param {string} workspaceRoot - Absolute repository root.
 * @param {string} path - Absolute path beneath the repository root.
 * @returns {string} A slash-separated repository-relative path.
 */
function displayPath(workspaceRoot, path) {
  return relative(workspaceRoot, path).split(sep).join("/");
}

/**
 * @description Determines whether a filesystem path exists and is accessible.
 * @param {string} path - Absolute filesystem path to inspect.
 * @returns {Promise<boolean>} Whether the path exists.
 */
async function pathExists(path) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

/**
 * @description Collects files with a requested extension in deterministic order.
 * @param {string} root - Directory from which traversal starts.
 * @param {string} extension - File extension to retain.
 * @returns {Promise<string[]>} Absolute matching file paths.
 */
async function collectFiles(root, extension) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const path = resolve(root, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(path, extension)));
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      files.push(path);
    }
  }

  return files;
}

/**
 * @description Reads immediate child directory names from an optional root.
 * @param {string} root - Absolute directory whose children represent domain members.
 * @returns {Promise<string[]>} Sorted child directory names, or an empty list when absent.
 */
async function readMemberDirectories(root) {
  if (!(await pathExists(root))) {
    return [];
  }

  const entries = await readdir(root, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

/**
 * @description Verifies that canonical documentation entry points exist.
 * @param {string} documentationRoot - Absolute canonical documentation root.
 * @param {string} workspaceRoot - Absolute repository root.
 * @param {string[]} issues - Mutable issue collection populated by the check.
 * @returns {Promise<void>} Completion after every required entry is inspected.
 */
async function validateRequiredHierarchy(documentationRoot, workspaceRoot, issues) {
  for (const entry of requiredDocumentationEntries) {
    const path = resolve(documentationRoot, entry);

    if (!(await pathExists(path))) {
      issues.push(
        `Missing canonical documentation entry: ${displayPath(workspaceRoot, path)}`,
      );
    }
  }
}

/**
 * @description Verifies that package or collection documentation mirrors real members.
 * @param {string} documentationRoot - Absolute canonical documentation root.
 * @param {string} workspaceRoot - Absolute repository root.
 * @param {"packages" | "collections"} domain - Repository domain whose members are mirrored.
 * @param {string[]} issues - Mutable issue collection populated by the check.
 * @returns {Promise<void>} Completion after source and documentation members are compared.
 */
async function validateDomainMirroring(documentationRoot, workspaceRoot, domain, issues) {
  const sourceMembers = await readMemberDirectories(resolve(workspaceRoot, domain));
  const documentedMembers = await readMemberDirectories(resolve(documentationRoot, domain));

  for (const member of sourceMembers) {
    if (!documentedMembers.includes(member)) {
      issues.push(`Missing ${domain} documentation for repository member: ${member}`);
    }
  }

  for (const member of documentedMembers) {
    if (!sourceMembers.includes(member)) {
      issues.push(`Documentation describes a missing ${domain} member: ${member}`);
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
      issues.push(`${displayPath(workspaceRoot, path)} contains ${reference.label}`);
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
    const resolvedTarget = resolve(dirname(path), targetWithoutFragment);
    const relativeTarget = relative(workspaceRoot, resolvedTarget);
    const escapesWorkspace = relativeTarget === ".." || relativeTarget.startsWith(`..${sep}`);

    if (escapesWorkspace) {
      issues.push(
        `${displayPath(workspaceRoot, path)} links outside the repository: ${target}`,
      );
    } else if (!(await pathExists(resolvedTarget))) {
      issues.push(
        `${displayPath(workspaceRoot, path)} contains a broken local link: ${target}`,
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
  const decisionRoot = resolve(documentationRoot, "decisions");
  const decisionFiles = await collectFiles(decisionRoot, ".md");
  const decisionIndex = await readFile(resolve(decisionRoot, "index.md"), "utf8");

  for (const path of decisionFiles) {
    const filename = displayPath(workspaceRoot, path).split("/").at(-1);

    if (filename === "index.md" || filename === "template.md") {
      continue;
    }

    const filenameMatch = /^(\d{4})-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/u.exec(filename);

    if (!filenameMatch) {
      issues.push(
        `Decision record has an invalid filename: ${displayPath(workspaceRoot, path)}`,
      );
      continue;
    }

    const content = await readFile(path, "utf8");
    const identifier = filenameMatch[1];
    const headingPattern = new RegExp(`^# ${identifier}:\\s+\\S`, "mu");
    const statusMatch = /^Status:\s+\*\*([^*]+)\*\*$/mu.exec(content);

    if (!headingPattern.test(content)) {
      issues.push(`${displayPath(workspaceRoot, path)} has no matching decision heading`);
    }

    if (!statusMatch || !acceptedDecisionStatuses.has(statusMatch[1])) {
      issues.push(`${displayPath(workspaceRoot, path)} has no accepted decision status`);
    }

    if (!content.includes("## Consequences")) {
      issues.push(`${displayPath(workspaceRoot, path)} has no consequences section`);
    }

    if (!decisionIndex.includes(`](${filename})`)) {
      issues.push(`${displayPath(workspaceRoot, path)} is missing from the decision index`);
    }
  }
}

/**
 * @description Verifies canonical documentation for one explicit workspace.
 * @param {string} workspaceRoot - Absolute repository root to verify.
 * @returns {Promise<{ issues: string[], markdownFileCount: number }>} Verification result.
 */
export async function verifyDocumentation(workspaceRoot) {
  const documentationRoot = resolve(workspaceRoot, "docs/en");
  const issues = [];

  await validateRequiredHierarchy(documentationRoot, workspaceRoot, issues);
  await validateDomainMirroring(documentationRoot, workspaceRoot, "packages", issues);
  await validateDomainMirroring(documentationRoot, workspaceRoot, "collections", issues);

  const markdownFiles = await collectFiles(documentationRoot, ".md");

  for (const path of markdownFiles) {
    const content = await readFile(path, "utf8");

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
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await main();
}
