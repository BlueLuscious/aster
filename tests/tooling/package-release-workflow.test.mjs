import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("manual draft workflow keeps publication separate from approved tag and draft creation", async () => {
  const workflow = await readFile(
    new URL("../../.github/workflows/package-release.yaml", import.meta.url),
    "utf8",
  );

  assert.match(workflow, /workflow_dispatch:/u);
  assert.match(workflow, /contents: write/u);
  assert.match(
    workflow,
    /gh api --method POST "repos\/\$GITHUB_REPOSITORY\/git\/refs"/u,
  );
  assert.match(workflow, /node tooling\/release\/create-release-draft\.mjs/u);
  assert.match(workflow, /node tooling\/release\/verify-release-draft\.mjs/u);
  assert.doesNotMatch(workflow, /gh release create|--draft=false|\bpush:/u);
});
