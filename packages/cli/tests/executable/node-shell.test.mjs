import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  closeSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import process from "node:process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const executablePath = fileURLToPath(
  new URL("../../dist/shell/aster.js", import.meta.url),
);
const packageRootUrl = new URL("../../", import.meta.url);

function run(arguments_, options = {}) {
  return spawnSync(process.execPath, [executablePath, ...arguments_], {
    cwd: fileURLToPath(packageRootUrl),
    encoding: "utf8",
    ...options,
  });
}

test("renders default and selected human help without loading shell state", () => {
  const complete = run([]);
  const selected = run(["help", "show"]);

  assert.equal(complete.status, 0);
  assert.equal(complete.stderr, "");
  assert.match(complete.stdout, /^Aster commands:\n/u);
  assert.match(complete.stdout, /aster list catalogues/u);
  assert.match(complete.stdout, /--output <root>/u);
  assert.match(complete.stdout, /--stroke-width <number>/u);
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

test("renders standalone options and one collection as a JSON export plan", () => {
  const icon = run([
    "export",
    "icon",
    "aster/camera",
    "--size",
    "32",
    "--colour",
    "#00ff00",
    "--direction",
    "rtl",
    "--label",
    "Camera",
    "--title",
    "Camera icon",
  ]);
  const collection = run(["export", "collection", "aster", "--json"]);

  assert.equal(icon.status, 0);
  assert.equal(icon.stderr, "");
  assert.match(icon.stdout, /^<svg /u);
  assert.match(icon.stdout, /width="32"/u);
  assert.match(icon.stdout, /color="#00ff00"/u);
  assert.match(icon.stdout, /aria-label="Camera"/u);
  assert.match(icon.stdout, /<title>Camera icon<\/title>/u);
  assert.equal(collection.status, 0);
  assert.equal(collection.stderr, "");

  const result = JSON.parse(collection.stdout);
  assert.equal(result.ok, true);
  assert.equal(result.payload.kind, "export");
  assert.equal(result.payload.plan.artefacts.length, 16);
});

test("delegates accepted presentation overrides to icon policy", () => {
  const execution = run([
    "export",
    "icon",
    "aster/camera",
    "--fill",
    "none",
    "--stroke",
    "currentColor",
    "--stroke-width",
    "2",
  ]);

  assert.equal(execution.status, 1);
  assert.equal(execution.stdout, "");
  assert.match(execution.stderr, /^\[ASTER-CLI-007\]/u);
  assert.doesNotMatch(execution.stderr, /unknown option|requires a value/u);
});

test("publishes icon and collection plans relative to the explicit process directory", () => {
  const root = mkdtempSync(join(tmpdir(), "aster-cli-shell-output-"));

  try {
    const icon = run(
      ["export", "icon", "aster/camera", "--output", "exports/icon"],
      { cwd: root },
    );
    const collection = run(
      ["export", "collection", "aster", "--output", "exports/collection"],
      { cwd: root },
    );

    assert.equal(icon.status, 0);
    assert.equal(icon.stderr, "");
    assert.equal(
      icon.stdout,
      `Exported 1 SVG artefact to ${resolve(root, "exports/icon")}\n`,
    );
    assert.equal(collection.status, 0);
    assert.equal(collection.stderr, "");
    assert.equal(
      collection.stdout,
      `Exported 16 SVG artefacts to ${resolve(root, "exports/collection")}\n`,
    );
    assert.match(
      readFileSync(resolve(root, "exports/icon/aster/camera.svg"), "utf8"),
      /^<svg /u,
    );
    assert.equal(
      readFileSync(
        resolve(root, "exports/collection/aster/camera.svg"),
        "utf8",
      ),
      readFileSync(resolve(root, "exports/icon/aster/camera.svg"), "utf8"),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("maps output conflicts and filesystem failures to reserved diagnostics", () => {
  const root = mkdtempSync(join(tmpdir(), "aster-cli-shell-failure-"));

  try {
    mkdirSync(resolve(root, "existing"));
    writeFileSync(resolve(root, "blocker"), "not a directory", "utf8");

    const conflict = run(
      ["export", "icon", "aster/camera", "--output", "existing"],
      { cwd: root },
    );
    const failure = run(
      ["export", "icon", "aster/camera", "--output", "blocker/output"],
      { cwd: root },
    );

    assert.equal(conflict.status, 1);
    assert.equal(conflict.stdout, "");
    assert.equal(
      conflict.stderr,
      "[ASTER-CLI-009] output root already exists\n",
    );
    assert.equal(failure.status, 1);
    assert.equal(failure.stdout, "");
    assert.equal(
      failure.stderr,
      "[ASTER-CLI-010] output publication failed\n",
    );
    assert.doesNotMatch(failure.stderr, /ENOTDIR|blocker/u);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("keeps JSON and output mutually exclusive before filesystem mutation", () => {
  const root = mkdtempSync(join(tmpdir(), "aster-cli-shell-exclusive-"));

  try {
    const execution = run(
      [
        "export",
        "icon",
        "aster/camera",
        "--output",
        "result",
        "--json",
      ],
      { cwd: root },
    );

    assert.equal(execution.status, 2);
    assert.equal(execution.stderr, "");
    assert.equal(JSON.parse(execution.stdout).diagnostic.category, "usage");
    assert.equal(JSON.parse(execution.stdout).diagnostic.code, "ASTER-CLI-001");
    assert.throws(() => readFileSync(resolve(root, "result")));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("writes raw icon SVG through ordinary stdout redirection", () => {
  const root = mkdtempSync(join(tmpdir(), "aster-cli-shell-redirection-"));
  const destination = resolve(root, "camera.svg");
  const descriptor = openSync(destination, "w");

  try {
    const execution = run(
      ["export", "icon", "aster/camera"],
      { cwd: root, stdio: ["ignore", descriptor, "pipe"] },
    );
    closeSync(descriptor);

    assert.equal(execution.status, 0);
    assert.equal(execution.stderr, "");
    assert.match(readFileSync(destination, "utf8"), /^<svg .*<\/svg>\n$/u);
  } finally {
    try {
      closeSync(descriptor);
    } catch {
      // The descriptor was already closed after a successful spawn.
    }
    rmSync(root, { recursive: true, force: true });
  }
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
  const collectionWithoutMode = run(["export", "collection", "aster"]);
  const collectionLabel = run([
    "export",
    "collection",
    "aster",
    "--label",
    "Collection",
    "--json",
  ]);
  const repeatedOutput = run([
    "export",
    "icon",
    "aster/camera",
    "--output",
    "first",
    "--output",
    "second",
  ]);
  const incomplete = run(["export", "icon", "aster/camera", "--size"]);
  const emptyOutput = run([
    "export",
    "icon",
    "aster/camera",
    "--output",
    "",
  ]);
  const invalidNumber = run([
    "export",
    "icon",
    "aster/camera",
    "--size",
    "0x20",
  ]);
  const invalidDomain = run([
    "export",
    "icon",
    "aster/camera",
    "--size",
    "0",
  ]);

  assert.equal(repeatedJson.status, 2);
  assert.equal(repeatedFilter.status, 2);
  assert.equal(extra.status, 2);
  assert.equal(collectionWithoutMode.status, 2);
  assert.equal(collectionLabel.status, 2);
  assert.equal(repeatedOutput.status, 2);
  assert.equal(incomplete.status, 2);
  assert.equal(emptyOutput.status, 2);
  assert.equal(invalidNumber.status, 2);
  assert.equal(invalidDomain.status, 2);
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
