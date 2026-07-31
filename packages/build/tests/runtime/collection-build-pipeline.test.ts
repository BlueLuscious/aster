import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import type {
  CollectionBuildEntry,
  CollectionBuildRequest,
} from "../../src/pipeline/contracts/index.js";
import type { CollectionMetadataSource } from "../../src/source/contracts/index.js";
import { CollectionBuildPipeline } from "../../src/pipeline/runtime/collection-build.pipeline.js";
import { IngestionSourceFactory } from "../../src/source/runtime/ingestion-source.factory.js";

const fixtureRoot = new URL("../fixtures/svg/", import.meta.url);
const pipeline = new CollectionBuildPipeline();
const sourceFactory = new IngestionSourceFactory();

function fixture(path: string): string {
  return readFileSync(new URL(path, fixtureRoot), "utf8");
}

function collectionMetadata(
  validation: Readonly<Record<string, unknown>> = {},
): CollectionMetadataSource {
  const source = sourceFactory.create({
    kind: "collection-metadata",
    sourceId: "fixtures/metadata/collection.json",
    collection: "fixture",
    content: JSON.stringify({
      schemaVersion: 1,
      name: "Fixture",
      slug: "fixture",
      status: "experimental",
      description: "Fixture icon definitions.",
      package: {
        name: "@aster/fixture",
        version: "0.0.0",
      },
      licence: "ISC",
      attribution: "Aster tests",
      allowIconLicenceOverride: false,
      defaultSize: 24,
      minimumSize: 16,
      presentationDefaults: {
        fill: "none",
        stroke: "currentColor",
      },
      presentationOverrides: ["stroke"],
      validation,
    }),
  });

  assert.equal(source.kind, "collection-metadata");

  if (source.kind !== "collection-metadata") {
    throw new Error("Expected collection metadata source.");
  }

  return source;
}

function entry(name: string, svgContent: string): CollectionBuildEntry {
  const identity = { namespace: "fixture", name };
  const svg = sourceFactory.create({
    kind: "svg",
    sourceId: `fixtures/svg/${name}.svg`,
    content: svgContent,
    identity,
  });
  const metadata = sourceFactory.create({
    kind: "icon-metadata",
    sourceId: `fixtures/metadata/icons/${name}.json`,
    content: JSON.stringify({
      schemaVersion: 1,
      name,
      displayName: "Fixture Icon",
      rtl: "preserve",
      deprecated: false,
    }),
    identity,
  });

  assert.equal(svg.kind, "svg");
  assert.equal(metadata.kind, "icon-metadata");

  if (svg.kind !== "svg" || metadata.kind !== "icon-metadata") {
    throw new Error("Expected paired fixture sources.");
  }

  return { svg, metadata };
}

function request(
  buildEntry = entry("sample", fixture("valid/basic.svg")),
  validation: Readonly<Record<string, unknown>> = {},
): CollectionBuildRequest {
  return {
    collectionMetadata: collectionMetadata(validation),
    entries: [buildEntry],
  };
}

test("builds one complete headless definition package deterministically", () => {
  const first = pipeline.build(request());
  const second = pipeline.build(request());

  assert.equal(first.successful, true);
  assert.equal(second.successful, true);

  if (!first.successful || !second.successful) {
    throw new Error("Expected successful fixture builds.");
  }

  assert.deepEqual(first.value, second.value);
  assert.deepEqual(first.diagnostics, []);
  assert.equal(first.value.packageName, "@aster/fixture");
  assert.deepEqual(
    first.value.files.map((file) => file.path),
    [
      "package.json",
      "src/icons/sample.icon.ts",
      "src/index.ts",
      "src/manifest.ts",
      "tsconfig.json",
    ],
  );
});

test("preserves warnings with output and blocks output on errors", () => {
  const warning = pipeline.build(
    request(
      entry("advisory", fixture("collection/advisories.svg")),
      {
        viewBox: {
          expected: {
            minX: 0,
            minY: 0,
            width: 24,
            height: 24,
          },
          severity: "warning",
        },
      },
    ),
  );
  const invalidRequest = request();
  const invalid = pipeline.build({
    ...invalidRequest,
    entries: invalidRequest.entries.map((current) => ({
      ...current,
      metadata: {
        ...current.metadata,
        content: "{",
      },
    })),
  });

  assert.equal(warning.successful, true);
  assert.ok(warning.diagnostics.length > 0);
  assert.ok(
    warning.diagnostics.every(
      (diagnostic) => diagnostic.severity === "warning",
    ),
  );
  assert.equal(invalid.successful, false);
  assert.deepEqual(
    invalid.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-METADATA-001"],
  );
  assert.equal("value" in invalid, false);
});
