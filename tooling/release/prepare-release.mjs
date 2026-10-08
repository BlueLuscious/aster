import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { PackageReleasePreparer } from "./runtime/package-release.preparer.mjs";

/** @description Asynchronous Git process adapter. */
const execFileAsync = promisify(execFile);

/** @description Repository root relative to this private command. */
const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

/**
 * @description Runs one read-only Git command in the repository.
 * @param {...string} args - Git arguments.
 * @returns {Promise<string>} Standard output.
 */
async function git(...args) {
  const result = await execFileAsync("git", args, {
    cwd: workspaceRoot,
    encoding: "utf8",
    maxBuffer: 2_000_000,
  });
  return result.stdout;
}

/**
 * @description Reads one canonical release-note page as UTF-8 text.
 * @param {string} path - Absolute documentation path.
 * @returns {Promise<string>} Authored Markdown content.
 */
function readText(path) {
  return readFile(path, "utf8");
}

if (
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const [slug, version, ...extra] = process.argv.slice(2);
  if (
    slug === undefined ||
    version === undefined ||
    extra.length > 1 ||
    (extra.length === 1 && extra[0] !== "--full")
  ) {
    process.stderr.write(
      "Usage: pnpm run release:prepare -- <core|icons|svg|cli> <version> [--full]\n",
    );
    process.exitCode = 1;
  } else {
    try {
      const preparer = new PackageReleasePreparer({
        workspaceRoot,
        git,
        readText,
        fetchResponse: fetch,
        githubToken: process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN ?? "",
        checkReleaseListing: extra[0] === "--full",
      });
      const intent = await preparer.prepare(slug, version);
      process.stdout.write(`${JSON.stringify(intent, null, 2)}\n`);
    } catch (error) {
      process.stderr.write(
        `${error instanceof Error ? error.message : "Release preparation failed."}\n`,
      );
      process.exitCode = 1;
    }
  }
}
