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
import { join, relative, resolve } from "node:path";
import process from "node:process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { NodeShell } from "../../dist/shell/runtime/node-shell.js";
import {
  AsterCollectionLoaders,
  AsterIconLoaders,
} from "@luscious-garden/aster-icons/dynamic";

const asterIconDefinitions = await Promise.all(
  Object.values(AsterIconLoaders).map((loader) => {
    assert.ok(loader);
    return loader();
  }),
);
const asterCollectionDefinitions = await Promise.all(
  Object.values(AsterCollectionLoaders).map((loader) => {
    assert.ok(loader);
    return loader();
  }),
);

const executablePath = fileURLToPath(
  new URL("../../dist/shell/aster.js", import.meta.url),
);
const packageRootUrl = new URL("../../", import.meta.url);
const packageVersion = JSON.parse(
  readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
).version;
assert.ok(asterIconDefinitions.length > 0, "Expected the executable icon family to be non-empty.");
assert.ok(
  asterCollectionDefinitions.length > 0,
  "Expected the executable collection family to be non-empty.",
);
const representativeCollection = asterCollectionDefinitions.find(
  (collection) => collection.members.length > 0,
);
assert.ok(
  representativeCollection,
  "Expected one non-empty collection for executable conformance.",
);
const representativeIcon = representativeCollection.members[0];
assert.ok(representativeIcon, "Expected one representative collection member.");
const representativeCollectionIdentity = `${
  representativeCollection.identity.namespace === undefined
    ? ""
    : `${representativeCollection.identity.namespace}/`
}${representativeCollection.identity.name}`;
const representativeCollectionDisplayName =
  representativeCollection.metadata.displayName;
const representativeName = representativeIcon.identity.name;
const representativeIdentity = `${
  representativeIcon.identity.namespace === undefined
    ? ""
    : `${representativeIcon.identity.namespace}/`
}${representativeName}@${representativeIcon.identity.variant}`;
const representativeDisplayName = representativeIcon.metadata.displayName;
const representativePath = `${representativeIdentity}.svg`;
const representativeMemberships = asterCollectionDefinitions
  .filter((collection) => collection.members.includes(representativeIcon))
  .map((collection) => `${
    collection.identity.namespace === undefined
      ? ""
      : `${collection.identity.namespace}/`
  }${collection.identity.name}`)
  .sort((left, right) => left.localeCompare(right));
const taggedIcon = asterIconDefinitions.find(
  (icon) => (icon.metadata.tags?.length ?? 0) > 0,
);
assert.ok(taggedIcon, "Expected one tagged icon for executable filtering.");
const representativeTag = taggedIcon.metadata.tags?.[0];
assert.ok(representativeTag, "Expected one representative icon tag.");
const expectedTaggedIconNames = asterIconDefinitions
  .filter((icon) => icon.metadata.tags?.includes(representativeTag))
  .map((icon) => icon.identity.name)
  .sort((left, right) => left.localeCompare(right));

function run(arguments_, options = {}) {
  return spawnSync(process.execPath, [executablePath, ...arguments_], {
    cwd: fileURLToPath(packageRootUrl),
    encoding: "utf8",
    ...options,
  });
}

test("does not acquire publication or version intent from inherited host fields", async () => {
  const root = mkdtempSync(join(tmpdir(), "aster-cli-shell-inherited-"));
  try {
    const shell = new NodeShell("Aster", packageVersion, root, new URL("../../dist/shell/aster.js", import.meta.url));
    const cases = [
      ["version", "--json"],
      ["export", "icon", representativeIdentity, "--json"],
      ["review", "collection", representativeCollectionIdentity, "--json"],
    ];
    const expected = [];
    for (const arguments_ of cases) {
      const result = await shell.execute(arguments_);
      assert.equal(result.exitCode, 0);
      expected.push(result);
    }
    for (const field of ["output", "replace", "scope", "dependencies", "location"]) {
      const previous = Object.getOwnPropertyDescriptor(Object.prototype, field);
      let reads = 0;
      const actual = [];
      try {
        Object.defineProperty(Object.prototype, field, {
          configurable: true,
          get() { reads += 1; throw new Error(`Unexpected inherited ${field}`); },
        });
        for (const arguments_ of cases) {
          actual.push(await shell.execute(arguments_));
        }
      } finally {
        if (previous === undefined) {
          Reflect.deleteProperty(Object.prototype, field);
        } else {
          Object.defineProperty(Object.prototype, field, previous);
        }
      }
      assert.equal(reads, 0, field);
      assert.deepEqual(actual, expected, field);
    }
  } finally {
    assert.match(relative(resolve(tmpdir()), resolve(root)), /^aster-cli-shell-inherited-[^\\/]+$/u);
    rmSync(root, { recursive: true, force: true });
  }
});

