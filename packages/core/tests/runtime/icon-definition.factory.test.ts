import assert from "node:assert/strict";
import test from "node:test";

import { IconDefinitionFactory } from "../../src/definition/runtime/icon-definition.factory.js";
import { IconDefinitionError } from "../../src/shared/runtime/icon-definition.error.js";

const definitionFactory = new IconDefinitionFactory();

function createInput() {
  return {
    identity: {
      namespace: "minimal",
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

function assertDeeplyFrozen(value: unknown): void {
  if (typeof value !== "object" || value === null) {
    return;
  }

  assert.ok(Object.isFrozen(value));

  for (const nested of Object.values(value)) {
    assertDeeplyFrozen(nested);
  }
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
  assertDeeplyFrozen(accepted);
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

test("accepts the specified numeric boundaries and canonicalises nested negative zero", () => {
  const input = createInput();
  input.viewBox.minX = -Number.MAX_VALUE;
  input.viewBox.width = Number.MIN_VALUE;
  Object.assign(input.nodes[1] ?? {}, {
    cx: -0,
    opacity: 0,
    fillOpacity: 1,
    strokeOpacity: -0,
  });
  Object.assign(input.nodes[3] ?? {}, {
    width: 0,
    height: -0,
    radiusX: -0,
  });
  Object.assign(input.nodes[5]?.points?.[0] ?? {}, { x: -0 });

  const accepted = definitionFactory.create(input);
  const circle = accepted.nodes[1];
  const rectangle = accepted.nodes[3];
  const polyline = accepted.nodes[5];

  assert.equal(accepted.viewBox.minX, -Number.MAX_VALUE);
  assert.equal(accepted.viewBox.width, Number.MIN_VALUE);
  assert.ok(circle?.kind === "circle");
  assert.equal(Object.is(circle.cx, -0), false);
  assert.equal(circle.opacity, 0);
  assert.equal(circle.fillOpacity, 1);
  assert.equal(Object.is(circle.strokeOpacity, -0), false);
  assert.ok(rectangle?.kind === "rect");
  assert.equal(rectangle.width, 0);
  assert.equal(Object.is(rectangle.height, -0), false);
  assert.equal(Object.is(rectangle.radiusX, -0), false);
  assert.ok(polyline?.kind === "polyline");
  assert.equal(Object.is(polyline.points[0]?.x, -0), false);
});

test("rejects numbers outside each declared numeric domain", () => {
  const zeroWidth = createInput();
  zeroWidth.viewBox.width = 0;
  expectDefinitionError(zeroWidth, "definition.viewBox.width");

  const infiniteRadius = createInput();
  Object.assign(infiniteRadius.nodes[1] ?? {}, { radius: Number.POSITIVE_INFINITY });
  expectDefinitionError(infiniteRadius, "definition.nodes[1].radius");

  const negativeRectangleWidth = createInput();
  Object.assign(negativeRectangleWidth.nodes[3] ?? {}, { width: -1 });
  expectDefinitionError(negativeRectangleWidth, "definition.nodes[3].width");

  const zeroMiterLimit = createInput();
  Object.assign(zeroMiterLimit.nodes[0] ?? {}, { strokeMiterLimit: 0 });
  expectDefinitionError(zeroMiterLimit, "definition.nodes[0].strokeMiterLimit");

  const negativeOpacity = createInput();
  Object.assign(negativeOpacity.nodes[0] ?? {}, { opacity: -Number.MIN_VALUE });
  expectDefinitionError(negativeOpacity, "definition.nodes[0].opacity");

  const excessiveOpacity = createInput();
  Object.assign(excessiveOpacity.nodes[0] ?? {}, { opacity: 1 + Number.EPSILON });
  expectDefinitionError(excessiveOpacity, "definition.nodes[0].opacity");
});

test("normalises valid names and rejects non-canonical identity slugs", () => {
  const acceptedInput = createInput();
  acceptedInput.identity = {
    namespace: " minimal-2 ",
    name: "shape-2",
    variant: "solid-2",
  };

  const accepted = definitionFactory.create(acceptedInput);

  assert.deepEqual(accepted.identity, {
    namespace: "minimal-2",
    name: "shape-2",
    variant: "solid-2",
  });

  for (const invalidName of [
    "Shape",
    "-shape",
    "shape-",
    "shape--sampler",
    "shapé",
    "shape_sampler",
  ]) {
    const input = createInput();
    input.identity.name = invalidName;
    expectDefinitionError(input, "definition.identity.name");
  }

  const emptyVariant = createInput();
  emptyVariant.identity.variant = " ";
  expectDefinitionError(emptyVariant, "definition.identity.variant");
});

test("accepts complete deprecation metadata and enforces metadata edge relationships", () => {
  const acceptedInput = createInput();
  acceptedInput.metadata.deprecated = true;
  Object.assign(acceptedInput.metadata, {
    attribution: " Example Author ",
    replacedBy: {
      namespace: "minimal",
      name: "shape-sampler",
      variant: "solid",
    },
  });

  const accepted = definitionFactory.create(acceptedInput);

  assert.equal(accepted.metadata.attribution, "Example Author");
  assert.deepEqual(accepted.metadata.replacedBy, {
    namespace: "minimal",
    name: "shape-sampler",
    variant: "solid",
  });
  assertDeeplyFrozen(accepted.metadata.replacedBy);

  const unicodeDisplayName = createInput();
  unicodeDisplayName.metadata.displayName = " Icône de recherche ";
  assert.equal(
    definitionFactory.create(unicodeDisplayName).metadata.displayName,
    "Icône de recherche",
  );

  const invalidRtl = createInput();
  invalidRtl.metadata.rtl = "automatic";
  expectDefinitionError(invalidRtl, "definition.metadata.rtl");

  const emptyLicence = createInput();
  emptyLicence.metadata.licence = " ";
  expectDefinitionError(emptyLicence, "definition.metadata.licence");

  const invalidSizeRelationship = createInput();
  invalidSizeRelationship.metadata.presentation.minimumSize = 25;
  expectDefinitionError(
    invalidSizeRelationship,
    "definition.metadata.presentation.minimumSize",
  );
});
