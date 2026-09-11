import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, resolve } from "node:path";
import process from "node:process";
import test, { after, before } from "node:test";
import { fileURLToPath } from "node:url";
import { AsterIcons } from "@aster/icons";
import { AsterCollections } from "@aster/icons/collections";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const workspaceRoot = resolve(packageRoot, "../..");
assert.ok(AsterIcons.length > 0, "Expected the packed icon family to be non-empty.");
assert.ok(
  AsterCollections.length > 0,
  "Expected the packed collection family to be non-empty.",
);
const representativeCollection = AsterCollections.find(
  (collection) => collection.icons.length > 0,
);
assert.ok(
  representativeCollection,
  "Expected one non-empty collection for packed CLI conformance.",
);
const representativeCollectionIdentity = `${
  representativeCollection.identity.namespace === undefined
    ? ""
    : `${representativeCollection.identity.namespace}/`
}${representativeCollection.identity.name}`;
const representativeCollectionLiteral = JSON.stringify(
  representativeCollectionIdentity,
);
const taggedIcon = AsterIcons.find(
  (icon) => (icon.metadata.tags?.length ?? 0) > 0,
);
assert.ok(taggedIcon, "Expected one tagged icon for packed CLI conformance.");
const representativeTag = taggedIcon.metadata.tags?.[0];
assert.ok(representativeTag, "Expected one representative packed icon tag.");
const representativeTagLiteral = JSON.stringify(representativeTag);
const expectedCollectionPaths = Object.freeze(
  representativeCollection.icons
    .map(
      (icon) => `${
        icon.identity.namespace === undefined
          ? ""
          : `${icon.identity.namespace}/`
      }${icon.identity.name}${
        icon.identity.variant === undefined ? "" : `@${icon.identity.variant}`
      }.svg`,
    )
    .sort((left, right) => left.localeCompare(right)),
);
let consumerRoot;

function runPnpm(arguments_) {
  const options = {
    cwd: workspaceRoot,
    encoding: "utf8",
  };

  if (process.platform !== "win32") {
    return spawnSync("pnpm", arguments_, options);
  }

  const command = [
    "pnpm",
    ...arguments_.map(
      (argument) => `"${argument.replaceAll('"', '""')}"`,
    ),
  ].join(" ");

  return spawnSync(command, { ...options, shell: true });
}

function assertSuccessfulProcess(result, operation) {
  assert.equal(result.error, undefined, `${operation} could not start`);
  assert.equal(
    result.status,
    0,
    `${operation}: stdout=${result.stdout} stderr=${result.stderr}`,
  );
}

async function packPublishedPackage(name, tarballRoot) {
  const packed = runPnpm([
    "--dir",
    resolve(workspaceRoot, "packages", name),
    "pack",
    "--pack-destination",
    tarballRoot,
    "--json",
  ]);

  assertSuccessfulProcess(packed, `pack @aster/${name}`);

  return basename(JSON.parse(packed.stdout).filename);
}

function runModule(source) {
  return spawnSync(
    process.execPath,
    ["--input-type=module", "--eval", source],
    {
      cwd: consumerRoot,
      encoding: "utf8",
    },
  );
}

function runExecutable(arguments_) {
  return spawnSync(
    process.execPath,
    [
      resolve(
        consumerRoot,
        "node_modules",
        "@aster",
        "cli",
        "dist",
        "shell",
        "aster.js",
      ),
      ...arguments_,
    ],
    {
      cwd: consumerRoot,
      encoding: "utf8",
    },
  );
}

before(async () => {
  consumerRoot = await mkdtemp(resolve(tmpdir(), "aster-cli-consumer-"));
  const tarballRoot = resolve(consumerRoot, "tarballs");

  await mkdir(tarballRoot, { recursive: true });
  const packageNames = ["core", "icons", "svg", "cli"];
  const filenames = Object.fromEntries(
    await Promise.all(
      packageNames.map(async (name) => [
        name,
        await packPublishedPackage(name, tarballRoot),
      ]),
    ),
  );
  const packageSpecifications = Object.fromEntries(
    packageNames.map((name) => [
      `@aster/${name}`,
      `file:./tarballs/${filenames[name]}`,
    ]),
  );
  await writeFile(
    resolve(consumerRoot, "package.json"),
    `${JSON.stringify({
      private: true,
      type: "module",
      dependencies: packageSpecifications,
      pnpm: { overrides: packageSpecifications },
    })}\n`,
    "utf8",
  );
  await writeFile(resolve(consumerRoot, ".npmrc"), "engine-strict=true\n", "utf8");
  const installed = runPnpm([
    "--dir",
    consumerRoot,
    "install",
    "--offline",
    "--ignore-scripts",
    "--frozen-lockfile=false",
  ]);

  assertSuccessfulProcess(installed, "install packed Aster packages");
});

