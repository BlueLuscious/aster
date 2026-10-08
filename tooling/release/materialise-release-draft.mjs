import { appendFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { ReleaseDraftMaterialiser } from "./runtime/release-draft.materialiser.mjs";

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [intentPath, outputDirectory, approvedSource, approvedSha256, approvedIntentSha256, ...extra] = process.argv.slice(2);
  if (
    intentPath === undefined || outputDirectory === undefined || approvedSource === undefined ||
    approvedSha256 === undefined || approvedIntentSha256 === undefined || extra.length > 0
  ) {
    process.stderr.write("Usage: node tooling/release/materialise-release-draft.mjs <intent.json> <output-directory> <source-commit> <archive-sha256> <intent-sha256>\n");
    process.exitCode = 1;
  } else {
    try {
      const intent = JSON.parse(await readFile(intentPath, "utf8"));
      const files = await new ReleaseDraftMaterialiser(fetch).materialise(
        intent,
        approvedSource,
        approvedSha256,
        approvedIntentSha256,
        outputDirectory,
      );
      if (process.env.GITHUB_OUTPUT) {
        await appendFile(process.env.GITHUB_OUTPUT, [
          `tag=${files.tag}`,
          `title=${files.title}`,
          `source=${files.sourceCommit}`,
          `notes=${files.notesPath}`,
          `archive=${files.archivePath}`,
          "",
        ].join("\n"));
      }
      process.stdout.write(`${JSON.stringify(files, null, 2)}\n`);
    } catch (error) {
      process.stderr.write(`${error instanceof Error ? error.message : "Draft materialisation failed."}\n`);
      process.exitCode = 1;
    }
  }
}
