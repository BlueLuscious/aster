import assert from "node:assert/strict";
import test from "node:test";

import {
  Icon,
  type IconDefinition,
  type IconRenderOptions,
} from "@aster/core";
import {
  Svg,
  SvgRenderError,
} from "../../src/index.js";

function createDefinition(): IconDefinition {
  return Icon.define({
    identity: {
      collection: "testing",
      name: "precedence",
    },
    viewBox: {
      minX: 0,
      minY: 0,
      width: 24,
      height: 16,
    },
    nodes: [
      {
        kind: "path",
        data: 'M2 8h20"',
        fill: "#abc",
      },
    ],
    metadata: {
      displayName: "Precedence",
      rtl: "preserve",
      presentation: {
        defaults: {
          fill: "none",
          stroke: "currentColor",
          strokeWidth: 2,
        },
        overrides: [
          "fill",
          "stroke",
          "strokeWidth",
        ],
        defaultSize: 24,
        minimumSize: 12,
      },
      deprecated: false,
    },
  });
}

function expectRenderError(
  operation: () => unknown,
  expectedPath: string,
): SvgRenderError {
  let acceptedError: SvgRenderError | undefined;

  assert.throws(
    operation,
    (error: unknown) => {
      assert.ok(error instanceof SvgRenderError);
      assert.equal(error.name, "SvgRenderError");
      assert.equal(error.code, "ASTER-SVG-001");
      assert.equal(error.path, expectedPath);
      assert.match(error.message, /^ASTER-SVG-001 at /u);
      acceptedError = error;
      return true;
    },
  );

  assert.ok(acceptedError !== undefined);
  return acceptedError as SvgRenderError;
}

test("renders exact golden markup with accepted presentation precedence", () => {
  const markup = Svg.render(createDefinition(), {
    size: 32,
    colour: "#ABC",
    stroke: "#123",
    strokeWidth: -0,
    label: 'Visible "shape" & state',
    title: "Shape <preview>",
  });

  assert.equal(
    markup,
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 16" width="32" height="32" color="#aabbcc" role="img" aria-label="Visible &quot;shape&quot; &amp; state"><title>Shape &lt;preview&gt;</title><path d="M2 8h20&quot;" fill="#aabbcc" fill-rule="nonzero" stroke="#112233" stroke-width="0" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" opacity="1" fill-opacity="1" stroke-opacity="1"/></svg>',
  );
});

test("serialises every portable primitive in paint and attribute order", () => {
  const definition = Icon.define({
    identity: {
      collection: "testing",
      name: "primitives",
    },
    viewBox: {
      minX: -2,
      minY: 1,
      width: 28,
      height: 20,
    },
    nodes: [
      { kind: "path", data: "M0 0h1" },
      { kind: "circle", cx: 4, cy: 5, radius: 2 },
      { kind: "ellipse", cx: 8, cy: 9, radiusX: 3, radiusY: 2 },
      {
        kind: "rect",
        x: 1,
        y: 2,
        width: 6,
        height: 7,
        radiusX: 1,
        radiusY: 2,
      },
      { kind: "line", x1: 0, y1: 1, x2: 2, y2: 3 },
      {
        kind: "polyline",
        points: [
          { x: 0, y: 1 },
          { x: 2, y: 3 },
        ],
      },
      {
        kind: "polygon",
        points: [
          { x: 0, y: 1 },
          { x: 2, y: 3 },
          { x: 4, y: 5 },
        ],
      },
    ],
    metadata: {
      displayName: "Primitives",
      rtl: "preserve",
      presentation: {
        defaults: {},
        overrides: [],
      },
      deprecated: false,
    },
  });
  const presentation = ' fill="#000000" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" opacity="1" fill-opacity="1" stroke-opacity="1"';

  assert.equal(
    Svg.render(definition),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 1 28 20" width="28" height="20" aria-hidden="true" focusable="false"><path d="M0 0h1"${presentation}/><circle cx="4" cy="5" r="2"${presentation}/><ellipse cx="8" cy="9" rx="3" ry="2"${presentation}/><rect x="1" y="2" width="6" height="7" rx="1" ry="2"${presentation}/><line x1="0" y1="1" x2="2" y2="3"${presentation}/><polyline points="0 1 2 3"${presentation}/><polygon points="0 1 2 3 4 5"${presentation}/></svg>`,
  );
});

