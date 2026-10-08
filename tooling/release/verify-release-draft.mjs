import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { ReleaseDraftVerifier } from "./runtime/release-draft.verifier.mjs";

if (
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const [intentPath, releaseIdPath, ...extra] = process.argv.slice(2);
  if (
    intentPath === undefined ||
    releaseIdPath === undefined ||
    extra.length > 0
  ) {
    process.stderr.write(
      "Usage: node tooling/release/verify-release-draft.mjs <intent.json> <release-id.txt>\n",
    );
    process.exitCode = 1;
  } else {
    try {
      const intent = JSON.parse(await readFile(intentPath, "utf8"));
      const releaseId = Number((await readFile(releaseIdPath, "utf8")).trim());
      const verifier = new ReleaseDraftVerifier({
        repository: process.env.GITHUB_REPOSITORY ?? "",
        token: process.env.GH_TOKEN ?? "",
        fetchResponse: fetch,
      });
      process.stdout.write(`${await verifier.verify(intent, releaseId)}\n`);
    } catch (error) {
      process.stderr.write(
        `${error instanceof Error ? error.message : "Draft verification failed."}\n`,
      );
      process.exitCode = 1;
    }
  }
}
