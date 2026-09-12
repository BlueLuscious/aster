import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  iconPathCommandKinds,
  type IconMetadata,
} from "@aster/core";
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

function inspectPath(
  data: string,
  name: string,
): ReturnType<typeof IconImport.inspect> {
  return IconImport.inspect({
    format: iconImportFormats.svg,
    sourceId: `paths/${name}.svg`,
    identity: { namespace: "paths", name },
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="${data}"/></svg>`,
  });
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
  assert.match(result.value.module.content, /"commands": \[/u);
  assert.doesNotMatch(result.value.module.content, /"data":/u);
  assert.match(result.value.module.content, /Adopted from:/u);
  assert.doesNotMatch(result.value.module.content, /generated|Do not edit/iu);
});

test("expands relative, repeated and axis-aligned path commands", () => {
  const result = inspectPath("m 1 2 3 4 h 2 2 v 3 l 1 1", "relative");

  assert.equal(result.successful, true, JSON.stringify(result.diagnostics));

  if (!result.successful) {
    throw new Error("Expected successful relative path inspection.");
  }

  assert.deepEqual(result.value.nodes, [{
    kind: "path",
    commands: [
      { kind: iconPathCommandKinds.move, x: 1, y: 2 },
      { kind: iconPathCommandKinds.line, x: 4, y: 6 },
      { kind: iconPathCommandKinds.line, x: 6, y: 6 },
      { kind: iconPathCommandKinds.line, x: 8, y: 6 },
      { kind: iconPathCommandKinds.line, x: 8, y: 9 },
      { kind: iconPathCommandKinds.line, x: 9, y: 10 },
    ],
  }]);
  assert.equal(result.value.metrics.pathCommandCount, 6);
  assert.equal(Object.isFrozen(result.value.nodes[0]?.commands), true);
});

test("expands smooth curve controls into canonical commands", () => {
  const result = inspectPath(
    "M 0 0 C 1 2 3 4 5 6 S 7 8 9 10 Q 11 12 13 14 T 15 16",
    "curves",
  );

  assert.equal(result.successful, true, JSON.stringify(result.diagnostics));

  if (!result.successful) {
    throw new Error("Expected successful curved path inspection.");
  }

  assert.deepEqual(result.value.nodes[0], {
    kind: "path",
    commands: [
      { kind: iconPathCommandKinds.move, x: 0, y: 0 },
      {
        kind: iconPathCommandKinds.cubicBezier,
        control1X: 1,
        control1Y: 2,
        control2X: 3,
        control2Y: 4,
        x: 5,
        y: 6,
      },
      {
        kind: iconPathCommandKinds.cubicBezier,
        control1X: 7,
        control1Y: 8,
        control2X: 7,
        control2Y: 8,
        x: 9,
        y: 10,
      },
      {
        kind: iconPathCommandKinds.quadraticBezier,
        controlX: 11,
        controlY: 12,
        x: 13,
        y: 14,
      },
      {
        kind: iconPathCommandKinds.quadraticBezier,
        controlX: 15,
        controlY: 16,
        x: 15,
        y: 16,
      },
    ],
  });
  assert.equal(result.value.metrics.pathCommandCount, 5);
});

test("normalises arcs, closure and compound contours", () => {
  const result = inspectPath(
    "M1 1 a 2 3 45 0 1 4 5 z M 10 10 L 12 12 z",
    "compound",
  );

  assert.equal(result.successful, true, JSON.stringify(result.diagnostics));

  if (!result.successful) {
    throw new Error("Expected successful compound path inspection.");
  }

  assert.deepEqual(result.value.nodes[0], {
    kind: "path",
    commands: [
      { kind: iconPathCommandKinds.move, x: 1, y: 1 },
      {
        kind: iconPathCommandKinds.arc,
        radiusX: 2,
        radiusY: 3,
        rotation: 45,
        largeArc: false,
        sweep: true,
        x: 5,
        y: 6,
      },
      { kind: iconPathCommandKinds.close },
      { kind: iconPathCommandKinds.move, x: 10, y: 10 },
      { kind: iconPathCommandKinds.line, x: 12, y: 12 },
      { kind: iconPathCommandKinds.close },
    ],
  });
});

test("rejects empty and structurally malformed path contours", () => {
  for (const [name, data] of [
    ["empty-contour", "M0 0"],
    ["abandoned-contour", "M0 0 M1 1 L2 2"],
    ["empty-close", "M0 0 Z"],
    ["drawing-after-close", "M0 0 L1 1 Z L2 2"],
  ] as const) {
    const result = inspectPath(data, name);

    assert.equal(result.successful, false);
    assert.deepEqual(
      result.diagnostics.map((diagnostic) => diagnostic.code),
      ["ASTER-SYNTAX-004"],
    );
  }
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