test("renders default and selected human help without loading shell state", () => {
  const complete = run([]);
  const selected = run(["help", "show"]);

  assert.equal(complete.status, 0);
  assert.equal(complete.stderr, "");
  assert.match(complete.stdout, /^Aster commands:\n/u);
  assert.match(complete.stdout, /aster list catalogues/u);
  assert.match(complete.stdout, /--output <root>/u);
  assert.match(complete.stdout, /--replace/u);
  assert.match(complete.stdout, /--stroke-width <number>/u);
  assert.match(complete.stdout, /--json  Emit one JSON result document\./u);
  assert.equal(selected.status, 0);
  assert.equal(selected.stderr, "");
  assert.match(selected.stdout, /^Aster commands:\n  show:/u);
  assert.doesNotMatch(selected.stdout, /  list:/u);
});

test("exposes version and review help through the standalone parser", () => {
  for (const command of ["version", "review"]) {
    const result = run(["help", command]);
    assert.equal(result.status, 0);
    assert.equal(result.stderr, "");
    assert.match(result.stdout, new RegExp(`^Aster commands:\\n  ${command}:`, "u"));
    if (command === "version") {
      assert.match(result.stdout, /aster version cli \[--deps\] \[--location\]/u);
    }
  }
});

test("discovers glyph families and explicit treatments through human and JSON executable output", () => {
  const glyphIdentity = representativeIdentity.split("@")[0];
  const listed = run(["list", "glyphs"]);
  assert.equal(listed.status, 0);
  assert.equal(listed.stderr, "");
  assert.match(listed.stdout, /^Glyphs:\n/u);
  assert.ok(listed.stdout.includes(`${glyphIdentity} [aster] (`));
  const shown = run(["show", "glyph", glyphIdentity]);
  assert.equal(shown.status, 0);
  assert.equal(shown.stderr, "");
  assert.ok(shown.stdout.startsWith(`Glyph: ${glyphIdentity}\nCatalogue: aster\nVariants:\n`));
  assert.ok(shown.stdout.includes(`  ${representativeIdentity} [aster] - ${representativeDisplayName}`));
  const family = run(["show", "glyph", glyphIdentity, "--catalogue", "aster", "--json"]);
  const filtered = run(["list", "icons", "--glyph", glyphIdentity, "--json"]);
  const listJson = run(["list", "glyphs", "--json"]);
  for (const result of [family, filtered, listJson]) {
    assert.equal(result.status, 0);
    assert.equal(result.stderr, "");
    assert.ok(result.stdout.endsWith("\n"));
  }
  const glyph = JSON.parse(family.stdout).payload.glyph;
  assert.equal(JSON.parse(family.stdout).payload.kind, "glyph-show");
  assert.deepEqual(JSON.parse(filtered.stdout).payload.icons, glyph.variants);
  assert.deepEqual(JSON.parse(listJson.stdout).payload.glyphs.find((entry) =>
    entry.identity.name === glyph.identity.name && entry.identity.namespace === glyph.identity.namespace), glyph);
  const absent = run(["list", "icons", "--glyph", glyphIdentity, "--tag", "nonexistent-fixture-tag"]);
  assert.equal(absent.status, 0);
  assert.equal(absent.stderr, "");
  assert.equal(absent.stdout, "Icons:\n  (none)\n");
});

