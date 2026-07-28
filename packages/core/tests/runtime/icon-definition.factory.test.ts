import assert from "node:assert/strict";
import test from "node:test";

import { IconDefinitionFactory } from "../../src/definition/runtime/icon-definition.factory.js";
import { IconDefinitionError } from "../../src/shared/runtime/icon-definition.error.js";

const definitionFactory = new IconDefinitionFactory();

function createInput() {
  return {
    identity: {
      collection: "minimal",
      name: "shape-sampler",
      variant: "outline",
    },
    viewBox: {
      minX: -0,
      minY: 0,
      width: 24,
      height: 24,
    },
    nodes: [
      { kind: "path", data: " M2 12h20 " },
      { kind: "circle", cx: 12, cy: 12, radius: 3, fill: "#ABC" },
      { kind: "ellipse", cx: 12, cy: 12, radiusX: 6, radiusY: 4 },
      {
        kind: "rect",
        x: 3,
        y: 4,
        width: 18,
        height: 16,
        radiusX: 2,
        radiusY: 2,
      },
      { kind: "line", x1: 2, y1: 2, x2: 22, y2: 22 },
      {
        kind: "polyline",
        points: [
          { x: 2, y: 12 },
          { x: 8, y: 18 },
        ],
      },
      {
        kind: "polygon",
        points: [
          { x: 12, y: 2 },
          { x: 22, y: 22 },
          { x: 2, y: 22 },
        ],
      },
    ],
    metadata: {
      displayName: " Shape Sampler ",
      rtl: "preserve",
      presentation: {
        defaults: {
          fill: "none",
          stroke: "#AABBCC",
          strokeWidth: -0,
        },
        overrides: ["strokeWidth", "fill"],
        defaultSize: 24,
        minimumSize: 12,
      },
      licence: " CC-BY-4.0 ",
      deprecated: false,
    },
  };
}

function expectDefinitionError(
  input: unknown,
  expectedPath: string,
): IconDefinitionError {
  let acceptedError: IconDefinitionError | undefined;

  assert.throws(
    () => definitionFactory.create(input),
    (error: unknown) => {
      assert.ok(error instanceof IconDefinitionError);
      assert.equal(error.code, "ASTER-CORE-001");
      assert.equal(error.path, expectedPath);
      acceptedError = error;
      return true;
    },
  );

  assert.ok(acceptedError !== undefined);
  return acceptedError as IconDefinitionError;
}

test("normalises all primitives into deterministic canonical data", () => {
  const first = definitionFactory.create(createInput());
  const reordered = createInput();
  reordered.metadata.presentation.overrides = ["fill", "strokeWidth"];
  const second = definitionFactory.create(reordered);

  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(first), JSON.stringify(second));
  assert.equal(Object.is(first.viewBox.minX, -0), false);
  assert.equal(first.nodes[0]?.kind, "path");
  assert.equal(first.nodes[0]?.kind === "path" ? first.nodes[0].data : undefined, "M2 12h20");
  assert.equal(first.nodes[1]?.fill, "#aabbcc");
  assert.equal(first.metadata.displayName, "Shape Sampler");
  assert.equal(first.metadata.licence, "CC-BY-4.0");
  assert.deepEqual(first.metadata.presentation.overrides, ["fill", "strokeWidth"]);
  assert.equal(first.metadata.presentation.defaults.stroke, "#aabbcc");
  assert.equal(Object.is(first.metadata.presentation.defaults.strokeWidth, -0), false);
});

test("deeply freezes retained data and isolates caller-owned input", () => {
  const input = createInput();
  const accepted = definitionFactory.create(input);

  input.identity.name = "changed";
  input.nodes[5]?.points?.push({ x: 14, y: 12 });
  input.metadata.presentation.defaults.stroke = "#ffffff";

  assert.equal(accepted.identity.name, "shape-sampler");
  assert.equal(accepted.nodes[5]?.kind === "polyline" ? accepted.nodes[5].points.length : 0, 2);
  assert.equal(accepted.metadata.presentation.defaults.stroke, "#aabbcc");
  assert.ok(Object.isFrozen(accepted));
  assert.ok(Object.isFrozen(accepted.identity));
  assert.ok(Object.isFrozen(accepted.nodes));
  assert.ok(Object.isFrozen(accepted.nodes[5]));
  assert.ok(
    accepted.nodes[5]?.kind === "polyline" &&
      Object.isFrozen(accepted.nodes[5].points) &&
      Object.isFrozen(accepted.nodes[5].points[0]),
  );
  assert.ok(Object.isFrozen(accepted.metadata));
  assert.ok(Object.isFrozen(accepted.metadata.presentation));
  assert.ok(Object.isFrozen(accepted.metadata.presentation.defaults));
  assert.ok(Object.isFrozen(accepted.metadata.presentation.overrides));
});

test("constructs repeated identity without retaining a registry", () => {
  const first = definitionFactory.create(createInput());
  const second = definitionFactory.create(createInput());

  assert.notEqual(first, second);
  assert.notEqual(first.identity, second.identity);
  assert.deepEqual(first.identity, second.identity);
});

test("rejects unsupported fields and malformed local values", () => {
  const unknownField = createInput();
  Object.assign(unknownField.nodes[0] ?? {}, { transform: "translate(1 1)" });
  expectDefinitionError(unknownField, "definition.nodes[0].transform");

  const emptyNodes = createInput();
  emptyNodes.nodes = [];
  expectDefinitionError(emptyNodes, "definition.nodes");

  const invalidViewBox = createInput();
  invalidViewBox.viewBox.width = Number.NaN;
  expectDefinitionError(invalidViewBox, "definition.viewBox.width");

  const duplicateOverrides = createInput();
  duplicateOverrides.metadata.presentation.overrides = ["fill", "fill"];
  expectDefinitionError(
    duplicateOverrides,
    "definition.metadata.presentation.overrides",
  );

  const invalidOpacity = createInput();
  Object.assign(invalidOpacity.nodes[0] ?? {}, { opacity: 2 });
  expectDefinitionError(invalidOpacity, "definition.nodes[0].opacity");
});

test("rejects malformed metadata and self replacement", () => {
  const attributionWithoutLicence = createInput();
  Reflect.deleteProperty(attributionWithoutLicence.metadata, "licence");
  Object.assign(attributionWithoutLicence.metadata, { attribution: "Author" });
  expectDefinitionError(
    attributionWithoutLicence,
    "definition.metadata.attribution",
  );

  const activeReplacement = createInput();
  Object.assign(activeReplacement.metadata, {
    replacedBy: activeReplacement.identity,
  });
  expectDefinitionError(activeReplacement, "definition.metadata.replacedBy");

  const selfReplacement = createInput();
  selfReplacement.metadata.deprecated = true;
  Object.assign(selfReplacement.metadata, { replacedBy: selfReplacement.identity });
  expectDefinitionError(selfReplacement, "definition.metadata.replacedBy");
});
