import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  Icon,
  type IconDefinition,
} from "@aster/core";
import type { IIconMetadataValue } from "../../src/normalisation/contracts/internal/icon-metadata-value.contract.js";
import type { ISvgValidationEvidence } from "../../src/validation/contracts/internal/svg-validation-evidence.contract.js";
import type { CanonicalSvgSource } from "../../src/source/contracts/index.js";
import { SvgNormaliser } from "../../src/normalisation/runtime/svg.normaliser.js";
import { SvgPathDataNormaliser } from "../../src/normalisation/runtime/svg-path-data.normaliser.js";
import { SvgParser } from "../../src/parser/runtime/svg.parser.js";
import { IngestionSourceFactory } from "../../src/source/runtime/ingestion-source.factory.js";
import { SvgValidator } from "../../src/validation/runtime/svg.validator.js";

const fixtureRoot = new URL("../fixtures/svg/", import.meta.url);
const parser = new SvgParser();
const sourceFactory = new IngestionSourceFactory();
const validator = new SvgValidator();
const normaliser = new SvgNormaliser();

function fixture(path: string): string {
  return readFileSync(new URL(path, fixtureRoot), "utf8");
}

function evidence(path: string): ISvgValidationEvidence {
  const source = sourceFactory.create({
    kind: "svg",
    sourceId: "collections/minimal/svg/camera.svg",
    content: fixture(path),
    identity: {
      collection: "minimal",
      name: "camera",
    },
  });

  assert.equal(source.kind, "svg");
  const syntax = parser.parse(source as CanonicalSvgSource);
  assert.equal(syntax.successful, true);

  if (!syntax.successful) {
    throw new Error("Expected parser-safe normalisation fixture.");
  }

  const collectionMetadata = sourceFactory.create({
    kind: "collection-metadata",
    sourceId: "collections/minimal/metadata/collection.json",
    content: "{}",
    collection: "minimal",
  });
  const iconMetadata = sourceFactory.create({
    kind: "icon-metadata",
    sourceId: "collections/minimal/metadata/camera.json",
    content: "{}",
    identity: {
      collection: "minimal",
      name: "camera",
    },
  });

  assert.equal(collectionMetadata.kind, "collection-metadata");
  assert.equal(iconMetadata.kind, "icon-metadata");

  const result = validator.validate({
    collectionMetadata,
    entries: [
      {
        source: source as CanonicalSvgSource,
        document: syntax.value,
      },
    ],
    iconMetadata: [iconMetadata],
    collectionContract: {
      collection: "minimal",
    },
  });

  assert.equal(result.successful, true);

  if (!result.successful) {
    throw new Error("Expected technically valid normalisation fixture.");
  }

  return result.value;
}

function metadata(
  overrides: Partial<IIconMetadataValue> = {},
): IIconMetadataValue {
  return {
    sourceId: "collections/minimal/metadata/camera.json",
    identity: {
      collection: "minimal",
      name: "camera",
    },
    displayName: "Camera",
    ...overrides,
  };
}

function normalise(
  path: string,
  iconMetadata = metadata(),
  allowIconLicenceOverride = false,
): IconDefinition {
  const definitions = normaliser.normalise({
    evidence: evidence(path),
    collectionMetadata: {
      sourceId: "collections/minimal/metadata/collection.json",
      collection: "minimal",
      presentation: {
        defaults: {},
        overrides: ["stroke"],
        defaultSize: 24,
        minimumSize: 16,
      },
      licence: "CC-BY-4.0",
      attribution: "Aster contributors",
      allowIconLicenceOverride,
    },
    iconMetadata: [iconMetadata],
  });

  assert.equal(definitions.length, 1);
  return definitions[0] as IconDefinition;
}

test("matches the authored portable golden definition", () => {
  const definition = normalise("normalisation/authored.svg");
  const golden = JSON.parse(
    fixture("normalisation/authored.normalised.json"),
  );

  assert.deepEqual(definition, golden);
  assert.ok(Object.isFrozen(definition));
  assert.ok(Object.isFrozen(definition.nodes));
  assert.ok(Object.isFrozen(definition.nodes[0]));
  assert.doesNotThrow(() => Icon.define(definition));
});

test("produces byte-equivalent output from equivalent canonical source", () => {
  const authored = normalise("normalisation/authored.svg");
  const equivalent = normalise("normalisation/equivalent.svg");

  assert.equal(JSON.stringify(authored), JSON.stringify(equivalent));
});

test("normalises path data idempotently without changing command semantics", () => {
  const pathNormaliser = new SvgPathDataNormaliser();
  const canonical = pathNormaliser.normalise("M02,+12 h2e1");

  assert.equal(canonical, "M 2 12 h 20");
  assert.equal(pathNormaliser.normalise(canonical), canonical);
});

test("composes allowed icon licence metadata without retaining stale attribution", () => {
  const definition = normalise(
    "normalisation/authored.svg",
    metadata({
      licence: "MIT",
      attribution: "Lotus Studio",
    }),
    true,
  );

  assert.equal(definition.metadata.licence, "MIT");
  assert.equal(definition.metadata.attribution, "Lotus Studio");
});

test("rejects metadata values outside accepted source and ownership links", () => {
  assert.throws(
    () =>
      normalise(
        "normalisation/authored.svg",
        metadata({ licence: "MIT" }),
      ),
    {
      name: "BuildContractError",
      path: "request.iconMetadata.licence",
    },
  );

  assert.throws(
    () =>
      normaliser.normalise({
        evidence: evidence("normalisation/authored.svg"),
        collectionMetadata: {
          sourceId: "other.json",
          collection: "minimal",
          presentation: {
            defaults: {},
            overrides: [],
          },
          allowIconLicenceOverride: false,
        },
        iconMetadata: [metadata()],
      }),
    {
      name: "BuildContractError",
      path: "request.collectionMetadata.sourceId",
    },
  );
});
