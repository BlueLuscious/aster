import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const distributionRoot = resolve(packageRoot, "dist");
async function collectDefinitionSubpaths(directory, suffix, symbolSuffix = "") {
  return Object.freeze(
    Object.fromEntries(
      (await readdir(resolve(distributionRoot, directory), {
        withFileTypes: true,
      }))
        .filter((entry) => entry.isFile() && entry.name.endsWith(suffix))
        .map((entry) => entry.name.slice(0, -suffix.length))
        .sort((left, right) => left.localeCompare(right))
        .map((subpath) => [
          subpath,
          `${subpath
            .split("-")
            .map((part) => `${part[0]?.toUpperCase()}${part.slice(1)}`)
            .join("")}${symbolSuffix}`,
        ]),
    ),
  );
}

const iconSubpaths = await collectDefinitionSubpaths(
  "icons",
  ".icon.js",
);
const collectionSubpaths = await collectDefinitionSubpaths(
  "collections",
  ".collection.js",
  "Collection",
);

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

  assert.ok(
    Object.keys(iconSubpaths).length > 0,
    "Expected at least one emitted icon definition subpath.",
  );
  assert.ok(
    Object.keys(collectionSubpaths).length > 0,
    "Expected at least one emitted collection definition subpath.",
  );

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
    ["AsterCollections", ...Object.values(collectionSubpaths)].sort(),
  );
  assert.deepEqual(
    collections.AsterCollections,
    Object.values(collectionSubpaths).map((symbol) => collections[symbol]),
  );
  assert.ok(Object.isFrozen(collections.AsterCollections));

  for (const [subpath, symbol] of Object.entries(iconSubpaths)) {
    const direct = await import(`@aster/icons/${subpath}`);

    assert.deepEqual(Object.keys(direct), [symbol]);
    assert.equal(direct[symbol], root[symbol]);
    assert.equal(direct[symbol].identity.name, subpath);
  }

  for (const [subpath, symbol] of Object.entries(collectionSubpaths)) {
    const direct = await import(`@aster/icons/collections/${subpath}`);

    assert.deepEqual(Object.keys(direct), [symbol]);
    assert.equal(direct[symbol], collections[symbol]);
    assert.equal(direct[symbol].identity.name, subpath);
    assert.ok(
      direct[symbol].icons.every((definition) =>
        root.AsterIcons.includes(definition),
      ),
      `Expected every ${subpath} member in the complete icon index.`,
    );
  }
});

test("rejects implementation and undeclared internal subpaths", async () => {
  const [iconSubpath] = Object.keys(iconSubpaths);
  const [collectionSubpath] = Object.keys(collectionSubpaths);
  assert.ok(iconSubpath, "Expected one icon subpath for rejection evidence.");
  assert.ok(
    collectionSubpath,
    "Expected one collection subpath for rejection evidence.",
  );

  await assert.rejects(
    import(`@aster/icons/icons/${iconSubpath}.icon.js`),
    (error) => error?.code === "ERR_MODULE_NOT_FOUND",
  );
  await assert.rejects(
    import(`@aster/icons/collections/${collectionSubpath}.collection.js`),
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
