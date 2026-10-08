import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { ReleaseDraftCreator } from "./runtime/release-draft.creator.mjs";

if (
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const [intentPath, archivePath, releaseIdPath, ...extra] =
    process.argv.slice(2);
  if (
    intentPath === undefined ||
    archivePath === undefined ||
    releaseIdPath === undefined ||
    extra.length > 0
  ) {
    process.stderr.write(
      "Usage: node tooling/release/create-release-draft.mjs <intent.json> <archive.tgz> <release-id.txt>\n",
    );
    process.exitCode = 1;
  } else {
    try {
      const intent = JSON.parse(await readFile(intentPath, "utf8"));
      const archive = await readFile(archivePath);
      const creator = new ReleaseDraftCreator({
        repository: process.env.GITHUB_REPOSITORY ?? "",
        token: process.env.GH_TOKEN ?? "",
        fetchResponse: fetch,
      });
      const draft = await creator.createDraft(intent, archive);
      await writeFile(releaseIdPath, `${draft.id}\n`, { flag: "wx" });
      await creator.uploadArchive(intent, draft, archive);
      process.stdout.write(
        `${JSON.stringify({ tag: intent.tag, releaseId: draft.id })}\n`,
      );
    } catch (error) {
      process.stderr.write(
        `${error instanceof Error ? error.message : "Draft creation failed."}\n`,
      );
      process.exitCode = 1;
    }
  }
}
