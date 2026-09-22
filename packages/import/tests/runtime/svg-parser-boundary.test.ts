import assert from "node:assert/strict";
import test from "node:test";

import {
  IconImport,
  IconImportError,
  iconImportFormats,
  type DiagnosticResultType,
  type IconImportDraft,
} from "../../src/index.js";
import { svgParserLimits } from "../../src/formats/svg/parser/constants/svg-parser-limits.constant.js";

const parserLimitCode = "ASTER-SAFETY-009";

function inspect(
  content: string,
  name = "parser-boundary",
): DiagnosticResultType<IconImportDraft> {
  return IconImport.inspect({
    format: iconImportFormats.svg,
    sourceId: `parser/${name}.svg`,
    identity: { namespace: "parser", name },
    content,
  });
}

function codes(result: DiagnosticResultType<unknown>): readonly string[] {
  return result.diagnostics.map((diagnostic) => diagnostic.code);
}

function sourceAtLength(length: number): string {
  const opening =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0H1"/><!--';
  const closing = "--></svg>";
  const payloadLength = length - opening.length - closing.length;

  if (payloadLength < 0) {
    throw new TypeError("The requested parser fixture length is too short.");
  }

  return `${opening}${"x".repeat(payloadLength)}${closing}`;
}

function sourceAtDepth(depth: number): string {
  const groups = depth - 2;
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">',
    "<g>".repeat(groups),
    '<path d="M0 0H1"/>',
    "</g>".repeat(groups),
    "</svg>",
  ].join("");
}

function sourceWithElements(elements: number): string {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">',
    "<g/>".repeat(elements - 2),
    '<path d="M0 0H1"/>',
    "</svg>",
  ].join("");
}

function sourceWithAttributes(attributes: number): string {
  const authored = Array.from(
    { length: attributes - 2 },
    (_, index) => ` data-${index}=""`,
  ).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"${authored}><path d="M0 0H1"/></svg>`;
}

function pathDataAtLength(length: number): string {
  const drawing = "M0 0H1";
  return `${drawing}${" ".repeat(length - drawing.length)}`;
}

test("enforces source length immediately beyond its exact boundary", () => {
  const accepted = sourceAtLength(svgParserLimits.maxSourceLength);
  const rejected = sourceAtLength(svgParserLimits.maxSourceLength + 1);

  assert.equal(accepted.length, svgParserLimits.maxSourceLength);
  assert.equal(inspect(accepted, "source-limit-accepted").successful, true);

  const result = inspect(rejected, "source-limit-rejected");
  assert.equal(result.successful, false);
  assert.deepEqual(codes(result), [parserLimitCode]);
  assert.deepEqual(result.diagnostics[0]?.span, {
    start: { offset: 0, line: 1, column: 1 },
    end: {
      offset: rejected.length,
      line: 1,
      column: rejected.length + 1,
    },
  });
});

test("enforces structural depth immediately beyond its exact boundary", () => {
  const accepted = inspect(
    sourceAtDepth(svgParserLimits.maxElementDepth),
    "depth-limit-accepted",
  );
  const rejected = inspect(
    sourceAtDepth(svgParserLimits.maxElementDepth + 1),
    "depth-limit-rejected",
  );

  assert.equal(accepted.successful, true);
  assert.equal(codes(accepted).includes(parserLimitCode), false);
  assert.equal(rejected.successful, false);
  assert.deepEqual(codes(rejected), [parserLimitCode]);
});

test("enforces element count immediately beyond its exact boundary", () => {
  const accepted = inspect(
    sourceWithElements(svgParserLimits.maxElements),
    "element-limit-accepted",
  );
  const rejected = inspect(
    sourceWithElements(svgParserLimits.maxElements + 1),
    "element-limit-rejected",
  );

  assert.equal(accepted.successful, true);
  assert.equal(codes(accepted).includes(parserLimitCode), false);
  assert.equal(rejected.successful, false);
  assert.deepEqual(codes(rejected), [parserLimitCode]);
});

test("enforces attribute count immediately beyond its exact boundary", () => {
  const accepted = inspect(
    sourceWithAttributes(svgParserLimits.maxAttributesPerElement),
    "attribute-limit-accepted",
  );
  const rejected = inspect(
    sourceWithAttributes(svgParserLimits.maxAttributesPerElement + 1),
    "attribute-limit-rejected",
  );

  assert.equal(codes(accepted).includes(parserLimitCode), false);
  assert.equal(rejected.successful, false);
  assert.equal(codes(rejected).includes(parserLimitCode), true);
});

