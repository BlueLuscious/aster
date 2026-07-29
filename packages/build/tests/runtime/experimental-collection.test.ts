import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import type {
  IconDefinition,
  IconPresentation,
  IconPresentationOverrideType,
  IconRtlPolicyType,
} from "@aster/core";
import type { IIconMetadataValue } from "../../src/normalisation/contracts/internal/icon-metadata-value.contract.js";
import type { ICollectionMetadataValue } from "../../src/normalisation/contracts/internal/collection-metadata-value.contract.js";
import type { ISvgValidationEntry } from "../../src/validation/contracts/internal/svg-validation-entry.contract.js";
import type {
  CollectionMetadataSource,
  IconMetadataSource,
} from "../../src/source/contracts/index.js";
import { SvgNormaliser } from "../../src/normalisation/runtime/svg.normaliser.js";
import { SvgParser } from "../../src/parser/runtime/svg.parser.js";
import { IngestionSourceFactory } from "../../src/source/runtime/ingestion-source.factory.js";
import { CollectionValidationContractFactory } from "../../src/validation/runtime/collection-validation-contract.factory.js";
import { SvgValidator } from "../../src/validation/runtime/svg.validator.js";

type TCollectionMetadataFixture = {
  readonly schemaVersion: number;
  readonly slug: string;
  readonly status: string;
  readonly licence: string;
  readonly attribution: string;
  readonly allowIconLicenceOverride: boolean;
  readonly defaultSize: number;
  readonly minimumSize: number;
  readonly presentationDefaults: IconPresentation;
  readonly presentationOverrides: readonly IconPresentationOverrideType[];
  readonly validation: Readonly<Record<string, unknown>>;
};

type TIconMetadataFixture = {
  readonly schemaVersion: number;
  readonly name: string;
  readonly displayName: string;
  readonly rtl: IconRtlPolicyType;
  readonly deprecated: boolean;
};

const collectionRoot = new URL(
  "../../../../collections/experimental/",
  import.meta.url,
);
const fixtureRoot = new URL(
  "../../../../tests/fixtures/collections/experimental/",
  import.meta.url,
);
const iconNames = Object.freeze(["frame", "orbit", "spark"] as const);
const parser = new SvgParser();
const sourceFactory = new IngestionSourceFactory();
const contractFactory = new CollectionValidationContractFactory();
const validator = new SvgValidator();
const normaliser = new SvgNormaliser();

function text(root: URL, path: string): string {
  return readFileSync(new URL(path, root), "utf8");
}

function json<Value>(root: URL, path: string): Value {
  return JSON.parse(text(root, path)) as Value;
}

function collectionFixture(): TCollectionMetadataFixture {
  return json<TCollectionMetadataFixture>(
    collectionRoot,
    "metadata/collection.json",
  );
}

function collectionSource(
  collection: TCollectionMetadataFixture,
): CollectionMetadataSource {
  const accepted = sourceFactory.create({
    kind: "collection-metadata",
    sourceId: "collections/experimental/metadata/collection.json",
    content: text(collectionRoot, "metadata/collection.json"),
    collection: collection.slug,
  });

  assert.equal(accepted.kind, "collection-metadata");

  if (accepted.kind !== "collection-metadata") {
    throw new Error("Expected collection metadata source.");
  }

  return accepted;
}

function canonicalInputs(collection: TCollectionMetadataFixture): {
  readonly entries: readonly ISvgValidationEntry[];
  readonly metadataSources: readonly IconMetadataSource[];
  readonly metadataValues: readonly IIconMetadataValue[];
} {
  const entries: ISvgValidationEntry[] = [];
  const metadataSources: IconMetadataSource[] = [];
  const metadataValues: IIconMetadataValue[] = [];

  for (const name of iconNames) {
    const identity = { collection: collection.slug, name };
    const svgSource = sourceFactory.create({
      kind: "svg",
      sourceId: `collections/experimental/svg/${name}.svg`,
      content: text(collectionRoot, `svg/${name}.svg`),
      identity,
    });
    const metadataContent = text(collectionRoot, `metadata/${name}.json`);
    const metadata = JSON.parse(metadataContent) as TIconMetadataFixture;
    const metadataSource = sourceFactory.create({
      kind: "icon-metadata",
      sourceId: `collections/experimental/metadata/${name}.json`,
      content: metadataContent,
      identity,
    });

    assert.equal(svgSource.kind, "svg");
    assert.equal(metadataSource.kind, "icon-metadata");
    assert.equal(metadata.schemaVersion, collection.schemaVersion);
    assert.equal(metadata.name, name);

    if (
      svgSource.kind !== "svg" ||
      metadataSource.kind !== "icon-metadata"
    ) {
      throw new Error("Expected paired experimental icon sources.");
    }

    const syntax = parser.parse(svgSource);
    assert.equal(syntax.successful, true);

    if (!syntax.successful) {
      throw new Error("Expected parser-safe experimental SVG.");
    }

    entries.push({ source: svgSource, document: syntax.value });
    metadataSources.push(metadataSource);
    metadataValues.push({
      sourceId: metadataSource.sourceId,
      identity,
      displayName: metadata.displayName,
      rtl: metadata.rtl,
      deprecated: metadata.deprecated,
    });
  }

  return {
    entries,
    metadataSources,
    metadataValues,
  };
}

