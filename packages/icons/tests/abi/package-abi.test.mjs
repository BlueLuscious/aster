import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const distributionRoot = resolve(packageRoot, "dist");
const iconSubpaths = Object.freeze({
  "arrow-left": "ArrowLeft",
  bell: "Bell",
  camera: "Camera",
  check: "Check",
  close: "Close",
  cloud: "Cloud",
  folder: "Folder",
  heart: "Heart",
  home: "Home",
  leaf: "Leaf",
  lock: "Lock",
  plus: "Plus",
  search: "Search",
  settings: "Settings",
  star: "Star",
  user: "User",
});

async function collectDistributionFiles(extension) {
  const entries = await readdir(distributionRoot, { recursive: true });

  return entries
    .filter((entry) => entry.endsWith(extension))
    .map((entry) => resolve(distributionRoot, entry))
    .sort((left, right) => left.localeCompare(right));
}

function extractModuleSpecifiers(source) {
  return [...source.matchAll(/\b(?:from|import)\s*(?:\(\s*)?["']([^"']+)["']/gu)]
    .map((match) => match[1])
    .filter((specifier) => specifier !== undefined);
}

test("exposes the exact documented icon root and definition families", async () => {
  const root = await import("@aster/icons");
  const collections = await import("@aster/icons/collections");

  assert.deepEqual(
    Object.keys(root).sort(),
    ["AsterIcons", ...Object.values(iconSubpaths)].sort(),
  );
  assert.deepEqual(
    root.AsterIcons,
    Object.values(iconSubpaths).map((symbol) => root[symbol]),
  );
  assert.ok(Object.isFrozen(root.AsterIcons));
  assert.deepEqual(
    Object.keys(collections).sort(),
    ["AsterCollection", "AsterCollections"],
  );
  assert.deepEqual(collections.AsterCollections, [collections.AsterCollection]);
  assert.ok(Object.isFrozen(collections.AsterCollections));

  for (const [subpath, symbol] of Object.entries(iconSubpaths)) {
    const direct = await import(`@aster/icons/${subpath}`);

    assert.deepEqual(Object.keys(direct), [symbol]);
    assert.equal(direct[symbol], root[symbol]);
    assert.equal(direct[symbol].identity.name, subpath);
  }

  const { AsterCollection } = await import(
    "@aster/icons/collections/aster"
  );

  assert.equal(AsterCollection, collections.AsterCollection);
  assert.deepEqual(AsterCollection.icons, root.AsterIcons);
});

test("rejects implementation and undeclared internal subpaths", async () => {
  await assert.rejects(
    import("@aster/icons/icons/arrow-left.icon.js"),
    (error) => error?.code === "ERR_MODULE_NOT_FOUND",
  );
  await assert.rejects(
    import("@aster/icons/collections/aster.collection.js"),
    (error) => error?.code === "ERR_MODULE_NOT_FOUND",
  );
  await assert.rejects(
    import("@aster/icons/aster-icons.constant"),
    (error) => error?.code === "ERR_MODULE_NOT_FOUND",
  );
});

test("publishes only scalable icon and collection export families", async () => {
  const manifest = JSON.parse(
    await readFile(resolve(packageRoot, "package.json"), "utf8"),
  );
  const expectedExportKeys = [".", "./collections", "./collections/*", "./*"];

  assert.deepEqual(Object.keys(manifest.exports), expectedExportKeys);
  assert.equal(manifest.exports["."].import, "./dist/index.js");
  assert.equal(manifest.exports["."].types, "./dist/index.d.ts");
  assert.deepEqual(manifest.exports["./collections"], {
    types: "./dist/collections/index.d.ts",
    import: "./dist/collections/index.js",
  });
  assert.deepEqual(manifest.exports["./collections/*"], {
    types: "./dist/collections/*.collection.d.ts",
    import: "./dist/collections/*.collection.js",
  });
  assert.deepEqual(manifest.exports["./*"], {
    types: "./dist/icons/*.icon.d.ts",
    import: "./dist/icons/*.icon.js",
  });
  assert.deepEqual(manifest.dependencies, {
    "@aster/core": "workspace:*",
  });
  assert.equal(manifest.sideEffects, false);
});

test("keeps every per-icon module isolated from sibling definitions", async () => {
  for (const subpath of Object.keys(iconSubpaths)) {
    const source = await readFile(
      resolve(distributionRoot, `icons/${subpath}.icon.js`),
      "utf8",
    );
    const specifiers = extractModuleSpecifiers(source);

    assert.deepEqual(specifiers.sort(), [
      "../shared/constants/aster-icon-authoring.constant.js",
      "@aster/core",
    ]);
    assert.doesNotMatch(source, /(?:icons\/index|manifest|catalogue|registry)/gu);
  }
});

test("emits host-independent side-effect-free ESM", async () => {
  const declarations = await collectDistributionFiles(".d.ts");
  const modules = await collectDistributionFiles(".js");

  assert.ok(declarations.length > 0);
  assert.ok(modules.length > 0);

  for (const declaration of declarations) {
    const source = await readFile(declaration, "utf8");
    const externalSpecifiers = extractModuleSpecifiers(source).filter(
      (specifier) => !specifier.startsWith("."),
    );

    assert.deepEqual(
      [...new Set(externalSpecifiers)],
      externalSpecifiers.length === 0 ? [] : ["@aster/core"],
    );
    assert.doesNotMatch(source, /\/\/\/\s*<reference/iu);
    assert.doesNotMatch(
      source,
      /\b(?:HTMLElement|SVGElement|Document|Window|Buffer|NodeJS)\b/gu,
    );
  }

  for (const module of modules) {
    const source = await readFile(module, "utf8");
    const externalSpecifiers = extractModuleSpecifiers(source).filter(
      (specifier) => !specifier.startsWith("."),
    );

    assert.deepEqual(
      [...new Set(externalSpecifiers)],
      externalSpecifiers.length === 0 ? [] : ["@aster/core"],
    );
    assert.doesNotMatch(source, /\brequire\s*\(/gu);
    assert.doesNotMatch(source, /\bmodule\.exports\b/gu);
    assert.doesNotMatch(
      source,
      /(?:@aster\/core\/|@aster\/build|@aster\/svg|\blilium\b|\blotus\b|\bnode:|\btooling\b)/giu,
    );
  }
});
