import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import type { ISvgSyntaxDocument } from "../../src/parser/contracts/internal/svg-syntax-document.contract.js";
import type {
  CanonicalSvgSource,
  IconMetadataSource,
} from "../../src/source/contracts/index.js";
import type { ICollectionValidationContract } from "../../src/validation/contracts/internal/collection-validation-contract.contract.js";
import type { ISvgValidationEntry } from "../../src/validation/contracts/internal/svg-validation-entry.contract.js";
import { SvgParser } from "../../src/parser/runtime/svg.parser.js";
import { IngestionSourceFactory } from "../../src/source/runtime/ingestion-source.factory.js";
import { CollectionValidationContractFactory } from "../../src/validation/runtime/collection-validation-contract.factory.js";
import { SvgValidator } from "../../src/validation/runtime/svg.validator.js";

const parser = new SvgParser();
const sourceFactory = new IngestionSourceFactory();
const contractFactory = new CollectionValidationContractFactory();
const validator = new SvgValidator();
const fixtureRoot = new URL("../fixtures/svg/", import.meta.url);

function fixture(path: string): string {
  return readFileSync(new URL(path, fixtureRoot), "utf8");
}

function identity(name = "camera") {
  return {
    collection: "minimal",
    name,
  };
}

function svgSource(
  content: string,
  name = "camera",
): CanonicalSvgSource {
  const accepted = sourceFactory.create({
    kind: "svg",
    sourceId: `fixtures/svg/${name}.svg`,
    content,
    identity: identity(name),
  });

  assert.equal(accepted.kind, "svg");
  return accepted;
}

function syntax(source: CanonicalSvgSource): ISvgSyntaxDocument {
  const result = parser.parse(source);

  assert.equal(result.successful, true);

  if (!result.successful) {
    throw new Error("Expected parser-safe fixture.");
  }

  return result.value;
}

function entry(
  path: string,
  name = "camera",
): ISvgValidationEntry {
  const source = svgSource(fixture(path), name);

  return Object.freeze({
    source,
    document: syntax(source),
  });
}

function metadata(name = "camera"): IconMetadataSource {
  const accepted = sourceFactory.create({
    kind: "icon-metadata",
    sourceId: `fixtures/metadata/icons/${name}.json`,
    content: "{}",
    identity: identity(name),
  });

  assert.equal(accepted.kind, "icon-metadata");
  return accepted;
}

function collectionMetadata() {
  const accepted = sourceFactory.create({
    kind: "collection-metadata",
    sourceId: "fixtures/metadata/collection.json",
    content: "{}",
    collection: "minimal",
  });

  assert.equal(accepted.kind, "collection-metadata");
  return accepted;
}

function contract(
  value: Record<string, unknown> = { collection: "minimal" },
): ICollectionValidationContract {
  return contractFactory.create(value);
}

function validate(
  entries: readonly ISvgValidationEntry[],
  collectionContract = contract(),
  iconMetadata = [
    ...new Map(
      entries.map((accepted) => [
        accepted.source.identity.name,
        metadata(accepted.source.identity.name),
      ]),
    ).values(),
  ],
) {
  return validator.validate({
    collectionMetadata: collectionMetadata(),
    entries,
    iconMetadata,
    collectionContract,
  });
}

test("accepts technically valid source and orders evidence by canonical identity", () => {
  const result = validate([
    entry("valid/basic.svg", "zebra"),
    entry("valid/basic.svg", "camera"),
  ]);

  assert.equal(result.successful, true);

  if (!result.successful) {
    return;
  }

  assert.deepEqual(
    result.value.entries.map((accepted) => accepted.source.identity.name),
    ["camera", "zebra"],
  );
  assert.deepEqual(result.diagnostics, []);
  assert.ok(Object.isFrozen(result.value));
  assert.ok(Object.isFrozen(result.value.entries));
  assert.ok(Object.isFrozen(result.value.entries[0]?.metrics));
});

test("preserves independent technical failures without returning evidence", () => {
  const result = validate([entry("technical/invalid-values.svg")]);

  assert.equal(result.successful, false);
  assert.equal("value" in result, false);
  assert.deepEqual(
    result.diagnostics.map((diagnostic) => diagnostic.code),
    [
      "ASTER-SYNTAX-002",
      "ASTER-TECHNICAL-005",
      "ASTER-SYNTAX-004",
      "ASTER-SYNTAX-003",
      "ASTER-SYNTAX-005",
      "ASTER-SYNTAX-003",
    ],
  );
});

