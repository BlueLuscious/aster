import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import type { SourceDiagnostic } from "../../src/diagnostic/contracts/index.js";
import { SvgParser } from "../../src/parser/runtime/svg.parser.js";
import { IngestionSourceFactory } from "../../src/source/runtime/ingestion-source.factory.js";

const parser = new SvgParser();
const sourceFactory = new IngestionSourceFactory();
const fixtureRoot = new URL("../fixtures/svg/", import.meta.url);

function fixture(path: string): string {
  return readFileSync(new URL(path, fixtureRoot), "utf8");
}

function source(content: string) {
  const accepted = sourceFactory.create({
    kind: "svg",
    sourceId: "collections/minimal/svg/camera.svg",
    content,
    identity: {
      collection: "minimal",
      name: "camera",
    },
  });

  assert.equal(accepted.kind, "svg");
  return accepted;
}

function parseFixture(path: string) {
  return parser.parse(source(fixture(path)));
}

function expectFailure(
  path: string,
  expectedCodes: readonly string[],
): readonly SourceDiagnostic[] {
  const result = parseFixture(path);

  assert.equal(result.successful, false);
  assert.equal("value" in result, false);
  assert.deepEqual(
    result.diagnostics.map((diagnostic) => diagnostic.code),
    expectedCodes,
  );
  return result.diagnostics;
}

function assertDeeplyFrozen(value: unknown): void {
  if (typeof value !== "object" || value === null) {
    return;
  }

  assert.ok(Object.isFrozen(value));

  for (const nested of Object.values(value)) {
    assertDeeplyFrozen(nested);
  }
}

test("parses the supported SVG subset with exact hierarchy, order, and spans", () => {
  const content = fixture("valid/basic.svg");
  const result = parser.parse(source(content));

  assert.equal(result.successful, true);

  if (!result.successful) {
    return;
  }

  const root = result.value.root;
  const group = root.children[0];

  assert.equal(result.value.sourceId, "collections/minimal/svg/camera.svg");
  assert.equal(root.localName, "svg");
  assert.equal(root.namespaceUri, "http://www.w3.org/2000/svg");
  assert.deepEqual(
    root.attributes.map((attribute) => attribute.name),
    ["xmlns", "viewBox"],
  );
  assert.equal(
    root.attributes.find((attribute) => attribute.name === "viewBox")?.value,
    "0 0 24 24",
  );
  assert.equal(group?.localName, "g");
  assert.deepEqual(
    group?.children.map((child) => child.localName),
    ["path", "circle", "ellipse", "rect", "line", "polyline", "polygon"],
  );
  assert.equal(root.span.start.offset, content.indexOf("<svg"));
  assert.equal(root.span.end.offset, content.lastIndexOf("</svg>") + 6);
  assert.equal(root.openingSpan.start.line, 2);
  assert.equal(root.nameSpan.start.column, 2);
  assertDeeplyFrozen(result);
});

test("maps malformed XML and document structure to stable syntax failures", () => {
  expectFailure("malformed/mismatched.svg", ["ASTER-SYNTAX-001"]);
  expectFailure("malformed/multiple-roots.svg", ["ASTER-SYNTAX-001"]);
  expectFailure("malformed/invalid-comment.svg", ["ASTER-SYNTAX-001"]);
  expectFailure("malformed/duplicate-attribute.svg", ["ASTER-SYNTAX-001"]);

  const invalidCharacter = parser.parse(
    source('<svg xmlns="http://www.w3.org/2000/svg">\u0000</svg>'),
  );

  assert.equal(invalidCharacter.successful, false);
  assert.deepEqual(
    invalidCharacter.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-SYNTAX-001"],
  );
});

test("rejects unsafe SVG capabilities with stable located diagnostics", () => {
  const cases = [
    ["unsafe/doctype.svg", ["ASTER-SAFETY-001"]],
    ["unsafe/entity-reference.svg", ["ASTER-SAFETY-002"]],
    ["unsafe/script.svg", ["ASTER-SAFETY-003"]],
    [
      "unsafe/raster.svg",
      ["ASTER-SAFETY-004", "ASTER-SAFETY-006"],
    ],
    ["unsafe/event-handler.svg", ["ASTER-SAFETY-005"]],
    ["unsafe/external-resource.svg", ["ASTER-SAFETY-006"]],
    [
      "unsafe/foreign-namespace.svg",
      ["ASTER-SAFETY-007", "ASTER-SAFETY-007"],
    ],
    ["unsafe/processing-instruction.svg", ["ASTER-SAFETY-008"]],
  ] as const;

  for (const [path, codes] of cases) {
    const diagnostics = expectFailure(path, codes);

    for (const diagnostic of diagnostics) {
      assert.equal(diagnostic.severity, "error");
      assert.ok(diagnostic.span);
    }
  }
});

test("rejects unsupported definitions, transforms, text, and CDATA", () => {
  expectFailure("unsupported/definition.svg", ["ASTER-TECHNICAL-001"]);
  expectFailure("unsupported/transform.svg", ["ASTER-TECHNICAL-002"]);
  expectFailure("unsupported/text.svg", ["ASTER-TECHNICAL-003"]);
  expectFailure("unsupported/cdata.svg", ["ASTER-TECHNICAL-004"]);
});

test("applies source, depth, and attribute parser safety limits", () => {
  const oversized = parser.parse(source(" ".repeat(1_048_577)));
  const deep = parser.parse(
    source(
      `<svg xmlns="http://www.w3.org/2000/svg">${"<g>".repeat(64)}${"</g>".repeat(64)}</svg>`,
    ),
  );
  const attributes = Array.from(
    { length: 129 },
    (_, index) => `data-${index}="${index}"`,
  ).join(" ");
  const wide = parser.parse(
    source(
      `<svg xmlns="http://www.w3.org/2000/svg" ${attributes}><path /></svg>`,
    ),
  );

  for (const result of [oversized, deep, wide]) {
    assert.equal(result.successful, false);
    assert.equal(
      result.diagnostics.some(
        (diagnostic) => diagnostic.code === "ASTER-SAFETY-009",
      ),
      true,
    );
    assert.equal("value" in result, false);
  }
});

test("does not classify inert comment or CDATA ampersands as entity expansion", () => {
  const comment = parser.parse(
    source(
      '<!-- camera & flash --><svg xmlns="http://www.w3.org/2000/svg"><path /></svg>',
    ),
  );
  const cdata = parser.parse(
    source(
      '<svg xmlns="http://www.w3.org/2000/svg"><![CDATA[camera & flash]]></svg>',
    ),
  );

  assert.equal(comment.successful, true);
  assert.equal(cdata.successful, false);
  assert.deepEqual(
    cdata.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-TECHNICAL-004"],
  );
});
