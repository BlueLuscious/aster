import assert from "node:assert/strict";
import test from "node:test";

import { IconImportError } from "../../src/index.js";
import { diagnosticCodes } from "../../src/diagnostic/constants/diagnostic-codes.constant.js";
import { DiagnosticRelatedContextFactory } from "../../src/diagnostic/runtime/diagnostic-related-context.factory.js";
import { SourceDiagnosticAggregator } from "../../src/diagnostic/runtime/source-diagnostic.aggregator.js";
import { SourceDiagnosticFactory } from "../../src/diagnostic/runtime/source-diagnostic.factory.js";
import { SourceSpanFactory } from "../../src/diagnostic/runtime/source-span.factory.js";
import type { TSourceDiagnosticInput } from "../../src/diagnostic/types/internal/source-diagnostic-input.type.js";
import { SvgPathDataNormaliser } from "../../src/formats/svg/normalisation/runtime/svg-path-data.normaliser.js";
import { SvgPresentationNormaliser } from "../../src/formats/svg/normalisation/runtime/svg-presentation.normaliser.js";
import { SvgParser } from "../../src/formats/svg/parser/runtime/svg.parser.js";
import { svgValidationIssueKinds } from "../../src/formats/svg/validation/constants/svg-validation-issue-kinds.constant.js";
import { SvgValidationDiagnosticFactory } from "../../src/formats/svg/validation/runtime/svg-validation-diagnostic.factory.js";
import { IconIdentityFormatter } from "../../src/shared/runtime/icon-identity.formatter.js";

const span = Object.freeze({
  start: Object.freeze({ offset: 0, line: 1, column: 1 }),
  end: Object.freeze({ offset: 1, line: 1, column: 2 }),
});

function withInherited(
  fields: Record<string, PropertyDescriptor>,
  verify: () => void,
): void {
  const previous = Object.getOwnPropertyDescriptors(Object.prototype);

  try {
    Object.defineProperties(Object.prototype, fields);
    verify();
  } finally {
    for (const name of Object.keys(fields)) {
      const descriptor = Object.hasOwn(previous, name)
        ? previous[name]
        : undefined;

      if (descriptor === undefined) {
        Reflect.deleteProperty(Object.prototype, name);
      } else {
        Object.defineProperty(Object.prototype, name, descriptor);
      }
    }
  }
}

test("formats namespace absence without invoking inherited namespace data", () => {
  let reads = 0;

  withInherited(
    {
      namespace: {
        configurable: true,
        get() {
          reads += 1;
          return "foreign";
        },
      },
    },
    () => {
      assert.equal(
        new IconIdentityFormatter().format({
          name: "camera",
          variant: "outline",
        }),
        "camera@outline",
      );
      assert.equal(reads, 0);
    },
  );
});

test("requires diagnostic fields to be own data rather than inherited values", () => {
  const input = {
    code: diagnosticCodes.invalidGeometry,
    message: "Invalid geometry",
    sourceId: "camera.svg",
  };
  const factory = new SourceDiagnosticFactory();

  for (const field of ["code", "message", "sourceId"] as const) {
    const incomplete = { ...input };
    Reflect.deleteProperty(incomplete, field);
    let reads = 0;
    let failure: unknown;

    withInherited(
      {
        [field]: {
          configurable: true,
          get() {
            reads += 1;
            return input[field];
          },
        },
      },
      () => {
        try {
          factory.create(incomplete as TSourceDiagnosticInput);
        } catch (error: unknown) {
          failure = error;
        }
      },
    );
    assert.ok(failure instanceof IconImportError);
    assert.equal(failure.path, `diagnostic.${field}`);
    assert.equal(reads, 0);
  }
});

