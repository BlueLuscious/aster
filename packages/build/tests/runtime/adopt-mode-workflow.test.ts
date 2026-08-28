import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  Icon,
  type IconDefinition,
} from "@aster/core";
import {
  CollectionBuildPipeline,
  type CollectionBuildEntry,
  type CollectionBuildOutput,
  type CollectionMetadataSource,
  type DiagnosticResultType,
  IngestionSourceFactory,
} from "../../src/index.js";

const fixtureRoot = new URL("../fixtures/svg/", import.meta.url);
const pipeline = new CollectionBuildPipeline();
const sourceFactory = new IngestionSourceFactory();

function fixture(path: string): string {
  return readFileSync(new URL(path, fixtureRoot), "utf8");
}

function collectionMetadata(collection: string): CollectionMetadataSource {
  const source = sourceFactory.create({
    kind: "collection-metadata",
    sourceId: `viability/${collection}/metadata/collection.json`,
    collection,
    content: JSON.stringify({
      schemaVersion: 1,
      name: collection,
      slug: collection,
      status: "experimental",
      description: `${collection} adoption evidence.`,
      package: {
        name: `@aster/${collection}`,
        version: "0.0.0",
      },
      licence: "ISC",
      attribution: "Aster viability evidence",
      allowIconLicenceOverride: false,
      defaultSize: 24,
      minimumSize: 16,
      presentationDefaults: {
        fill: "none",
        stroke: "currentColor",
      },
      presentationOverrides: [],
      validation: {},
    }),
  });

  assert.equal(source.kind, "collection-metadata");

  if (source.kind !== "collection-metadata") {
    throw new Error("Expected collection metadata evidence.");
  }

  return source;
}

function entry(
  collection: string,
  name: string,
  sourcePath: string,
  displayName = name,
): CollectionBuildEntry {
  const identity = { namespace: collection, name };
  const svg = sourceFactory.create({
    kind: "svg",
    sourceId: `viability/${collection}/svg/${name}.svg`,
    identity,
    content: fixture(sourcePath),
  });
  const metadata = sourceFactory.create({
    kind: "icon-metadata",
    sourceId: `viability/${collection}/metadata/icons/${name}.json`,
    identity,
    content: JSON.stringify({
      schemaVersion: 1,
      name,
      displayName,
      rtl: "preserve",
      deprecated: false,
    }),
  });

  assert.equal(svg.kind, "svg");
  assert.equal(metadata.kind, "icon-metadata");

  if (svg.kind !== "svg" || metadata.kind !== "icon-metadata") {
    throw new Error("Expected paired adoption evidence.");
  }

  return { svg, metadata };
}

function build(
  collection: string,
  entries: readonly CollectionBuildEntry[],
): DiagnosticResultType<CollectionBuildOutput> {
  return pipeline.build({
    collectionMetadata: collectionMetadata(collection),
    entries,
  });
}

function successful(
  result: DiagnosticResultType<CollectionBuildOutput>,
): CollectionBuildOutput {
  assert.equal(
    result.successful,
    true,
    JSON.stringify(result.diagnostics, null, 2),
  );

  if (!result.successful) {
    throw new Error("Expected successful adoption evidence.");
  }

  return result.value;
}

function generatedDefinition(
  output: CollectionBuildOutput,
  name: string,
): IconDefinition {
  const module = output.files.find(
    (file) => file.path === `src/icons/${name}.icon.ts`,
  );
  const match = /\$Icon\.define\(([\s\S]+)\);\s*$/u.exec(
    module?.content ?? "",
  );

  assert.notEqual(module, undefined);
  assert.notEqual(match?.[1], undefined);
  return Icon.define(JSON.parse(match?.[1] ?? "null") as IconDefinition);
}

