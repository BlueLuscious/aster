import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import type { CollectionDefinition, IconDefinition } from "@aster/core";
import * as iconExports from "@aster/icons";
import * as collectionExports from "@aster/icons/collections";
import { Svg } from "@aster/svg";

const packageRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../packages/icons",
);

const iconNames = [
  "arrow-down",
  "arrow-left",
  "arrow-right",
  "arrow-up",
  "bell",
  "camera",
  "check",
  "close",
  "cloud",
  "download",
  "folder",
  "heart",
  "home",
  "info",
  "leaf",
  "lock",
  "mail",
  "menu",
  "pause",
  "play",
  "plus",
  "search",
  "settings",
  "star",
  "user",
  "warning",
] as const;

const amellusMembers = [
  "arrow-left",
  "arrow-right",
  "arrow-up",
  "arrow-down",
  "home",
  "menu",
  "check",
  "close",
  "download",
  "plus",
  "search",
  "settings",
  "heart",
  "info",
  "lock",
  "star",
  "warning",
  "camera",
  "pause",
  "play",
  "bell",
  "mail",
  "cloud",
  "folder",
  "leaf",
  "user",
] as const;

const sourceMigrationBaseline = Object.freeze({
  icons: Object.freeze(
    iconNames.map((name) => {
      const symbol = name
        .split("-")
        .map((part) => `${part[0]?.toUpperCase()}${part.slice(1)}`)
        .join("");

      return Object.freeze({
        identity: `aster/${name}`,
        symbol,
        sourcePath: `src/icons/${name}.icon.ts`,
        destinationPath: `src/glyphs/${name[0]}/${name}/${name}.icon.ts`,
        publicSpecifier: `@aster/icons/${name}`,
      });
    }),
  ),
  collections: Object.freeze([
    Object.freeze({
      identity: "amellus",
      symbol: "AmellusCollection",
      sourcePath: "src/collections/amellus.collection.ts",
      destinationPath: "src/collections/a/amellus/amellus.collection.ts",
      publicSpecifier: "@aster/icons/collections/amellus",
      members: amellusMembers,
    }),
  ]),
  packageExports: Object.freeze({
    ".": Object.freeze({
      types: "./dist/index.d.ts",
      import: "./dist/index.js",
    }),
    "./collections": Object.freeze({
      types: "./dist/collections/index.d.ts",
      import: "./dist/collections/index.js",
    }),
    "./collections/*": Object.freeze({
      types: "./dist/collections/*.collection.d.ts",
      import: "./dist/collections/*.collection.js",
    }),
    "./*": Object.freeze({
      types: "./dist/icons/*.icon.d.ts",
      import: "./dist/icons/*.icon.js",
    }),
  }),
  digests: Object.freeze({
    portableDefinitions:
      "8f1f443ecd7e2c90a58e5b7d8e8eb50bc9ea5fe2714f73ba2e96b3c83332db34",
    collectionDefinitions:
      "e3167a39a9200dc402ce475b56b999fc73f2dbdd74d3f0daead60c52bcc4a44a",
    renderedSvg:
      "4ee63ebac0b7479c11d45215977abdea2c6d79799cce10cc0cadccf0731be949",
  }),
});

function canonicalise(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalise);
  }

  if (typeof value !== "object" || value === null) {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => compareText(left, right))
      .map(([key, nested]) => [key, canonicalise(nested)]),
  );
}

function digest(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(canonicalise(value)))
    .digest("hex");
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function identityOf(definition: IconDefinition): string {
  const { namespace, name, variant } = definition.identity;

  return `${namespace}/${name}${variant === undefined ? "" : `@${variant}`}`;
}

async function collectCanonicalSources(
  relativeRoot: string,
  suffix: string,
): Promise<readonly string[]> {
  const entries = await readdir(resolve(packageRoot, relativeRoot), {
    recursive: true,
  });

  return Object.freeze(
    entries
      .map((entry) => entry.replaceAll("\\", "/"))
      .filter(
        (entry) =>
          entry.endsWith(suffix) && !entry.startsWith("constants/"),
      )
      .map((entry) => `${relativeRoot}/${entry}`)
      .sort(),
  );
}