test("ignores inherited optional diagnostic context during construction and sorting", () => {
  const factory = new SourceDiagnosticFactory();
  const relatedFactory = new DiagnosticRelatedContextFactory();
  let reads = 0;
  const inherited = {
    configurable: true,
    get() {
      reads += 1;
      throw new Error("Inherited context read");
    },
  };

  withInherited({ span: inherited, related: inherited }, () => {
    const first = factory.create({
      code: diagnosticCodes.invalidGeometry,
      message: "First",
      sourceId: "camera.svg",
    });
    const second = factory.create({
      code: diagnosticCodes.invalidGeometry,
      message: "Second",
      sourceId: "camera.svg",
    });
    assert.equal(Object.hasOwn(first, "span"), false);
    assert.equal(Object.hasOwn(first, "related"), false);
    const technical = new SvgValidationDiagnosticFactory().create({
      kind: svgValidationIssueKinds.emptyGeometry,
      sourceId: "camera.svg",
    });
    assert.equal(Object.hasOwn(technical, "span"), false);
    assert.equal(
      new SourceDiagnosticAggregator().aggregate([first, second]).length,
      2,
    );
    assert.equal(
      relatedFactory.createSequence(
        [
          { message: "Second", sourceId: "camera.svg" },
          { message: "First", sourceId: "camera.svg" },
        ],
        "related",
      ).length,
      2,
    );
    assert.equal(reads, 0);
  });
});

test("requires related-context fields and source-position fields to be own values", () => {
  const relatedFactory = new DiagnosticRelatedContextFactory();
  const spanFactory = new SourceSpanFactory();

  for (const field of ["message", "sourceId"] as const) {
    const complete = { message: "Related", sourceId: "camera.svg" };
    const input = { ...complete };
    Reflect.deleteProperty(input, field);
    withInherited(
      { [field]: { configurable: true, value: complete[field] } },
      () => {
        assert.throws(
          () => relatedFactory.create(input, "related"),
          IconImportError,
        );
      },
    );
  }

  for (const field of ["start", "end"] as const) {
    const input = { ...span };
    Reflect.deleteProperty(input, field);
    withInherited(
      { [field]: { configurable: true, value: span[field] } },
      () => {
        assert.throws(() => spanFactory.create(input, "span"), IconImportError);
      },
    );
  }

  for (const field of ["offset", "line", "column"] as const) {
    const start = { ...span.start };
    Reflect.deleteProperty(start, field);
    withInherited(
      { [field]: { configurable: true, value: span.start[field] } },
      () => {
        assert.throws(
          () => spanFactory.create({ start, end: span.end }, "span"),
          IconImportError,
        );
      },
    );
  }
});

test("does not inherit smooth-curve control points before or after control reset", () => {
  const normaliser = new SvgPathDataNormaliser();
  const paths = [
    "M1 2 S3 4 5 6 T7 8",
    "M1 2 C3 4 5 6 7 8 L9 10 S11 12 13 14 Q15 16 17 18 L19 20 T21 22",
  ];
  const expected = paths.map((path) => normaliser.normalise(path, span));

  withInherited(
    Object.fromEntries(
      [
        "cubicControlX",
        "cubicControlY",
        "quadraticControlX",
        "quadraticControlY",
      ].map((field) => [
        field,
        { configurable: true, value: 100, writable: true },
      ]),
    ),
    () => {
      paths.forEach((path, index) =>
        assert.deepEqual(normaliser.normalise(path, span), expected[index]),
      );
    },
  );
});

test("retains authored presentation without invoking inherited setters", () => {
  const attribute = {
    name: "fill",
    localName: "fill",
    prefix: "",
    namespaceUri: "",
    value: "#abc",
    span,
    nameSpan: span,
    valueSpan: span,
  };
  const element = {
    name: "path",
    localName: "path",
    prefix: "",
    namespaceUri: "http://www.w3.org/2000/svg",
    attributes: [attribute],
    children: [],
    openingSpan: span,
    nameSpan: span,
    span,
  };
  let writes = 0;

  withInherited(
    {
      fill: {
        configurable: true,
        set() {
          writes += 1;
        },
      },
    },
    () => {
      const result = new SvgPresentationNormaliser().normalise(element, {});
      assert.equal(Object.hasOwn(result, "fill"), true);
      assert.equal(result.fill, "#aabbcc");
      assert.equal(writes, 0);
    },
  );
});

test("does not read an inherited duplicate-attribute marker from parser locations", () => {
  let reads = 0;

  withInherited(
    {
      duplicateAttributeName: {
        configurable: true,
        get() {
          reads += 1;
          throw new Error("Inherited duplicate marker read");
        },
      },
    },
    () => {
      new SvgParser().parse({
        kind: "svg",
        identity: { name: "camera", variant: "outline" },
        content:
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M1 2 L3 4"/></svg>',
        sourceId: "camera.svg",
      });
      assert.equal(reads, 0);
    },
  );
});
