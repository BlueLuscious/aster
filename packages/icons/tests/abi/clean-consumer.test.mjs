import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, relative, resolve } from "node:path";
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
  const pnpmExecutable = process.env.npm_execpath;

  if (pnpmExecutable !== undefined) {
    return spawnSync(
      process.execPath,
      [pnpmExecutable, ...arguments_],
      options,
    );
  }

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

  assertSuccessfulProcess(packed, `pack @luscious-garden/aster-${name}`);

  return basename(JSON.parse(packed.stdout).filename);
}

async function collectRelativeFiles(root, directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectRelativeFiles(root, path)));
    } else if (entry.isFile()) {
      files.push(relative(root, path).replaceAll("\\", "/"));
    }
  }

  return files.sort((left, right) => left.localeCompare(right));
}

before(async () => {
  consumerRoot = await mkdtemp(resolve(tmpdir(), "aster-icons-consumer-"));
  const tarballRoot = resolve(consumerRoot, "tarballs");

  await mkdir(tarballRoot, { recursive: true });
  const packageNames = ["core", "icons"];
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
      `@luscious-garden/aster-${name}`,
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
  await writeFile(
    resolve(consumerRoot, ".npmrc"),
    "engine-strict=true\n",
    "utf8",
  );
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

test("packs every emitted file without repository source", async () => {
  const sourceDistributionFiles = (await collectRelativeFiles(
    resolve(packageRoot, "dist"),
  )).map((path) => `dist/${path}`);
  const installedFiles = await collectRelativeFiles(
    resolve(consumerRoot, "node_modules/@luscious-garden/aster-icons"),
  );

  assert.deepEqual(installedFiles, [
    ...sourceDistributionFiles,
    "ARTWORK-LICENCE.md",
    "LICENSE",
    "package.json",
    "README.md",
  ].sort((left, right) => left.localeCompare(right)));
  assert.ok(
    installedFiles.some((path) =>
      path.startsWith("dist/generated/facades/icons/")
    ),
  );
  assert.ok(
    installedFiles.some((path) =>
      path.startsWith("dist/generated/facades/collections/")
    ),
  );
  assert.equal(installedFiles.some((path) => path.startsWith("src/")), false);
  assert.equal(installedFiles.some((path) => path.startsWith("tests/")), false);
});

test("includes both software and artwork terms in the installed package", async () => {
  const packageDirectory = resolve(consumerRoot, "node_modules/@luscious-garden/aster-icons");
  const [softwareNotice, artworkNotice, manifest] = await Promise.all([
    readFile(resolve(packageDirectory, "LICENSE"), "utf8"),
    readFile(resolve(packageDirectory, "ARTWORK-LICENCE.md"), "utf8"),
    readFile(resolve(packageDirectory, "package.json"), "utf8"),
  ]);

  assert.match(softwareNotice, /ISC License/u);
  assert.match(softwareNotice, /\[Aster Artwork Licence\]\(ARTWORK-LICENCE\.md\)/u);
  assert.match(artworkNotice, /standalone artwork product/u);
  assert.match(artworkNotice, /\[ISC software licence\]\(LICENSE\)/u);
  assert.equal(JSON.parse(manifest).license, "SEE LICENSE IN LICENSE");
});

test("resolves isolated runtime and declaration facades without source files", async () => {
  const source = [
    'import type { CollectionDefinition, IconDefinition } from "@luscious-garden/aster-core";',
    'import type { CollectionDefinitionLoader, IconDefinitionLoader } from "@luscious-garden/aster-icons/dynamic";',
    'import type { CollectionManifestEntry, IconManifestEntry } from "@luscious-garden/aster-icons/manifest";',
    'import { Camera } from "@luscious-garden/aster-icons/camera";',
    'import { AmellusCollection } from "@luscious-garden/aster-icons/collections/amellus";',
    'import { AsterCollectionManifest, AsterIconManifest } from "@luscious-garden/aster-icons/manifest";',
    'import { AsterCollectionLoaders, AsterIconLoaders } from "@luscious-garden/aster-icons/dynamic";',
    "const icon: IconDefinition = Camera;",
    "const collection: CollectionDefinition = AmellusCollection;",
    "const iconEntry: IconManifestEntry | undefined = AsterIconManifest.find(({ key }) => key === \"aster/camera\");",
    "const collectionEntry: CollectionManifestEntry | undefined = AsterCollectionManifest.find(({ key }) => key === \"amellus\");",
    'const iconLoader: IconDefinitionLoader | undefined = AsterIconLoaders["aster/camera"];',
    "const collectionLoader: CollectionDefinitionLoader | undefined = AsterCollectionLoaders.amellus;",
    'if (iconLoader === undefined || collectionLoader === undefined) throw new Error("Expected loaders.");',
    "const loadedIcon = await iconLoader();",
    "const loadedCollection = await collectionLoader();",
    "export const result = `${icon.identity.name}:${collection.identity.name}:${iconEntry?.symbol}:${collectionEntry?.symbol}:${loadedIcon.identity.name}:${loadedCollection.identity.name}`;",
    "",
  ].join("\n");
  await writeFile(resolve(consumerRoot, "consumer.ts"), source, "utf8");
  await writeFile(
    resolve(consumerRoot, "tsconfig.json"),
    `${JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        module: "NodeNext",
        moduleResolution: "NodeNext",
        strict: true,
        skipLibCheck: true,
        outDir: "dist",
      },
      include: ["consumer.ts"],
    }, null, 2)}\n`,
    "utf8",
  );

  const compiled = spawnSync(
    process.execPath,
    [
      resolve(workspaceRoot, "node_modules/typescript/bin/tsc"),
      "-p",
      resolve(consumerRoot, "tsconfig.json"),
    ],
    { cwd: consumerRoot, encoding: "utf8" },
  );

  assert.equal(compiled.error, undefined, "TypeScript consumer could not start.");
  assert.equal(
    compiled.status,
    0,
    `TypeScript consumer failed: ${compiled.stdout}${compiled.stderr}`,
  );

  const executed = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      'const { result } = await import("./dist/consumer.js"); process.stdout.write(result);',
    ],
    { cwd: consumerRoot, encoding: "utf8" },
  );

  assert.equal(executed.status, 0);
  assert.equal(executed.stderr, "");
  assert.equal(
    executed.stdout,
    "camera:amellus:Camera:AmellusCollection:camera:amellus",
  );
});

test("preserves native dynamic-import rejection details", async () => {
  await unlink(
    resolve(
      consumerRoot,
      "node_modules/@luscious-garden/aster-icons/dist/generated/facades/icons/camera.js",
    ),
  );
  const executed = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      [
        'const { AsterIconLoaders } = await import("@luscious-garden/aster-icons/dynamic");',
        'const loader = AsterIconLoaders["aster/camera"];',
        "try {",
        "  await loader();",
        "} catch (error) {",
        "  process.stdout.write(JSON.stringify({ name: error.name, code: error.code }));",
        "}",
      ].join("\n"),
    ],
    { cwd: consumerRoot, encoding: "utf8" },
  );

  assert.equal(executed.status, 0);
  assert.equal(executed.stderr, "");
  assert.deepEqual(JSON.parse(executed.stdout), {
    name: "Error",
    code: "ERR_MODULE_NOT_FOUND",
  });
});