test("rejects source without supported non-empty geometry", () => {
  const result = validate([entry("technical/empty.svg")]);

  assert.equal(result.successful, false);
  assert.deepEqual(
    result.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-TECHNICAL-006"],
  );
});

test("rejects structural opacity that cannot survive group flattening", () => {
  const result = validate([entry("technical/structural-opacity.svg")]);

  assert.equal(result.successful, false);
  assert.equal("value" in result, false);
  assert.deepEqual(
    result.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-SYNTAX-005"],
  );
});

test("reports collection hypotheses as deterministic warnings", () => {
  const configured = contract({
    collection: "minimal",
    viewBox: {
      expected: {
        minX: 0,
        minY: 0,
        width: 24,
        height: 24,
      },
      severity: "warning",
    },
    stroke: {
      acceptedWidths: [1],
      severity: "warning",
    },
    grid: {
      step: 1,
      severity: "warning",
    },
    bounds: {
      inset: [2, 2, 2, 2],
      severity: "warning",
    },
    complexity: {
      maxPrimitives: 1,
      maxPathCommands: 2,
      severity: "warning",
    },
  });
  const first = validate(
    [entry("collection/advisories.svg")],
    configured,
  );
  const second = validate(
    [entry("collection/advisories.svg")],
    configured,
  );

  assert.equal(first.successful, true);
  assert.equal(second.successful, true);
  assert.deepEqual(first.diagnostics, second.diagnostics);
  assert.deepEqual(
    first.diagnostics.map((diagnostic) => diagnostic.code),
    [
      "ASTER-COLLECTION-005",
      "ASTER-COLLECTION-001",
      "ASTER-COLLECTION-002",
      "ASTER-COLLECTION-004",
      "ASTER-COLLECTION-003",
    ],
  );
  assert.equal(
    first.diagnostics.every(
      (diagnostic) =>
        diagnostic.category === "collection" &&
        diagnostic.severity === "warning",
    ),
    true,
  );
});

test("allows an accepted collection contract to promote one visual rule", () => {
  const configured = contract({
    collection: "minimal",
    stroke: {
      acceptedWidths: [1],
      severity: "warning",
    },
    grid: {
      step: 1,
      severity: "error",
    },
  });
  const result = validate(
    [entry("collection/advisories.svg")],
    configured,
  );

  assert.equal(result.successful, false);
  assert.equal("value" in result, false);
  assert.deepEqual(
    result.diagnostics.map((diagnostic) => [
      diagnostic.code,
      diagnostic.severity,
    ]),
    [
      ["ASTER-COLLECTION-002", "warning"],
      ["ASTER-COLLECTION-003", "error"],
    ],
  );
});

test("rejects identity disagreement and duplicate canonical identity", () => {
  const first = entry("valid/basic.svg");
  const disagreement = validate(
    [first],
    contract(),
    [metadata("other")],
  );
  const duplicate = validate([first, first]);
  const duplicateMetadata = validate(
    [first],
    contract(),
    [metadata(), metadata()],
  );

  assert.equal(disagreement.successful, false);
  assert.deepEqual(
    disagreement.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-TECHNICAL-007", "ASTER-TECHNICAL-007"],
  );
  assert.equal(duplicate.successful, false);
  assert.deepEqual(
    duplicate.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-TECHNICAL-008"],
  );
  assert.equal(duplicate.diagnostics[0]?.related?.length, 1);
  assert.equal(duplicateMetadata.successful, false);
  assert.deepEqual(
    duplicateMetadata.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-TECHNICAL-008"],
  );
});

test("rejects malformed collection-rule authority as a build contract error", () => {
  assert.throws(
    () =>
      contractFactory.create({
        collection: "minimal",
        grid: {
          step: 0,
          severity: "warning",
        },
      }),
    {
      name: "BuildContractError",
      code: "ASTER-BUILD-001",
      path: "collectionContract.grid.step",
    },
  );

  assert.throws(
    () =>
      contractFactory.create({
        collection: "minimal",
        stroke: {
          acceptedWidths: [1, 1],
          severity: "warning",
        },
      }),
    {
      name: "BuildContractError",
      code: "ASTER-BUILD-001",
      path: "collectionContract.stroke.acceptedWidths",
    },
  );
});
