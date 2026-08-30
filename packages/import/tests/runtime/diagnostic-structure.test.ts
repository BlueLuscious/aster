import assert from "node:assert/strict";
import test from "node:test";

import { IconImportError } from "../../src/index.js";
import { diagnosticCodePolicy } from "../../src/diagnostic/constants/diagnostic-code-policy.constant.js";
import { diagnosticCodes } from "../../src/diagnostic/constants/diagnostic-codes.constant.js";
import { SourceDiagnosticAggregator } from "../../src/diagnostic/runtime/source-diagnostic.aggregator.js";
import { SourceDiagnosticFactory } from "../../src/diagnostic/runtime/source-diagnostic.factory.js";

const diagnosticFactory = new SourceDiagnosticFactory();

test("assigns every unique diagnostic code one exact category and severity", () => {
  const codes = Object.values(diagnosticCodes);

  assert.equal(new Set(codes).size, codes.length);
  assert.deepEqual(
    Object.keys(diagnosticCodePolicy).sort(),
    [...codes].sort(),
  );

  for (const code of codes) {
    const policy = diagnosticCodePolicy[code];
    const category = code.split("-")[1]?.toLowerCase();

    assert.equal(policy.category, category, code);
    assert.equal(
      policy.severity,
      code === diagnosticCodes.discardedEditorAttribute
        ? "warning"
        : "error",
      code,
    );
    assert.equal(Object.isFrozen(policy), true, code);
  }
});

test("derives observable policy and canonicalises related context once", () => {
  const diagnostic = diagnosticFactory.create({
    code: diagnosticCodes.discardedEditorAttribute,
    message: "  Reviewed editor data was omitted.  ",
    sourceId: "icons/example.svg",
    related: [
      {
        message: "Second location",
        sourceId: "icons/zeta.svg",
      },
      {
        message: "First location",
        sourceId: "icons/alpha.svg",
      },
      {
        message: "First location",
        sourceId: "icons/alpha.svg",
      },
    ],
  });

  assert.deepEqual(diagnostic, {
    code: "ASTER-TECHNICAL-007",
    severity: "warning",
    category: "technical",
    message: "Reviewed editor data was omitted.",
    sourceId: "icons/example.svg",
    related: [
      {
        message: "First location",
        sourceId: "icons/alpha.svg",
      },
      {
        message: "Second location",
        sourceId: "icons/zeta.svg",
      },
    ],
  });
  assert.equal(Object.isFrozen(diagnostic), true);
  assert.equal(Object.isFrozen(diagnostic.related), true);
});

test("deduplicates and orders canonical diagnostics deterministically", () => {
  const aggregator = new SourceDiagnosticAggregator();
  const later = diagnosticFactory.create({
    code: diagnosticCodes.invalidGeometry,
    message: "Invalid geometry.",
    sourceId: "icons/zeta.svg",
  });
  const earlier = diagnosticFactory.create({
    code: diagnosticCodes.invalidViewBox,
    message: "Invalid view box.",
    sourceId: "icons/alpha.svg",
  });

  assert.deepEqual(aggregator.aggregate([later, earlier, later]), [
    earlier,
    later,
  ]);
});

test("rejects unknown codes and multiline messages", () => {
  assert.throws(
    () =>
      diagnosticFactory.create({
        code: "ASTER-SYNTAX-999" as never,
        message: "Unknown code.",
        sourceId: "icons/example.svg",
      }),
    (error: unknown) =>
      error instanceof IconImportError && error.path === "diagnostic.code",
  );
  assert.throws(
    () =>
      diagnosticFactory.create({
        code: diagnosticCodes.invalidGeometry,
        message: "Invalid\ngeometry.",
        sourceId: "icons/example.svg",
      }),
    (error: unknown) =>
      error instanceof IconImportError && error.path === "diagnostic.message",
  );
});
