import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import type { IconMetadata } from "@aster/core";
import {
  IconImport,
  IconImportError,
  iconImportFormats,
  type IconAdoptionRequest,
  type SvgIconImportSource,
} from "../../src/index.js";

const fixtureRoot = new URL("../fixtures/svg/", import.meta.url);
const metadata: IconMetadata = {
  displayName: "External Adopted",
  tags: ["adopted", "external"],
  rtl: "preserve",
  presentation: {
    defaults: {},
    overrides: [],
  },
  deprecated: false,
};

function source(
  identity: SvgIconImportSource["identity"],
  fixture = "adoption/external-adopted.svg",
): SvgIconImportSource {
  return {
    format: iconImportFormats.svg,
    sourceId: `fixtures/${identity.namespace ?? "icons"}/${identity.name}.svg`,
    identity,
    content: readFileSync(new URL(fixture, fixtureRoot), "utf8"),
  };
}

function request(
  name: string,
  namespace = "aster",
): IconAdoptionRequest {
  return {
    source: source({ namespace, name }),
    metadata: {
      ...metadata,
      displayName: name,
    },
  };
}

test("inspects SVG as a format-neutral immutable draft", () => {
  const result = IconImport.inspect(source({ namespace: "aster", name: "check" }));

  assert.equal(result.successful, true);

  if (!result.successful) {
    throw new Error("Expected successful source inspection.");
  }

  assert.deepEqual(result.value.identity, { namespace: "aster", name: "check" });
  assert.deepEqual(result.value.viewBox, {
    minX: 0,
    minY: 0,
    width: 24,
    height: 24,
  });
  assert.equal(result.value.metrics.primitiveCount, 1);
  assert.equal(result.value.provenance.format, iconImportFormats.svg);
  assert.equal(Object.isFrozen(result.value), true);
  assert.equal(Object.isFrozen(result.value.nodes), true);
});

test("returns source diagnostics for rejected SVG instead of partial output", () => {
  const result = IconImport.inspect(source(
    { namespace: "aster", name: "unsafe" },
    "unsafe/script.svg",
  ));

  assert.equal(result.successful, false);
  assert.equal("value" in result, false);
  assert.equal(result.diagnostics.some((diagnostic) => diagnostic.severity === "error"), true);
});

test("adopts reviewed metadata and emits editable TypeScript", () => {
  const result = IconImport.adopt(request("external-adopted"));

  assert.equal(result.successful, true);

  if (!result.successful) {
    throw new Error("Expected successful icon adoption.");
  }

  assert.equal(result.value.definition.metadata.displayName, "external-adopted");
  assert.equal(result.value.module.symbol, "ExternalAdopted");
  assert.equal(result.value.module.suggestedPath, "icons/external-adopted.icon.ts");
  assert.match(result.value.module.content, /\$Icon\.define\(/u);
  assert.match(result.value.module.content, /Adopted from:/u);
  assert.doesNotMatch(result.value.module.content, /generated|Do not edit/iu);
});

test("rejects invalid reviewed metadata through stable adoption diagnostics", () => {
  const result = IconImport.adopt({
    source: source({ namespace: "aster", name: "invalid-metadata" }),
    metadata: { ...metadata, displayName: "" },
  });

  assert.equal(result.successful, false);
  assert.deepEqual(
    result.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-ADOPTION-001"],
  );
});

test("adopts batches atomically in canonical identity order", () => {
  const result = IconImport.adoptMany([
    request("zeta"),
    request("alpha"),
  ]);

  assert.equal(result.successful, true);

  if (!result.successful) {
    throw new Error("Expected successful batch adoption.");
  }

  assert.deepEqual(
    result.value.entries.map((entry) => entry.definition.identity.name),
    ["alpha", "zeta"],
  );

  const duplicate = IconImport.adoptMany([
    request("alpha"),
    request("alpha"),
  ]);

  assert.equal(duplicate.successful, false);
  assert.equal("value" in duplicate, false);
  assert.deepEqual(
    duplicate.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-ADOPTION-003", "ASTER-ADOPTION-004"],
  );
});

test("distinguishes namespace and variant positions in batch identities", () => {
  const result = IconImport.adoptMany([
    {
      source: source({ namespace: "alpha", name: "beta" }),
      metadata: { ...metadata, displayName: "Namespaced beta" },
    },
    {
      source: source({ name: "alpha", variant: "beta" }),
      metadata: { ...metadata, displayName: "Alpha beta variant" },
    },
  ]);

  assert.equal(result.successful, true);

  if (!result.successful) {
    throw new Error("Expected distinct namespace and variant identities.");
  }

  assert.deepEqual(
    result.value.entries.map((entry) => entry.definition.identity),
    [
      { namespace: "alpha", name: "beta" },
      { name: "alpha", variant: "beta" },
    ],
  );
});

test("throws only for malformed public API invocation", () => {
  assert.throws(
    () => IconImport.inspect(null as never),
    (error: unknown) =>
      error instanceof IconImportError && error.path === "source",
  );
  assert.throws(
    () => IconImport.adoptMany([]),
    (error: unknown) =>
      error instanceof IconImportError && error.path === "requests",
  );
  assert.throws(
    () => IconImport.define(null as never),
    (error: unknown) =>
      error instanceof IconImportError && error.path === "request",
  );
  assert.throws(
    () => IconImport.emit(null as never),
    (error: unknown) =>
      error instanceof IconImportError && error.path === "request",
  );
  assert.throws(
    () => IconImport.adopt(null as never),
    (error: unknown) =>
      error instanceof IconImportError && error.path === "request",
  );
  assert.throws(
    () => IconImport.adoptMany([null as never]),
    (error: unknown) =>
      error instanceof IconImportError && error.path === "request",
  );
  assert.throws(
    () => IconImport.inspect({
      ...source({ namespace: "aster", name: "unsafe-source-id" }),
      sourceId: "icons/injected.svg\nexport const injected = true;",
    }),
    (error: unknown) =>
      error instanceof IconImportError && error.path === "source.sourceId",
  );
});

test("rejects reflective request state without executing accessors", () => {
  let reads = 0;
  const reflectiveSource = {
    get format() {
      reads += 1;
      return iconImportFormats.svg;
    },
    sourceId: "icons/reflective.svg",
    identity: { name: "reflective" },
    content: "<svg />",
  };

  assert.throws(
    () => IconImport.inspect(reflectiveSource),
    (error: unknown) =>
      error instanceof IconImportError && error.path === "source.format",
  );
  assert.equal(reads, 0);

  const sparse = new Array<IconAdoptionRequest>(1);
  assert.throws(
    () => IconImport.adoptMany(sparse),
    (error: unknown) =>
      error instanceof IconImportError && error.path === "requests[0]",
  );

  const authored = [request("authored-array")];
  Object.defineProperty(authored, "sideState", {
    enumerable: true,
    value: true,
  });
  assert.throws(
    () => IconImport.adoptMany(authored),
    (error: unknown) =>
      error instanceof IconImportError && error.path === "requests.sideState",
  );
});
