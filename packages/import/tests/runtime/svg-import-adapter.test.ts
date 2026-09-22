import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  IconImport,
  iconImportFormats,
  type SvgIconImportSource,
} from "../../src/index.js";

const fixtureRoot = new URL("../fixtures/svg/", import.meta.url);

function inspect(fixture: string) {
  const source: SvgIconImportSource = {
    format: iconImportFormats.svg,
    sourceId: `fixtures/${fixture}`,
    identity: { namespace: "aster", name: "adapter-evidence" },
    content: readFileSync(new URL(fixture, fixtureRoot), "utf8"),
  };

  return IconImport.inspect(source);
}

test("rejects unsafe XML and unsupported SVG source families", () => {
  const fixtures = [
    "unsafe/doctype.svg",
    "unsafe/entity-reference.svg",
    "unsafe/event-handler.svg",
    "unsafe/external-resource.svg",
    "unsafe/foreign-namespace.svg",
    "unsafe/processing-instruction.svg",
    "unsafe/raster.svg",
    "unsafe/script.svg",
    "unsupported/cdata.svg",
    "unsupported/definition.svg",
    "unsupported/text.svg",
    "unsupported/transform.svg",
  ];

  for (const fixture of fixtures) {
    const result = inspect(fixture);
    assert.equal(result.successful, false, fixture);
    assert.equal("value" in result, false, fixture);
  }
});

test("rejects malformed XML without exposing parser failures", () => {
  for (const fixture of [
    "malformed/duplicate-attribute.svg",
    "malformed/invalid-comment.svg",
    "malformed/mismatched.svg",
    "malformed/multiple-roots.svg",
  ]) {
    const result = inspect(fixture);
    assert.equal(result.successful, false, fixture);
    assert.equal(result.diagnostics[0]?.severity, "error", fixture);
  }
});

test("normalises accepted Illustrator geometry into portable nodes", () => {
  const result = inspect("adoption/illustrator-adopted.svg");

  assert.equal(result.successful, true);

  if (!result.successful) {
    throw new Error("Expected accepted Illustrator adoption evidence.");
  }

  assert.deepEqual(result.value.nodes, [
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
});

test("accepts finite editor noise with exact discarded-attribute warnings", () => {
  const result = inspect("adoption/illustrator-export.svg");

  assert.equal(result.successful, true);

  if (!result.successful) {
    throw new Error("Expected accepted finite Illustrator export noise.");
  }

  assert.equal(result.value.nodes.length, 2);
  assert.deepEqual(
    result.diagnostics.map((diagnostic) => ({
      code: diagnostic.code,
      severity: diagnostic.severity,
      sourceId: diagnostic.sourceId,
      span: diagnostic.span,
    })),
    result.diagnostics.map((diagnostic) => ({
      code: "ASTER-TECHNICAL-007",
      severity: "warning",
      sourceId: "fixtures/adoption/illustrator-export.svg",
      span: diagnostic.span,
    })),
  );
  assert.equal(result.diagnostics.length, 6);
  assert.equal(
    result.diagnostics.every(
      (diagnostic) =>
        diagnostic.span !== undefined &&
        diagnostic.span.end.offset > diagnostic.span.start.offset,
    ),
    true,
  );
});