test("keeps escaped title outside one deterministic RTL mirror group", () => {
  const input = createDefinition();
  const definition = Icon.define({
    ...input,
    metadata: {
      ...input.metadata,
      rtl: "mirror",
      presentation: {
        ...input.metadata.presentation,
        defaultSize: 20,
      },
    },
  });

  const markup = Svg.render(definition, {
    title: "Next & previous",
    decorative: false,
    direction: "rtl",
  });

  assert.match(
    markup,
    /^<svg [^>]+><title>Next &amp; previous<\/title><g transform="matrix\(-1 0 0 1 24 0\)">/u,
  );
  assert.match(markup, /<\/g><\/svg>$/u);
  assert.equal((markup.match(/<g /gu) ?? []).length, 1);
});

test("is deterministic and never mutates caller or accepted definitions", () => {
  const caller = {
    size: 24,
    fill: "#fff",
  } satisfies IconRenderOptions;
  const definition = createDefinition();
  const before = JSON.stringify(definition);

  const first = Svg.render(definition, caller);
  const second = Svg.render(definition, {
    fill: "#ffffff",
    size: 24,
  });

  assert.equal(first, second);
  assert.equal(JSON.stringify(definition), before);
  assert.deepEqual(caller, {
    size: 24,
    fill: "#fff",
  });
  assert.ok(Object.isFrozen(Svg));
});

test("rejects malformed definitions through one deterministic target error", () => {
  const invalidDefinition = {
    ...createDefinition(),
    nodes: [],
  } as unknown as IconDefinition;
  const error = expectRenderError(
    () => Svg.render(invalidDefinition),
    "definition.nodes",
  );

  assert.equal(
    error.message,
    "ASTER-SVG-001 at definition.nodes: expected a valid portable icon definition.",
  );
});

test("rejects a Core-valid value that cannot enter XML markup", () => {
  const definition = Icon.define({
    ...createDefinition(),
    nodes: [
      {
        kind: "path",
        data: "M0 0\u0000",
      },
    ],
  });

  expectRenderError(
    () => Svg.render(definition),
    "definition.nodes[0].data",
  );
});

test("rejects invalid, conflicting, unknown, and unauthorised options", () => {
  const definition = createDefinition();

  expectRenderError(
    () => Svg.render(definition, { size: 11 }),
    "options.size",
  );
  expectRenderError(
    () => Svg.render(definition, { colour: "none" }),
    "options.colour",
  );
  expectRenderError(
    () => Svg.render(definition, { decorative: false }),
    "options.decorative",
  );
  expectRenderError(
    () => Svg.render(definition, { decorative: true, label: "Hidden" }),
    "options.decorative",
  );
  expectRenderError(
    () =>
      Svg.render(definition, {
        className: "icon",
      } as unknown as IconRenderOptions),
    "options.className",
  );

  const restricted = Icon.define({
    ...definition,
    metadata: {
      ...definition.metadata,
      presentation: {
        ...definition.metadata.presentation,
        overrides: [],
      },
    },
  });
  expectRenderError(
    () => Svg.render(restricted, { stroke: "currentColor" }),
    "options.stroke",
  );
});

test("rejects malformed option shapes and values before producing output", () => {
  const definition = createDefinition();

  expectRenderError(
    () => Svg.render(definition, [] as unknown as IconRenderOptions),
    "options",
  );
  expectRenderError(
    () => Svg.render(definition, { size: Number.NaN }),
    "options.size",
  );
  expectRenderError(
    () => Svg.render(definition, { fill: "red" as "#red" }),
    "options.fill",
  );
  expectRenderError(
    () => Svg.render(definition, { title: " \n " }),
    "options.title",
  );
  expectRenderError(
    () =>
      Svg.render(definition, {
        direction: "auto",
      } as unknown as IconRenderOptions),
    "options.direction",
  );
});