test("rejects unsupported glyph argv forms without falling back to a concrete treatment", () => {
  for (const argv of [
    ["list", "glyphs", "--tag", "camera"],
    ["list", "glyphs", "--collection", "amellus"],
    ["list", "glyphs", "--glyph", "aster/camera"],
    ["list", "collections", "--glyph", "aster/camera"],
    ["list", "catalogues", "--glyph", "aster/camera"],
    ["search", "camera", "--glyph", "aster/camera"],
    ["list", "icons", "--glyph"],
    ["list", "icons", "--glyph", "aster/camera", "--glyph", "aster/camera"],
    ["list", "glyphs", "--catalogue", "aster", "--catalogue", "aster"],
    ["show", "glyph"], ["show", "glyph", "aster/camera", "extra"],
    ["show", "glyph", "aster/camera", "--collection", "amellus"],
    ["show", "glyph", "aster/camera@outline"], ["show", "glyph", "aster/camera/outline"],
    ["list", "icons", "--glyph", "aster/camera@outline"],
    ["export", "glyph", "aster/camera"], ["review", "glyph", "aster/camera"],
    ...["show", "export", "review"].map((command) => [command, "icon", "aster/camera"]),
  ]) {
    const result = run([...argv, "--json"]);
    assert.equal(result.status, 2, argv.join(" "));
    assert.equal(result.stderr, "");
    const value = JSON.parse(result.stdout);
    assert.equal(value.ok, false);
    assert.equal(value.diagnostic.code, "ASTER-CLI-001");
    if (argv[1] === "icon") {assert.match(value.diagnostic.message, /name@variant.*show glyph/u);}
  }
  for (const argv of [
    ["show", "glyph", "aster/absent"], ["show", "glyph", "camera"],
    ["list", "icons", "--glyph", "aster/absent", "--tag", "nothing"],
    ["list", "glyphs", "--catalogue", "absent"], ["show", "icon", "aster/camera@absent"],
  ]) {
    const result = run([...argv, "--json"]);
    assert.equal(result.status, 1, argv.join(" "));
    assert.equal(result.stderr, "");
    assert.equal(JSON.parse(result.stdout).diagnostic.code, "ASTER-CLI-004");
  }
});

test("describes glyph grammar through command-specific help", () => {
  const list = run(["help", "list"]);
  const show = run(["help", "show"]);
  assert.equal(list.status, 0);
  assert.equal(show.status, 0);
  assert.match(list.stdout, /aster list glyphs \[--catalogue <provider>\]/u);
  assert.match(list.stdout, /aster list icons.*\[--glyph <identity>\]/u);
  assert.match(show.stdout, /aster show glyph <identity>/u);
});

test("keeps the executable CLI version distinct from named package queries", () => {
  const plain = run(["version"]);
  const plainJson = run(["version", "--json"]);
  const named = run(["version", "cli"]);
  const namedJson = run(["version", "cli", "--json"]);

  assert.equal(plain.stdout, `Aster ${packageVersion}\n`);
  assert.deepEqual(JSON.parse(plainJson.stdout), {
    ok: true,
    command: "version",
    payload: { kind: "version", productName: "Aster", productVersion: packageVersion },
  });
  assert.equal(named.stdout, `@luscious-garden/aster-cli ${packageVersion}\n`);
  assert.deepEqual(JSON.parse(namedJson.stdout).payload, {
    kind: "package-versions",
    source: "cli",
    packages: [{ name: "@luscious-garden/aster-cli", version: packageVersion }],
  });

  for (const result of [plain, plainJson, named, namedJson]) {
    assert.equal(result.status, 0);
    assert.equal(result.stderr, "");
  }
});

