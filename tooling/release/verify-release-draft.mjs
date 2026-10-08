import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { ReleaseDraftVerifier } from "./runtime/release-draft.verifier.mjs";

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [intentPath, ...extra] = process.argv.slice(2);
  if (intentPath === undefined || extra.length > 0) {
    process.stderr.write("Usage: node tooling/release/verify-release-draft.mjs <intent.json>\n");
    process.exitCode = 1;
  } else {
    try {
      const intent = JSON.parse(await readFile(intentPath, "utf8"));
      const verifier = new ReleaseDraftVerifier({
        repository: process.env.GITHUB_REPOSITORY ?? "",
        token: process.env.GH_TOKEN ?? "",
        fetchResponse: fetch,
      });
      process.stdout.write(`${await verifier.verify(intent)}\n`);
    } catch (error) {
      process.stderr.write(`${error instanceof Error ? error.message : "Draft verification failed."}\n`);
      process.exitCode = 1;
    }
  }
}
