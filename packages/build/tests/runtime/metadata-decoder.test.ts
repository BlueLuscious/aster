import assert from "node:assert/strict";
import test from "node:test";

import type {
  CollectionMetadataSource,
  IconMetadataSource,
} from "../../src/source/contracts/index.js";
import { IngestionSourceFactory } from "../../src/source/runtime/ingestion-source.factory.js";
import { JsonMetadataDecoder } from "../../src/metadata/runtime/json-metadata.decoder.js";

const decoder = new JsonMetadataDecoder();
const sourceFactory = new IngestionSourceFactory();

function collectionSource(content: string): CollectionMetadataSource {
  const source = sourceFactory.create({
    kind: "collection-metadata",
    sourceId: "fixtures/metadata/collection.json",
    content,
    collection: "fixture",
  });

  assert.equal(source.kind, "collection-metadata");

  if (source.kind !== "collection-metadata") {
    throw new Error("Expected collection metadata source.");
  }

  return source;
}

function iconSource(content: string): IconMetadataSource {
  const source = sourceFactory.create({
    kind: "icon-metadata",
    sourceId: "fixtures/metadata/icons/frame.json",
    content,
    identity: {
      collection: "fixture",
      name: "frame",
    },
  });

  assert.equal(source.kind, "icon-metadata");

  if (source.kind !== "icon-metadata") {
    throw new Error("Expected icon metadata source.");
  }

  return source;
}

function collectionValue(
  overrides: Readonly<Record<string, unknown>> = {},
): Readonly<Record<string, unknown>> {
  return {
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
    validation: {},
    ...overrides,
  };
}

test("decodes immutable version-one collection and icon metadata", () => {
  const collection = decoder.decodeCollection(
    collectionSource(JSON.stringify(collectionValue())),
  );
  const icon = decoder.decodeIcon(
    iconSource(
      JSON.stringify({
        schemaVersion: 1,
        name: "frame",
        displayName: "Frame",
        rtl: "preserve",
        deprecated: false,
      }),
    ),
  );

  assert.equal(collection.successful, true);
  assert.equal(icon.successful, true);

  if (!collection.successful || !icon.successful) {
    throw new Error("Expected accepted metadata.");
  }

  assert.equal(collection.value.packageName, "@aster/fixture");
  assert.deepEqual(icon.value.identity, {
    collection: "fixture",
    name: "frame",
  });
  assert.ok(Object.isFrozen(collection.value));
  assert.ok(Object.isFrozen(collection.value.validation));
  assert.ok(Object.isFrozen(icon.value));
});

test("reports malformed JSON and duplicate decoded keys deterministically", () => {
  const malformed = decoder.decodeIcon(iconSource("{"));
  const duplicate = decoder.decodeIcon(
    iconSource(
      '{"schemaVersion":1,"name":"frame","na\\u006de":"frame","displayName":"Frame"}',
    ),
  );

  assert.equal(malformed.successful, false);
  assert.equal(duplicate.successful, false);
  assert.deepEqual(
    malformed.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-METADATA-001"],
  );
  assert.deepEqual(
    duplicate.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-METADATA-002"],
  );
  assert.equal(duplicate.diagnostics[0]?.span?.start.offset, 34);
  assert.equal(duplicate.diagnostics[0]?.span?.end.offset, 45);
});

test("reports unknown fields, unsupported versions, and acquired identity disagreement", () => {
  const unknown = decoder.decodeIcon(
    iconSource(
      JSON.stringify({
        schemaVersion: 1,
        name: "frame",
        displayName: "Frame",
        aliases: [],
      }),
    ),
  );
  const version = decoder.decodeCollection(
    collectionSource(
      JSON.stringify(collectionValue({ schemaVersion: 2 })),
    ),
  );
  const identity = decoder.decodeIcon(
    iconSource(
      JSON.stringify({
        schemaVersion: 1,
        name: "orbit",
        displayName: "Orbit",
      }),
    ),
  );

  assert.deepEqual(
    unknown.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-METADATA-003"],
  );
  assert.deepEqual(
    version.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-METADATA-004"],
  );
  assert.deepEqual(
    identity.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-METADATA-005"],
  );
});

test("reports invalid semantic metadata values without native exception text", () => {
  const result = decoder.decodeCollection(
    collectionSource(
      JSON.stringify(
        collectionValue({
          allowIconLicenceOverride: "yes",
        }),
      ),
    ),
  );

  assert.equal(result.successful, false);
  assert.deepEqual(
    result.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-METADATA-006"],
  );
  assert.doesNotMatch(
    result.diagnostics[0]?.message ?? "",
    /boolean|TypeError|JSON/iu,
  );
});
