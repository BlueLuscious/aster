import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import process from "node:process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const executablePath = fileURLToPath(
  new URL("../../dist/shell/aster.js", import.meta.url),
);
const packageRootUrl = new URL("../../", import.meta.url);

function run(arguments_) {
  return spawnSync(process.execPath, [executablePath, ...arguments_], {
    cwd: fileURLToPath(packageRootUrl),
    encoding: "utf8",
  });
}

test("renders default and selected human help without loading shell state", () => {
  const complete = run([]);
  const selected = run(["help", "show"]);

  assert.equal(complete.status, 0);
  assert.equal(complete.stderr, "");
  assert.match(complete.stdout, /^Aster commands:\n/u);
  assert.match(complete.stdout, /aster list catalogues/u);
  assert.match(complete.stdout, /--json  Emit one JSON result document\./u);
  assert.equal(selected.status, 0);
  assert.equal(selected.stderr, "");
  assert.match(selected.stdout, /^Aster commands:\n  show:/u);
  assert.doesNotMatch(selected.stdout, /  list:/u);
});

test("renders list, search, show, and version as deterministic human text", () => {
  const listed = run(["list", "catalogues"]);
  const searched = run(["search", "photo"]);
  const shown = run(["show", "icon", "aster/camera"]);
  const version = run(["version"]);

  assert.equal(listed.status, 0);
  assert.equal(listed.stdout, "Catalogues:\n  aster (16 icons, 1 collection)\n");
  assert.match(searched.stdout, /^Results:\n  icon: aster\/camera/u);
  assert.match(shown.stdout, /^Icon: aster\/camera\nCatalogue: aster/u);
  assert.match(shown.stdout, /Collections: aster\n/u);
  assert.equal(version.stdout, "Aster 0.0.0\n");

  for (const execution of [listed, searched, shown, version]) {
    assert.equal(execution.status, 0);
    assert.equal(execution.stderr, "");
  }
});

test("renders one icon directly and one collection as a JSON export plan", () => {
  const icon = run(["export", "icon", "aster/camera"]);
  const collection = run(["export", "collection", "aster", "--json"]);

  assert.equal(icon.status, 0);
  assert.equal(icon.stderr, "");
  assert.match(icon.stdout, /^<svg /u);
  assert.equal(collection.status, 0);
  assert.equal(collection.stderr, "");

  const result = JSON.parse(collection.stdout);
  assert.equal(result.ok, true);
  assert.equal(result.payload.kind, "export");
  assert.equal(result.payload.plan.artefacts.length, 16);
});

test("emits one stable JSON success document without terminal styling", () => {
  const first = run(["list", "icons", "--tag", "photo", "--json"]);
  const second = run(["--json", "list", "icons", "--tag", "photo"]);

  assert.equal(first.status, 0);
  assert.equal(first.stderr, "");
  assert.equal(first.stdout, second.stdout);
  assert.equal(first.stdout.split("\n").length, 2);
  assert.doesNotMatch(first.stdout, /\u001b\[/u);

  const result = JSON.parse(first.stdout);
  assert.equal(result.ok, true);
  assert.equal(result.payload.kind, "icon-list");
  assert.deepEqual(
    result.payload.icons.map((icon) => icon.identity.name),
    ["camera"],
  );
});

test("maps human usage and lookup failures to stderr and documented status", () => {
  const usage = run(["list", "icons", "--catalogue"]);
  const missing = run(["show", "icon", "aster/missing"]);

  assert.equal(usage.status, 2);
  assert.equal(usage.stdout, "");
  assert.match(usage.stderr, /^\[ASTER-CLI-001\]/u);
  assert.equal(missing.status, 1);
  assert.equal(missing.stdout, "");
  assert.match(missing.stderr, /^\[ASTER-CLI-004\]/u);
});

test("maps expected JSON failures to stdout only", () => {
  const usage = run(["unknown", "--json"]);
  const missing = run([
    "show",
    "collection",
    "missing",
    "--json",
  ]);

  assert.equal(usage.status, 2);
  assert.equal(usage.stderr, "");
  assert.equal(JSON.parse(usage.stdout).diagnostic.category, "usage");
  assert.equal(missing.status, 1);
  assert.equal(missing.stderr, "");
  assert.equal(JSON.parse(missing.stdout).diagnostic.category, "not-found");
});

test("rejects repeated, unknown, and extra shell arguments", () => {
  const repeatedJson = run(["version", "--json", "--json"]);
  const repeatedFilter = run([
    "list",
    "icons",
    "--catalogue",
    "aster",
    "--catalogue",
    "aster",
  ]);
  const extra = run(["search", "camera", "extra"]);

  assert.equal(repeatedJson.status, 2);
  assert.equal(repeatedFilter.status, 2);
  assert.equal(extra.status, 2);
});

test("imports the built programmatic root without executing the shell", () => {
  const imported = spawnSync(
    process.execPath,
    ["--input-type=module", "--eval", 'await import("@aster/cli");'],
    {
      cwd: fileURLToPath(packageRootUrl),
      encoding: "utf8",
    },
  );

  assert.equal(imported.status, 0);
  assert.equal(imported.stdout, "");
  assert.equal(imported.stderr, "");
});