test("fixes one collision-free destination for every retained canonical source", async () => {
  const iconSources = await collectCanonicalSources("src/icons", ".icon.ts");
  const collectionSources = await collectCanonicalSources(
    "src/collections",
    ".collection.ts",
  );
  const destinations = [
    ...sourceMigrationBaseline.icons.map(({ destinationPath }) => destinationPath),
    ...sourceMigrationBaseline.collections.map(
      ({ destinationPath }) => destinationPath,
    ),
  ];

  assert.deepEqual(
    iconSources,
    sourceMigrationBaseline.icons.map(({ sourcePath }) => sourcePath),
  );
  assert.deepEqual(
    collectionSources,
    sourceMigrationBaseline.collections.map(({ sourcePath }) => sourcePath),
  );
  assert.equal(new Set(destinations).size, destinations.length);

  for (const icon of sourceMigrationBaseline.icons) {
    const name = icon.identity.slice("aster/".length);

    assert.equal(
      icon.destinationPath,
      `src/glyphs/${name[0]}/${name}/${name}.icon.ts`,
    );
  }

  for (const collection of sourceMigrationBaseline.collections) {
    const name = collection.identity;

    assert.equal(
      collection.destinationPath,
      `src/collections/${name[0]}/${name}/${name}.collection.ts`,
    );
  }
});

test("retains the exact pre-migration definitions, membership and rendered SVG", () => {
  const namedIcons = Object.entries(iconExports)
    .filter(([symbol]) => symbol !== "AsterIcons")
    .map(([symbol, definition]) => ({
      identity: identityOf(definition as IconDefinition),
      symbol,
      definition: definition as IconDefinition,
    }))
    .sort((left, right) => compareText(left.identity, right.identity));
  const namedCollections = Object.entries(collectionExports)
    .filter(([symbol]) => symbol !== "AsterCollections")
    .map(([symbol, definition]) => ({
      identity: (definition as CollectionDefinition).identity.name,
      symbol,
      definition: definition as CollectionDefinition,
    }))
    .sort((left, right) => compareText(left.identity, right.identity));

  assert.deepEqual(
    namedIcons.map(({ identity, symbol }) => ({ identity, symbol })),
    sourceMigrationBaseline.icons.map(({ identity, symbol }) => ({
      identity,
      symbol,
    })),
  );
  assert.deepEqual(
    namedCollections.map(({ identity, symbol, definition }) => ({
      identity,
      symbol,
      members: definition.icons.map((icon) => icon.identity.name),
    })),
    sourceMigrationBaseline.collections.map(({ identity, symbol, members }) => ({
      identity,
      symbol,
      members: [...members],
    })),
  );
  const actualDigests = {
    portableDefinitions: digest(
      namedIcons.map(({ definition }) => definition),
    ),
    collectionDefinitions: digest(
      namedCollections.map(({ definition }) => definition),
    ),
    renderedSvg: digest(
      namedIcons.map(({ identity, definition }) => ({
        identity,
        markup: Svg.render(definition),
      })),
    ),
  };

  assert.deepEqual(actualDigests, sourceMigrationBaseline.digests);
});

test("retains the complete supported package and import surface before migration", async () => {
  const manifest = JSON.parse(
    await readFile(resolve(packageRoot, "package.json"), "utf8"),
  ) as { exports: unknown };

  assert.deepEqual(manifest.exports, sourceMigrationBaseline.packageExports);
  assert.deepEqual(
    Object.keys(iconExports).sort(),
    [
      "AsterIcons",
      ...sourceMigrationBaseline.icons.map(({ symbol }) => symbol),
    ].sort(),
  );
  assert.deepEqual(
    Object.keys(collectionExports).sort(),
    [
      "AsterCollections",
      ...sourceMigrationBaseline.collections.map(({ symbol }) => symbol),
    ].sort(),
  );

  for (const icon of sourceMigrationBaseline.icons) {
    const direct = await import(icon.publicSpecifier);

    assert.deepEqual(Object.keys(direct), [icon.symbol]);
    assert.equal(
      direct[icon.symbol],
      (iconExports as Record<string, unknown>)[icon.symbol],
    );
  }

  for (const collection of sourceMigrationBaseline.collections) {
    const direct = await import(collection.publicSpecifier);

    assert.deepEqual(Object.keys(direct), [collection.symbol]);
    assert.equal(
      direct[collection.symbol],
      (collectionExports as Record<string, unknown>)[collection.symbol],
    );
  }
});