after(async () => {
  await rm(consumerRoot, { recursive: true, force: true });
});

test("imports the public package without source files or observable effects", () => {
  const imported = runModule('await import("@aster/cli");');
  const inspected = runModule([
    'import * as AsterCli from "@aster/cli";',
    "process.stdout.write(JSON.stringify(Object.keys(AsterCli).sort()));",
  ].join("\n"));

  assert.equal(imported.status, 0);
  assert.equal(imported.stdout, "");
  assert.equal(imported.stderr, "");
  assert.equal(inspected.status, 0);
  assert.equal(inspected.stderr, "");
  assert.deepEqual(JSON.parse(inspected.stdout), [
    "AsterCatalogue",
    "AsterCommands",
    "catalogueResultKinds",
    "exportTargets",
    "reviewSubjects",
    "reviewTargets",
  ]);
});

test("links and executes the packed CLI binary through the package manager", () => {
  const linked = runPnpm(["--dir", consumerRoot, "exec", "aster", "version"]);

  assertSuccessfulProcess(linked, "execute linked Aster binary");
  assert.equal(linked.stdout, "Aster 0.0.0\n");
});

test("returns the same result through the executable and an independent plugin host", () => {
  const executable = runExecutable([
    "list",
    "icons",
    "--tag",
    representativeTag,
    "--json",
  ]);
  const programmatic = runModule([
    'import { AsterCatalogue, AsterCommands } from "@aster/cli";',
    "const plugins = new Map([[AsterCommands.identity, AsterCommands]]);",
    'const plugin = plugins.get("aster");',
    "if (plugin === undefined) throw new TypeError(\"Missing Aster plugin\");",
    "const result = await plugin.execute(",
    `  { command: "list", subject: "icons", tags: [${representativeTagLiteral}] },`,
    "  {",
    "    catalogues: [AsterCatalogue],",
    '    productName: "Aster",',
    '    productVersion: "0.0.0",',
    "  },",
    ");",
    'process.stdout.write(`${JSON.stringify(result)}\\n`);',
  ].join("\n"));

  assert.equal(executable.status, 0);
  assert.equal(executable.stderr, "");
  assert.equal(programmatic.status, 0);
  assert.equal(programmatic.stderr, "");
  assert.equal(programmatic.stdout, executable.stdout);
  assert.ok(JSON.parse(executable.stdout).payload.icons.length > 0);
});

test("returns the same complete export through standalone and programmatic hosts", () => {
  const executable = runExecutable([
    "export",
    "collection",
    representativeCollectionIdentity,
    "--size",
    "32",
    "--colour",
    "#123456",
    "--direction",
    "rtl",
    "--json",
  ]);
  const programmatic = runModule([
    'import { AsterCatalogue, AsterCommands } from "@aster/cli";',
    "const plugins = new Map([[AsterCommands.identity, AsterCommands]]);",
    'const plugin = plugins.get("aster");',
    'if (plugin === undefined) throw new TypeError("Missing Aster plugin");',
    "const result = await plugin.execute(",
    "  {",
    '    command: "export",',
    '    subject: "collection",',
    `    identity: ${representativeCollectionLiteral},`,
    "    options: {",
    "      size: 32,",
    '      colour: "#123456",',
    '      direction: "rtl",',
    "    },",
    "  },",
    "  {",
    "    catalogues: [AsterCatalogue],",
    '    productName: "Aster",',
    '    productVersion: "0.0.0",',
    "  },",
    ");",
    'process.stdout.write(`${JSON.stringify(result)}\\n`);',
  ].join("\n"));

  assert.equal(executable.status, 0);
  assert.equal(executable.stderr, "");
  assert.equal(programmatic.status, 0);
  assert.equal(programmatic.stderr, "");
  assert.equal(programmatic.stdout, executable.stdout);

  const result = JSON.parse(executable.stdout);

  assert.equal(
    result.payload.plan.artefacts.length,
    expectedCollectionPaths.length,
  );
  assert.deepEqual(
    result.payload.plan.artefacts.map((artefact) => artefact.path),
    expectedCollectionPaths,
  );
});