test("rejects invalid and mixed version selectors as usage failures", () => {
  for (const argv of [
    ["version", "import"],
    ["version", "Core"],
    ["version", "--all", "core"],
    ["version", "core", "--all"],
    ["version", "--all", "--all"],
    ["version", "--package", "core"],
    ["version", "cli", "--deps", "--deps"],
    ["version", "cli", "--location", "--location"],
    ["version", "core", "--location"],
    ["version", "--all", "--location"],
    ["version", "core", "--deps", "--location"],
    ["version", "cli", "--all"],
  ]) {
    const result = run(argv);
    assert.equal(result.status, 2);
    assert.equal(result.stdout, "");
    assert.match(result.stderr, /^\[ASTER-CLI-001\]/u);
  }

  const json = run(["version", "import", "--json"]);
  assert.equal(json.status, 2);
  assert.equal(json.stderr, "");
  assert.equal(JSON.parse(json.stdout).diagnostic.code, "ASTER-CLI-001");

  const invalidLocation = run(["version", "core", "--location", "--json"]);
  assert.equal(invalidLocation.status, 2);
  assert.equal(invalidLocation.stderr, "");
  assert.equal(JSON.parse(invalidLocation.stdout).diagnostic.code, "ASTER-CLI-001");
});

test("renders list, search, show, and version as deterministic human text", () => {
  const listed = run(["list", "catalogues"]);
  const searched = run(["search", representativeIdentity]);
  const shown = run(["show", "icon", representativeIdentity]);
  const version = run(["version"]);

  assert.equal(listed.status, 0);
  assert.equal(
    listed.stdout,
    `Catalogues:\n  aster (${asterIconDefinitions.length} icons, ${asterCollectionDefinitions.length} ${asterCollectionDefinitions.length === 1 ? "collection" : "collections"})\n`,
  );
  assert.match(
    searched.stdout,
    new RegExp(`^Results:\\n  icon: ${representativeIdentity}`, "u"),
  );
  assert.match(
    shown.stdout,
    new RegExp(`^Icon: ${representativeIdentity}\\nCatalogue: aster`, "u"),
  );
  assert.ok(
    shown.stdout.includes(`Collections: ${representativeMemberships.join(", ")}\n`),
  );
  assert.equal(version.stdout, `Aster ${packageVersion}\n`);

  for (const execution of [listed, searched, shown, version]) {
    assert.equal(execution.status, 0);
    assert.equal(execution.stderr, "");
  }
});

test("renders standalone options and one collection as a JSON export plan", () => {
  const icon = run([
    "export",
    "icon",
    representativeIdentity,
    "--size",
    "32",
    "--colour",
    "#00FF00",
    "--direction",
    "rtl",
    "--label",
    representativeDisplayName,
    "--title",
    `${representativeDisplayName} icon`,
  ]);
  const collection = run([
    "export",
    "collection",
    representativeCollectionIdentity,
    "--json",
  ]);

  assert.equal(icon.status, 0);
  assert.equal(icon.stderr, "");
  assert.match(icon.stdout, /^<svg /u);
  assert.match(icon.stdout, /width="32"/u);
  assert.match(icon.stdout, /color="#00ff00"/u);
  assert.match(
    icon.stdout,
    new RegExp(`aria-label="${representativeDisplayName}"`, "u"),
  );
  assert.match(
    icon.stdout,
    new RegExp(`<title>${representativeDisplayName} icon</title>`, "u"),
  );
  assert.equal(collection.status, 0);
  assert.equal(collection.stderr, "");

  const result = JSON.parse(collection.stdout);
  assert.equal(result.ok, true);
  assert.equal(result.payload.kind, "export");
  assert.equal(
    result.payload.plan.artefacts.length,
    representativeCollection.members.length,
  );
});