test("locates the exact Illustrator cleanup boundary before adoption", () => {
  const raw = build("viability", [
    entry(
      "viability",
      "illustrator-export",
      "adoption/illustrator-export.svg",
      "Illustrator Export",
    ),
  ]);

  assert.equal(raw.successful, false);
  assert.deepEqual(
    raw.diagnostics.map((diagnostic) => diagnostic.code),
    [
      "ASTER-SAFETY-008",
      "ASTER-SAFETY-007",
      "ASTER-SAFETY-007",
    ],
  );
  assert.equal("value" in raw, false);

  const output = successful(build("viability", [
    entry(
      "viability",
      "illustrator-adopted",
      "adoption/illustrator-adopted.svg",
      "Illustrator Adopted",
    ),
  ]));
  const definition = generatedDefinition(output, "illustrator-adopted");

  assert.deepEqual(definition.nodes, [
    {
      kind: "line",
      x1: 12,
      y1: 12,
      x2: 20.5,
      y2: 12,
      fill: "none",
      stroke: "#000000",
      strokeMiterLimit: 10,
    },
    {
      kind: "ellipse",
      cx: 12,
      cy: 12,
      radiusX: 9,
      radiusY: 4,
      fill: "none",
      stroke: "#000000",
      strokeMiterLimit: 10,
    },
  ]);
  assert.match(
    output.files.find(
      (file) => file.path === "src/icons/illustrator-adopted.icon.ts",
    )?.content ?? "",
    /Do not edit manually\./u,
  );
});

test("separates external SVG portability cleanup from geometry normalisation", () => {
  const raw = build("viability", [
    entry(
      "viability",
      "external-style",
      "adoption/external-style.svg",
      "External Style",
    ),
  ]);

  assert.equal(raw.successful, false);
  assert.deepEqual(
    raw.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-TECHNICAL-005", "ASTER-TECHNICAL-005"],
  );

  const output = successful(build("viability", [
    entry(
      "viability",
      "external-adopted",
      "adoption/external-adopted.svg",
      "External Adopted",
    ),
  ]));
  const definition = generatedDefinition(output, "external-adopted");

  assert.deepEqual(definition.nodes, [
    {
      kind: "path",
      data: "M 4 12 h 16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.5,
      strokeLineCap: "round",
    },
  ]);
});

test("accepts host-reviewed minimum metadata without assigning semantics to SVG", () => {
  const output = successful(build("viability", [
    entry(
      "viability",
      "reviewed-metadata",
      "adoption/external-adopted.svg",
      "Reviewed Metadata",
    ),
  ]));
  const definition = generatedDefinition(output, "reviewed-metadata");

  assert.deepEqual(definition.metadata, {
    displayName: "Reviewed Metadata",
    rtl: "preserve",
    presentation: {
      defaults: {
        fill: "none",
        stroke: "currentColor",
      },
      overrides: [],
      defaultSize: 24,
      minimumSize: 16,
    },
    licence: "ISC",
    attribution: "Aster viability evidence",
    deprecated: false,
  });
});

test("composes single, batch, collection, and multiple collection builds", () => {
  const first = entry(
    "alpha",
    "illustrator-adopted",
    "adoption/illustrator-adopted.svg",
  );
  const second = entry(
    "alpha",
    "external-adopted",
    "adoption/external-adopted.svg",
  );
  const single = successful(build("alpha", [first]));
  const batch = successful(build("alpha", [second, first]));
  const reordered = successful(build("alpha", [first, second]));
  const independent = successful(build("beta", [
    entry(
      "beta",
      "external-adopted",
      "adoption/external-adopted.svg",
    ),
  ]));

  assert.equal(single.files.length, 5);
  assert.equal(batch.files.length, 6);
  assert.deepEqual(batch, reordered);
  assert.equal(batch.collection, "alpha");
  assert.equal(independent.collection, "beta");
  assert.equal(batch.packageName, "@aster/alpha");
  assert.equal(independent.packageName, "@aster/beta");
  assert.equal(
    batch.files.some((file) => file.content.includes("@aster/beta")),
    false,
  );
});