test("returns and publishes a complete review from the clean consumer", async () => {
  const executable = runExecutable([
    "review",
    "collection",
    representativeCollectionIdentity,
    "--json",
  ]);
  const programmatic = runModule([
    'import { AsterCatalogue, AsterCommands } from "@aster/cli";',
    "const result = await AsterCommands.execute(",
    "  {",
    '    command: "review",',
    '    subject: "collection",',
    `    identity: ${representativeCollectionLiteral},`,
    "  },",
    "  {",
    "    catalogues: [AsterCatalogue],",
    '    productName: "Aster",',
    '    productVersion: "0.0.0",',
    "  },",
    ");",
    'process.stdout.write(`${JSON.stringify(result)}\n`);',
  ].join("\n"));

  assert.equal(executable.status, 0);
  assert.equal(executable.stderr, "");
  assert.equal(programmatic.status, 0);
  assert.equal(programmatic.stderr, "");
  assert.equal(programmatic.stdout, executable.stdout);

  const published = runExecutable([
    "review",
    "collection",
    representativeCollectionIdentity,
    "--output",
    "review",
  ]);

  assert.equal(published.status, 0);
  assert.equal(published.stderr, "");

  const document = await readFile(
    resolve(consumerRoot, "review", "index.html"),
    "utf8",
  );
  const plan = JSON.parse(executable.stdout).payload.plan;

  assert.match(
    document,
    /<meta name="aster-review-document" content="1">/u,
  );
  assert.doesNotMatch(document, /<script|https?:\/\/(?!www\.w3\.org\/2000\/svg)/u);

  assert.equal(plan.document.icons.length, expectedCollectionPaths.length);

  for (const path of expectedCollectionPaths) {
    assert.ok(document.includes(path.slice(0, -4)));
  }
});

test("publishes the complete planned collection from the clean consumer", async () => {
  const planned = runExecutable([
    "export",
    "collection",
    representativeCollectionIdentity,
    "--size",
    "20",
    "--json",
  ]);
  const published = runExecutable([
    "export",
    "collection",
    representativeCollectionIdentity,
    "--size",
    "20",
    "--output",
    "published",
  ]);

  assert.equal(planned.status, 0);
  assert.equal(planned.stderr, "");
  assert.equal(published.status, 0);
  assert.equal(published.stderr, "");

  const artefacts = JSON.parse(planned.stdout).payload.plan.artefacts;
  const publishedRoot = resolve(consumerRoot, "published");
  const publishedPaths = (await readdir(publishedRoot, { recursive: true }))
    .filter((entry) => entry.endsWith(".svg"))
    .map((entry) => entry.replaceAll("\\", "/"))
    .sort((left, right) => left.localeCompare(right));

  assert.deepEqual(
    publishedPaths,
    artefacts.map((artefact) => artefact.path),
  );

  for (const artefact of artefacts) {
    assert.equal(
      await readFile(resolve(publishedRoot, artefact.path), "utf8"),
      artefact.content,
    );
  }
});

test("requires explicit catalogues and canonicalises provider registration order", () => {
  const execution = runModule([
    'import { AsterCommands } from "@aster/cli";',
    "const counts = { alpha: 0, beta: 0 };",
    "const provider = (identity) => ({",
    "  identity,",
    "  async load() {",
    "    counts[identity] += 1;",
    "    return { icons: [], collections: [] };",
    "  },",
    "});",
    "const alpha = provider(\"alpha\");",
    "const beta = provider(\"beta\");",
    "const invoke = (catalogues) => AsterCommands.execute(",
    '  { command: "list", subject: "catalogues" },',
    "  {",
    "    catalogues,",
    '    productName: "Aster",',
    '    productVersion: "0.0.0",',
    "  },",
    ");",
    "const empty = await invoke([]);",
    "const first = await invoke([beta, alpha]);",
    "const second = await invoke([alpha, beta]);",
    "process.stdout.write(JSON.stringify({ counts, empty, first, second }));",
  ].join("\n"));

  assert.equal(execution.status, 0);
  assert.equal(execution.stderr, "");

  const { counts, empty, first, second } = JSON.parse(execution.stdout);

  assert.deepEqual(counts, { alpha: 2, beta: 2 });
  assert.deepEqual(empty.payload.catalogues, []);
  assert.deepEqual(first, second);
  assert.deepEqual(
    first.payload.catalogues.map((catalogue) => catalogue.identity),
    ["alpha", "beta"],
  );
});