test("enforces text length immediately beyond its exact boundary", () => {
  const opening = '<svg xmlns="http://www.w3.org/2000/svg">';
  const closing = "</svg>";
  const accepted = inspect(
    `${opening}${"x".repeat(svgParserLimits.maxTextLength)}${closing}`,
    "text-limit-accepted",
  );
  const rejected = inspect(
    `${opening}${"x".repeat(svgParserLimits.maxTextLength + 1)}${closing}`,
    "text-limit-rejected",
  );

  assert.equal(codes(accepted).includes(parserLimitCode), false);
  assert.equal(rejected.successful, false);
  assert.deepEqual(codes(rejected), [parserLimitCode]);
});

test("enforces path data length immediately beyond its exact boundary", () => {
  const source = (length: number) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${pathDataAtLength(length)}"/></svg>`;
  const accepted = inspect(
    source(svgParserLimits.maxPathDataLength),
    "path-limit-accepted",
  );
  const rejected = inspect(
    source(svgParserLimits.maxPathDataLength + 1),
    "path-limit-rejected",
  );

  assert.equal(accepted.successful, true);
  assert.equal(codes(accepted).includes(parserLimitCode), false);
  assert.equal(rejected.successful, false);
  assert.deepEqual(codes(rejected), [parserLimitCode]);
});

test("accepts only the finite exact XML declaration grammar", () => {
  const body =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0H1"/></svg>';
  const accepted = inspect(
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${body}`,
    "declaration-accepted",
  );
  const rejected = inspect(
    `<?XML version="1.0"?>${body}`,
    "declaration-rejected",
  );

  assert.equal(accepted.successful, true);
  assert.equal(rejected.successful, false);
  assert.deepEqual(codes(rejected), ["ASTER-SAFETY-008"]);
});

test("contains namespace aliases and misleading inert delimiters", () => {
  const accepted = inspect([
    '<s:svg xmlns:s="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="fake > boundary">',
    "<!-- <script>ignored()</script> -->",
    '<s:path d="M0 0H1"/>',
    "</s:svg>",
  ].join("\n"), "namespace-alias");
  const rejected = inspect([
    '<s:svg xmlns:s="urn:foreign" viewBox="0 0 24 24">',
    '<s:path d="M0 0H1"/>',
    "</s:svg>",
  ].join("\n"), "foreign-namespace-alias");

  assert.equal(accepted.successful, true);
  assert.equal(rejected.successful, false);
  assert.equal(codes(rejected).includes("ASTER-SAFETY-007"), true);
});

test("translates duplicate attributes without native parser leakage", () => {
  const result = inspect(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" viewBox="0 0 16 16"><path d="M0 0H1"/></svg>',
    "duplicate-attribute",
  );

  assert.equal(result.successful, false);
  assert.deepEqual(codes(result), ["ASTER-SYNTAX-001"]);
  assert.equal(
    result.diagnostics.every(
      (diagnostic) =>
        !/xmlsax|duplicate attribute|parser failure|native/iu.test(
          diagnostic.message,
        ),
    ),
    true,
  );
});

test("preserves exact LF, CRLF and Unicode source evidence", () => {
  const eventLine = '  <path id="🌱" onclick="run()" d="M0 0H1" />';

  for (const [name, separator] of [
    ["lf", "\n"],
    ["crlf", "\r\n"],
  ] as const) {
    const content = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">',
      "<!-- exact -->",
      eventLine,
      "</svg>",
    ].join(separator);
    const result = inspect(content, `${name}-source-evidence`);
    const diagnostic = result.diagnostics.find(
      (candidate) => candidate.code === "ASTER-SAFETY-005",
    );
    const startOffset = content.indexOf("onclick");
    const startColumn = eventLine.indexOf("onclick") + 1;

    assert.equal(result.successful, false);
    assert.deepEqual(diagnostic?.span, {
      start: { offset: startOffset, line: 3, column: startColumn },
      end: { offset: startOffset + 7, line: 3, column: startColumn + 7 },
    });
    assert.equal(diagnostic?.related, undefined);
    assert.equal(
      content.slice(
        diagnostic?.span?.start.offset,
        diagnostic?.span?.end.offset,
      ),
      "onclick",
    );
  }
});

test("rejects malformed Unicode before parser entry without native leakage", () => {
  assert.throws(
    () => inspect("<svg>\uD800</svg>", "malformed-unicode"),
    (error: unknown) =>
      error instanceof IconImportError &&
      error.path === "source.content" &&
      !/xmlsax|surrogate|native/iu.test(error.message),
  );

  const invalidXmlCharacter = inspect(
    '<svg xmlns="http://www.w3.org/2000/svg">\u0000</svg>',
    "invalid-xml-character",
  );
  assert.equal(invalidXmlCharacter.successful, false);
  assert.deepEqual(codes(invalidXmlCharacter), ["ASTER-SYNTAX-001"]);
  assert.equal(
    invalidXmlCharacter.diagnostics.every(
      (diagnostic) => !/xmlsax|parser failure|native/iu.test(diagnostic.message),
    ),
    true,
  );
});