test("delegates accepted presentation overrides to icon policy", () => {
  const execution = run([
    "export",
    "icon",
    representativeIdentity,
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
      ["export", "icon", representativeIdentity, "--output", "exports/icon"],
      { cwd: root },
    );
    const collection = run(
      [
        "export",
        "collection",
        representativeCollectionIdentity,
        "--output",
        "exports/collection",
      ],
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
      `Exported ${representativeCollection.members.length} SVG artefacts to ${resolve(root, "exports/collection")}\n`,
    );
    assert.match(
      readFileSync(resolve(root, `exports/icon/${representativePath}`), "utf8"),
      /^<svg /u,
    );
    assert.equal(
      readFileSync(
        resolve(root, `exports/collection/${representativePath}`),
        "utf8",
      ),
      readFileSync(resolve(root, `exports/icon/${representativePath}`), "utf8"),
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
      ["export", "icon", representativeIdentity, "--output", "existing"],
      { cwd: root },
    );
    const failure = run(
      ["export", "icon", representativeIdentity, "--output", "blocker/output"],
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
        representativeIdentity,
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

test("publishes static reviews to default and explicit output roots", () => {
  const root = mkdtempSync(join(tmpdir(), "aster-cli-shell-review-"));

  try {
    const planned = run([
      "review",
      "icon",
      representativeIdentity,
      "--json",
    ], { cwd: root });
    const published = run([
      "review",
      "collection",
      representativeCollectionIdentity,
      "--output",
      "review-site",
    ], { cwd: root });

    assert.equal(planned.status, 0);
    assert.equal(planned.stderr, "");
    const result = JSON.parse(planned.stdout);
    assert.equal(result.ok, true);
    assert.equal(result.payload.kind, "review");
    assert.equal(result.payload.plan.target, "html");
    assert.equal(result.payload.plan.document.kind, "icon");

    const defaulted = run([
      "review",
      "icon",
      representativeIdentity,
    ], { cwd: root });

    assert.equal(published.status, 0);
    assert.equal(published.stderr, "");
    assert.equal(
      published.stdout,
      `Published Aster review to ${resolve(root, "review-site")}\n`,
    );
    const collectionReview = readFileSync(
      resolve(root, "review-site/index.html"),
      "utf8",
    );
    assert.ok(
      collectionReview.includes(`<h1>${representativeCollectionDisplayName}</h1>`),
    );
    assert.match(collectionReview, /id="contact-sheet"/u);
    assert.equal(defaulted.status, 0);
    assert.equal(
      defaulted.stdout,
      `Published Aster review to ${resolve(root, "aster-review")}\n`,
    );
    assert.match(
      readFileSync(resolve(root, "aster-review/index.html"), "utf8"),
      new RegExp(`<h1>${representativeDisplayName}</h1>`, "u"),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("replaces only explicitly owned static review output", () => {
  const root = mkdtempSync(join(tmpdir(), "aster-cli-shell-review-replace-"));

  try {
    const initial = run([
      "review",
      "icon",
      representativeIdentity,
      "--output",
      "review-site",
    ], { cwd: root });
    const conflict = run([
      "review",
      "collection",
      representativeCollectionIdentity,
      "--output",
      "review-site",
    ], { cwd: root });
    const replaced = run([
      "review",
      "collection",
      representativeCollectionIdentity,
      "--output",
      "review-site",
      "--replace",
    ], { cwd: root });

    assert.equal(initial.status, 0);
    assert.equal(conflict.status, 1);
    assert.equal(
      conflict.stderr,
      "[ASTER-CLI-009] output root already exists\n",
    );
    assert.equal(replaced.status, 0);
    assert.equal(replaced.stderr, "");
    assert.equal(
      replaced.stdout,
      `Replaced Aster review at ${resolve(root, "review-site")}\n`,
    );
    assert.ok(
      readFileSync(resolve(root, "review-site/index.html"), "utf8").includes(
        `<h1>${representativeCollectionDisplayName}</h1>`,
      ),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("writes raw icon SVG through ordinary stdout redirection", () => {
  const root = mkdtempSync(join(tmpdir(), "aster-cli-shell-redirection-"));
  const destination = resolve(root, `${representativeName}.svg`);
  const descriptor = openSync(destination, "w");

  try {
    const execution = run(
      ["export", "icon", representativeIdentity],
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
  const first = run(["list", "icons", "--tag", representativeTag, "--json"]);
  const second = run(["--json", "list", "icons", "--tag", representativeTag]);

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
    expectedTaggedIconNames,
  );
});

test("maps human usage and lookup failures to stderr and documented status", () => {
  const usage = run(["list", "icons", "--catalogue"]);
  const untreated = run(["show", "icon", "aster/camera"]);
  const missing = run(["show", "icon", "aster/missing@outline"]);

  assert.equal(usage.status, 2);
  assert.equal(usage.stdout, "");
  assert.match(usage.stderr, /^\[ASTER-CLI-001\]/u);
  assert.equal(untreated.status, 2);
  assert.equal(untreated.stdout, "");
  assert.match(untreated.stderr, /^\[ASTER-CLI-001\]/u);
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

test("labels exact lookup details in human stderr and retains the typed compact JSON evidence", () => {
  const cases = [
    [
      ["show", "icon", "missing@outline"],
      "identity",
      "missing@outline",
      "icon",
      "Icon",
    ],
    [
      ["show", "icon", "aster/missing@outline"],
      "identity",
      "aster/missing@outline",
      "icon",
      "Icon",
    ],
    [
      ["show", "glyph", "aster/missing"],
      "identity",
      "aster/missing",
      "glyph",
      "Glyph",
    ],
    [
      ["show", "collection", "missing"],
      "identity",
      "missing",
      "collection",
      "Collection",
    ],
    [
      ["list", "icons", "--catalogue", "missing"],
      "catalogue",
      "missing",
      "catalogue",
      "Catalogue",
    ],
    [
      ["list", "icons", "--collection", "missing"],
      "collection",
      "missing",
      "collection",
      "Collection",
    ],
    [
      ["list", "icons", "--glyph", "aster/missing"],
      "glyph",
      "aster/missing",
      "glyph",
      "Glyph",
    ],
  ];
  for (const [args, family, value, subject, label] of cases) {
    const message = `${family} ${value} was not found`;
    const human = run(args);
    const json = run([...args, "--json"]);
    assert.equal(human.status, 1);
    assert.equal(human.stdout, "");
    assert.equal(
      human.stderr,
      `[ASTER-CLI-004] ${message}\nDetails:\n  ${label}: ${value}\n`,
    );
    assert.equal(json.status, 1);
    assert.equal(json.stderr, "");
    const result = JSON.parse(json.stdout);
    assert.deepEqual(result.diagnostic, {
      category: "not-found",
      code: "ASTER-CLI-004",
      message,
      details: { kind: "lookup", subject, identity: value },
    });
    assert.equal(json.stdout, `${JSON.stringify(result)}\n`);
  }
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
  const extra = run(["search", "query", "extra"]);
  const collectionWithoutMode = run([
    "export",
    "collection",
    representativeCollectionIdentity,
  ]);
  const collectionLabel = run([
    "export",
    "collection",
    representativeCollectionIdentity,
    "--label",
    "Collection",
    "--json",
  ]);
  const repeatedOutput = run([
    "export",
    "icon",
    representativeIdentity,
    "--output",
    "first",
    "--output",
    "second",
  ]);
  const incomplete = run(["export", "icon", representativeIdentity, "--size"]);
  const emptyOutput = run([
    "export",
    "icon",
    representativeIdentity,
    "--output",
    "",
  ]);
  const invalidNumber = run([
    "export",
    "icon",
    representativeIdentity,
    "--size",
    "0x20",
  ]);
  const invalidDomain = run([
    "export",
    "icon",
    representativeIdentity,
    "--size",
    "0",
  ]);
  const invalidPaint = run([
    "export",
    "icon",
    representativeIdentity,
    "--colour",
    "red",
    "--json",
  ]);
  const invalidDirection = run([
    "export",
    "icon",
    representativeIdentity,
    "--direction",
    "sideways",
    "--json",
  ]);
  const repeatedReplace = run([
    "review",
    "icon",
    representativeIdentity,
    "--replace",
    "--replace",
  ]);
  const replaceJson = run([
    "review",
    "icon",
    representativeIdentity,
    "--replace",
    "--json",
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
  assert.equal(invalidPaint.status, 2);
  assert.equal(invalidDirection.status, 2);
  assert.equal(JSON.parse(invalidPaint.stdout).diagnostic.category, "usage");
  assert.equal(
    JSON.parse(invalidDirection.stdout).diagnostic.category,
    "usage",
  );
  assert.equal(repeatedReplace.status, 2);
  assert.equal(replaceJson.status, 2);
});
