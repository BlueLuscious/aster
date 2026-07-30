import assert from "node:assert/strict";
import test from "node:test";

import {
  DiagnosticResultFactory,
  IngestionSourceFactory,
  SourceDiagnosticAggregator,
  SourceDiagnosticFactory,
  SourceLocator,
} from "../../src/index.js";
import { BuildContractError } from "../../src/shared/runtime/build-contract.error.js";

const sourceFactory = new IngestionSourceFactory();
const sourceLocator = new SourceLocator();
const diagnosticFactory = new SourceDiagnosticFactory();
const diagnosticAggregator = new SourceDiagnosticAggregator();
const resultFactory = new DiagnosticResultFactory();

function createSvgSource(content = "<svg />\r\n") {
  return {
    kind: "svg",
    sourceId: "collections/minimal/svg/camera.svg",
    content,
    identity: {
      namespace: "minimal",
      name: "camera",
    },
  };
}

function createDiagnostic(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    code: "ASTER-TECHNICAL-001",
    severity: "warning",
    category: "technical",
    message: "The source uses a provisional feature.",
    sourceId: "collections/minimal/svg/camera.svg",
    span: {
      start: { offset: 2, line: 1, column: 3 },
      end: { offset: 4, line: 1, column: 5 },
    },
    ...overrides,
  };
}

function expectContractError(
  operation: () => unknown,
  expectedPath: string,
): void {
  assert.throws(operation, (error: unknown) => {
    assert.ok(error instanceof BuildContractError);
    assert.equal(error.code, "ASTER-BUILD-001");
    assert.equal(error.path, expectedPath);
    return true;
  });
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

test("isolates source descriptors without changing canonical content", () => {
  const input = createSvgSource("<svg>\r\n  <path />\n</svg>");
  const accepted = sourceFactory.create(input);

  input.content = "changed";
  input.identity.name = "changed";

  assert.equal(accepted.kind, "svg");
  assert.equal(accepted.content, "<svg>\r\n  <path />\n</svg>");
  assert.deepEqual(accepted.identity, {
    namespace: "minimal",
    name: "camera",
  });
  assertDeeplyFrozen(accepted);
});

test("rejects non-canonical source identifiers and non-UTF-8 textual values", () => {
  expectContractError(
    () =>
      sourceFactory.create({
        ...createSvgSource(),
        sourceId: "C:\\collections\\camera.svg",
      }),
    "source.sourceId",
  );
  expectContractError(
    () =>
      sourceFactory.create({
        ...createSvgSource(),
        sourceId: "collections/../camera.svg",
      }),
    "source.sourceId",
  );
  expectContractError(
    () => sourceFactory.create(createSvgSource("\uFEFF<svg />")),
    "source.content",
  );
  expectContractError(
    () => sourceFactory.create(createSvgSource("\uD800")),
    "source.content",
  );
});

test("resolves UTF-16 positions while treating CRLF as one logical newline", () => {
  const source = sourceFactory.create(
    createSvgSource("a\uD83D\uDE00\r\n\u03B2\n"),
  );

  assert.deepEqual(sourceLocator.positionAt(source, 3), {
    offset: 3,
    line: 1,
    column: 4,
  });
  assert.deepEqual(sourceLocator.positionAt(source, 4), {
    offset: 4,
    line: 2,
    column: 1,
  });
  assert.deepEqual(sourceLocator.positionAt(source, 5), {
    offset: 5,
    line: 2,
    column: 1,
  });
  assert.deepEqual(sourceLocator.positionAt(source, 7), {
    offset: 7,
    line: 3,
    column: 1,
  });
  assert.deepEqual(sourceLocator.span(source, 1, 5), {
    start: { offset: 1, line: 1, column: 2 },
    end: { offset: 5, line: 2, column: 1 },
  });
  expectContractError(() => sourceLocator.positionAt(source, 8), "offset");
  expectContractError(() => sourceLocator.span(source, 5, 4), "endOffset");
});

test("validates diagnostic families, spans, and stable messages", () => {
  const accepted = diagnosticFactory.create(
    createDiagnostic({
      message: " The source uses a provisional feature. ",
    }),
  );

  assert.equal(accepted.message, "The source uses a provisional feature.");
  assertDeeplyFrozen(accepted);

  expectContractError(
    () =>
      diagnosticFactory.create(
        createDiagnostic({ code: "ASTER-SYNTAX-001" }),
      ),
    "diagnostic.code",
  );
  expectContractError(
    () =>
      diagnosticFactory.create(
        createDiagnostic({ message: "First line.\nSecond line." }),
      ),
    "diagnostic.message",
  );
  expectContractError(
    () =>
      diagnosticFactory.create(
        createDiagnostic({
          span: {
            start: { offset: 4, line: 1, column: 5 },
            end: { offset: 2, line: 1, column: 3 },
          },
        }),
      ),
    "diagnostic.span.end",
  );
});

test("sorts and deduplicates related context deterministically", () => {
  const accepted = diagnosticFactory.create(
    createDiagnostic({
      related: [
        {
          message: "Later source.",
          sourceId: "z.svg",
        },
        {
          message: "Earlier source.",
          sourceId: "a.svg",
        },
        {
          message: "Earlier source.",
          sourceId: "a.svg",
        },
      ],
    }),
  );

  assert.deepEqual(
    accepted.related?.map((context) => context.sourceId),
    ["a.svg", "z.svg"],
  );
  assertDeeplyFrozen(accepted.related);
});

test("aggregates diagnostics in canonical order independently from producer order", () => {
  const warning = createDiagnostic();
  const error = createDiagnostic({
    code: "ASTER-TECHNICAL-002",
    severity: "error",
  });
  const earlierSource = createDiagnostic({
    sourceId: "collections/minimal/metadata/camera.json",
  });
  const wholeSource = createDiagnostic({
    code: "ASTER-TECHNICAL-003",
  });
  Reflect.deleteProperty(wholeSource, "span");

  const first = diagnosticAggregator.aggregate([
    warning,
    earlierSource,
    error,
    warning,
    wholeSource,
  ]);
  const second = diagnosticAggregator.aggregate([
    warning,
    error,
    wholeSource,
    earlierSource,
    warning,
  ]);

  assert.deepEqual(first, second);
  assert.equal(first.length, 4);
  assert.deepEqual(
    first.map((diagnostic) => diagnostic.code),
    [
      "ASTER-TECHNICAL-001",
      "ASTER-TECHNICAL-003",
      "ASTER-TECHNICAL-002",
      "ASTER-TECHNICAL-001",
    ],
  );
  assertDeeplyFrozen(first);
});

test("creates explicit diagnostic-bearing successes and failures without partial output", () => {
  const warning = createDiagnostic();
  const error = createDiagnostic({
    code: "ASTER-TECHNICAL-002",
    severity: "error",
  });
  const successful = resultFactory.success({ accepted: true }, [warning]);
  const failed = resultFactory.failure<{ accepted: true }>([warning, error]);

  assert.equal(successful.successful, true);
  assert.deepEqual(
    successful.successful ? successful.value : undefined,
    { accepted: true },
  );
  assert.equal(failed.successful, false);
  assert.equal("value" in failed, false);
  assert.ok(Object.isFrozen(successful));
  assertDeeplyFrozen(successful.diagnostics);
  assertDeeplyFrozen(failed);
  expectContractError(
    () => resultFactory.success("partial", [error]),
    "diagnostics",
  );
  expectContractError(() => resultFactory.failure([warning]), "diagnostics");
});
