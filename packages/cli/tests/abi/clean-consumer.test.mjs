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

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const workspaceRoot = resolve(packageRoot, "../..");
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
    "photo",
    "--json",
  ]);
  const programmatic = runModule([
    'import { AsterCatalogue, AsterCommands } from "@aster/cli";',
    "const plugins = new Map([[AsterCommands.identity, AsterCommands]]);",
    'const plugin = plugins.get("aster");',
    "if (plugin === undefined) throw new TypeError(\"Missing Aster plugin\");",
    "const result = await plugin.execute(",
    '  { command: "list", subject: "icons", tags: ["photo"] },',
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
});

test("returns the same complete export through standalone and programmatic hosts", () => {
  const executable = runExecutable([
    "export",
    "collection",
    "aster",
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
    '    identity: "aster",',
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

  assert.equal(result.payload.plan.artefacts.length, 16);
  assert.deepEqual(
    result.payload.plan.artefacts.map((artefact) => artefact.path),
    [
      "aster/arrow-left.svg",
      "aster/bell.svg",
      "aster/camera.svg",
      "aster/check.svg",
      "aster/close.svg",
      "aster/cloud.svg",
      "aster/folder.svg",
      "aster/heart.svg",
      "aster/home.svg",
      "aster/leaf.svg",
      "aster/lock.svg",
      "aster/plus.svg",
      "aster/search.svg",
      "aster/settings.svg",
      "aster/star.svg",
      "aster/user.svg",
    ],
  );
});

test("publishes the complete planned collection from the clean consumer", async () => {
  const planned = runExecutable([
    "export",
    "collection",
    "aster",
    "--size",
    "20",
    "--json",
  ]);
  const published = runExecutable([
    "export",
    "collection",
    "aster",
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