function collectionMetadataValue(
  collection: TCollectionMetadataFixture,
  source: CollectionMetadataSource,
): ICollectionMetadataValue {
  return {
    sourceId: source.sourceId,
    collection: collection.slug,
    presentation: {
      defaults: collection.presentationDefaults,
      overrides: collection.presentationOverrides,
      defaultSize: collection.defaultSize,
      minimumSize: collection.minimumSize,
    },
    licence: collection.licence,
    attribution: collection.attribution,
    allowIconLicenceOverride: collection.allowIconLicenceOverride,
  };
}

test("normalises the canonical experimental collection to its golden definitions", () => {
  const collection = collectionFixture();
  const metadataSource = collectionSource(collection);
  const inputs = canonicalInputs(collection);
  const collectionContract = contractFactory.create({
    collection: collection.slug,
    ...collection.validation,
  });
  const validation = validator.validate({
    collectionMetadata: metadataSource,
    entries: inputs.entries,
    iconMetadata: inputs.metadataSources,
    collectionContract,
  });

  assert.equal(collection.schemaVersion, 1);
  assert.equal(collection.status, "experimental");
  assert.equal(validation.successful, true);
  assert.deepEqual(validation.diagnostics, []);

  if (!validation.successful) {
    throw new Error("Expected valid experimental collection.");
  }

  const definitions = normaliser.normalise({
    evidence: validation.value,
    collectionMetadata: collectionMetadataValue(
      collection,
      metadataSource,
    ),
    iconMetadata: inputs.metadataValues,
  });
  const expected = json<readonly IconDefinition[]>(
    fixtureRoot,
    "expected/definitions.normalised.json",
  );

  assert.deepEqual(definitions, expected);
});

test("matches the experimental unsafe-source diagnostic evidence", () => {
  const source = sourceFactory.create({
    kind: "svg",
    sourceId: "fixtures/experimental/unsafe-script.svg",
    content: text(fixtureRoot, "invalid/unsafe-script.svg"),
    identity: {
      collection: "experimental",
      name: "unsafe-script",
    },
  });

  assert.equal(source.kind, "svg");

  if (source.kind !== "svg") {
    throw new Error("Expected unsafe SVG source.");
  }

  const result = parser.parse(source);

  assert.equal(result.successful, false);
  assert.deepEqual(
    result.diagnostics.map((diagnostic) => diagnostic.code),
    json<readonly string[]>(
      fixtureRoot,
      "invalid/unsafe-script.diagnostics.json",
    ),
  );
});

test("matches warning-only experimental collection drift evidence", () => {
  const collection = collectionFixture();
  const metadataSource = collectionSource(collection);
  const identity = {
    collection: collection.slug,
    name: "collection-drift",
  };
  const svgSource = sourceFactory.create({
    kind: "svg",
    sourceId: "collections/experimental/svg/collection-drift.svg",
    content: text(fixtureRoot, "warning/collection-drift.svg"),
    identity,
  });
  const iconMetadata = sourceFactory.create({
    kind: "icon-metadata",
    sourceId: "collections/experimental/metadata/collection-drift.json",
    content: "{}",
    identity,
  });

  assert.equal(svgSource.kind, "svg");
  assert.equal(iconMetadata.kind, "icon-metadata");

  if (
    svgSource.kind !== "svg" ||
    iconMetadata.kind !== "icon-metadata"
  ) {
    throw new Error("Expected warning fixture source pair.");
  }

  const syntax = parser.parse(svgSource);
  assert.equal(syntax.successful, true);

  if (!syntax.successful) {
    throw new Error("Expected parser-safe warning fixture.");
  }

  const result = validator.validate({
    collectionMetadata: metadataSource,
    entries: [{ source: svgSource, document: syntax.value }],
    iconMetadata: [iconMetadata],
    collectionContract: contractFactory.create({
      collection: collection.slug,
      ...collection.validation,
    }),
  });

  assert.equal(result.successful, true);
  assert.deepEqual(
    result.diagnostics.map((diagnostic) => diagnostic.code),
    json<readonly string[]>(
      fixtureRoot,
      "warning/collection-drift.diagnostics.json",
    ),
  );
});
