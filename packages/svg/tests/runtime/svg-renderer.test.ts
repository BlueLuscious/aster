import assert from "node:assert/strict";
import test from "node:test";

import {
  Icon,
  iconDirections,
  iconRtlPolicies,
  type IconDefinition,
  type IconRenderOptions,
  type IconRtlPolicyType,
} from "@aster/core";
import {
  Svg,
  SvgRenderError,
} from "../../src/index.js";

function createDefinition(): IconDefinition {
  return Icon.define({
    identity: {
      namespace: "testing",
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
      assert.equal(error.code, SvgRenderError.code);
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
    fill: "#456",
    stroke: "#123",
    strokeWidth: -0,
    label: 'Visible "shape" & state',
    title: "Shape <preview>",
  });

  assert.equal(
    markup,
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 16" width="32" height="32" color="#aabbcc" role="img" aria-label="Visible &quot;shape&quot; &amp; state"><title>Shape &lt;preview&gt;</title><path d="M2 8h20&quot;" fill="#445566" fill-rule="nonzero" stroke="#112233" stroke-width="0" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" opacity="1" fill-opacity="1" stroke-opacity="1"/></svg>',
  );
});

test("serialises every portable primitive in paint and attribute order", () => {
  const definition = Icon.define({
    identity: {
      namespace: "testing",
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

test("preserves caller-controlled execution failures from definition inspection", () => {
  const failure = new Error("caller-own-keys-failure");
  const definition = new Proxy(createDefinition(), {
    ownKeys() {
      throw failure;
    },
  });

  assert.throws(
    () => Svg.render(definition),
    (error: unknown) => error === failure,
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

test("isolates exact own enumerable option data without executing accessors", () => {
  const definition = createDefinition();
  const nullPrototypeOptions = Object.create(null) as Record<string, unknown>;
  nullPrototypeOptions.size = 32;

  assert.match(
    Svg.render(definition, nullPrototypeOptions as IconRenderOptions),
    / width="32" height="32"/u,
  );

  const inheritedOptions = Object.create({ size: 32 }) as IconRenderOptions;
  expectRenderError(() => Svg.render(definition, inheritedOptions), "options");

  const hiddenOptions = {};
  Object.defineProperty(hiddenOptions, "size", {
    value: 32,
    enumerable: false,
  });
  expectRenderError(
    () => Svg.render(definition, hiddenOptions as IconRenderOptions),
    "options.size",
  );

  let accessorExecutions = 0;
  const accessorOptions = {};
  Object.defineProperty(accessorOptions, "size", {
    enumerable: true,
    get() {
      accessorExecutions += 1;
      return 32;
    },
  });
  expectRenderError(
    () => Svg.render(definition, accessorOptions as IconRenderOptions),
    "options.size",
  );
  assert.equal(accessorExecutions, 0);

  const symbolOptions = {
    [Symbol("size")]: 32,
  } as unknown as IconRenderOptions;
  expectRenderError(() => Svg.render(definition, symbolOptions), "options");
});

test("preserves caller-controlled failures while inspecting option shape", () => {
  const ownKeysFailure = new Error("caller-option-own-keys-failure");
  const ownKeysOptions = new Proxy({}, {
    ownKeys() {
      throw ownKeysFailure;
    },
  }) as IconRenderOptions;

  assert.throws(
    () => Svg.render(createDefinition(), ownKeysOptions),
    (error: unknown) => error === ownKeysFailure,
  );

  const descriptorFailure = new Error("caller-option-descriptor-failure");
  const descriptorOptions = new Proxy({ size: 32 }, {
    getOwnPropertyDescriptor() {
      throw descriptorFailure;
    },
  }) as IconRenderOptions;

  assert.throws(
    () => Svg.render(createDefinition(), descriptorOptions),
    (error: unknown) => error === descriptorFailure,
  );
});

test("resolves the complete accessibility matrix", () => {
  const definition = createDefinition();
  const decorative = Svg.render(definition);
  const explicitDecorative = Svg.render(definition, { decorative: true });
  const labelled = Svg.render(definition, { label: "  Camera  " });
  const titled = Svg.render(definition, { title: "  Preview 雪  " });
  const labelledAndTitled = Svg.render(definition, {
    label: "Camera",
    title: "Preview",
    decorative: false,
  });

  for (const markup of [decorative, explicitDecorative]) {
    assert.match(markup, / aria-hidden="true" focusable="false">/u);
    assert.doesNotMatch(markup, / role=|aria-label=|<title>/u);
  }

  assert.match(labelled, / role="img" aria-label="Camera">/u);
  assert.doesNotMatch(labelled, /<title>/u);
  assert.match(
    titled,
    / role="img" aria-label="Preview 雪"><title>Preview 雪<\/title>/u,
  );
  assert.match(
    labelledAndTitled,
    / role="img" aria-label="Camera"><title>Preview<\/title>/u,
  );

  expectRenderError(
    () => Svg.render(definition, { decorative: false }),
    "options.decorative",
  );
  expectRenderError(
    () => Svg.render(definition, { decorative: true, title: "Hidden" }),
    "options.decorative",
  );
  expectRenderError(
    () => Svg.render(definition, { label: "Visible\u0001control" }),
    "options.label",
  );
});

test("applies only the mirror policy to explicitly right-to-left geometry", () => {
  const base = createDefinition();
  const definition = (
    rtl: IconRtlPolicyType,
    minX: number,
  ): IconDefinition =>
    Icon.define({
      ...base,
      viewBox: {
        ...base.viewBox,
        minX,
      },
      metadata: {
        ...base.metadata,
        rtl,
      },
    });

  for (const policy of iconRtlPolicies) {
    const ltr = Svg.render(definition(policy, -5), {
      direction: iconDirections[0],
    });
    const rtl = Svg.render(definition(policy, -5), {
      direction: iconDirections[1],
    });

    assert.doesNotMatch(ltr, /<g transform=/u);
    if (policy === iconRtlPolicies[0]) {
      assert.match(rtl, /<g transform="matrix\(-1 0 0 1 14 0\)">/u);
    } else {
      assert.doesNotMatch(rtl, /<g transform=/u);
    }
  }

  assert.match(
    Svg.render(definition(iconRtlPolicies[0], 3), {
      direction: iconDirections[1],
    }),
    /<g transform="matrix\(-1 0 0 1 30 0\)">/u,
  );
});

test("enforces icon-owned viewport boundaries and canonical dimensions", () => {
  const definition = createDefinition();

  assert.match(
    Svg.render(definition, { size: 12 }),
    / width="12" height="12"/u,
  );
  assert.match(
    Svg.render(definition),
    / width="24" height="24"/u,
  );

  const minimumError = expectRenderError(
    () => Svg.render(definition, { size: 11 }),
    "options.size",
  );
  assert.equal(
    minimumError.message,
    "ASTER-SVG-001 at options.size: cannot be smaller than icon minimum 12.",
  );
  expectRenderError(
    () => Svg.render(definition, { size: Number.POSITIVE_INFINITY }),
    "options.size",
  );
});

test("accepts the exact XML 1.0 repertoire and escapes each output context", () => {
  const allowedCharacters = "\t\n\r\u007f\u0085\ufdd0\ue000\ufffd\u{10000}\u{1ffff}\u{10ffff}";
  const definition = Icon.define({
    ...createDefinition(),
    nodes: [
      {
        kind: "path",
        data: `M0 0${allowedCharacters}Z`,
      },
    ],
  });
  const label = 'Label\tline\nreturn\r & < > "';
  const title = 'Title\tline\nreturn\r & < > "';
  const markup = Svg.render(definition, {
    label,
    title,
  });

  assert.match(
    markup,
    / aria-label="Label&#9;line&#10;return&#13; &amp; &lt; &gt; &quot;">/u,
  );
  assert.ok(markup.includes('<title>Title\tline\nreturn\r &amp; &lt; &gt; "</title>'));
  assert.ok(
    markup.includes(
      `d="M0 0&#9;&#10;&#13;\u007f\u0085\ufdd0\ue000\ufffd\u{10000}\u{1ffff}\u{10ffff}Z"`,
    ),
  );
});

test("rejects every XML 1.0 character gap with the source path", () => {
  const invalidCharacters = [
    "\u0000",
    "\u0008",
    "\u000b",
    "\u000c",
    "\u001f",
    "\ud800",
    "\udfff",
    "\ufffe",
    "\uffff",
  ];

  for (const character of invalidCharacters) {
    const definition = Icon.define({
      ...createDefinition(),
      nodes: [
        {
          kind: "path",
          data: `M0 0${character}Z`,
        },
      ],
    });
    const error = expectRenderError(
      () => Svg.render(definition),
      "definition.nodes[0].data",
    );

    assert.match(error.message, /unsupported by XML 1\.0/u);
  }

  expectRenderError(
    () => Svg.render(createDefinition(), { title: "Invalid\ud800title" }),
    "options.title",
  );
});

test("serialises canonical numeric boundaries without locale dependence", () => {
  const definition = Icon.define({
    identity: {
      namespace: "testing",
      name: "numbers",
    },
    viewBox: {
      minX: -1e-7,
      minY: -0,
      width: 1e21,
      height: 0.5,
    },
    nodes: [
      {
        kind: "line",
        x1: -0,
        y1: -1e-7,
        x2: 1e21,
        y2: 0.000001,
      },
    ],
    metadata: {
      displayName: "Numbers",
      rtl: "preserve",
      presentation: {
        defaults: {
          strokeWidth: 0.5,
          opacity: 0,
          fillOpacity: 0.25,
          strokeOpacity: 1,
        },
        overrides: [],
      },
      deprecated: false,
    },
  });
  const markup = Svg.render(definition);

  assert.match(
    markup,
    / viewBox="-1e-7 0 1e\+21 0\.5" width="1e\+21" height="0\.5"/u,
  );
  assert.match(
    markup,
    /<line x1="0" y1="-1e-7" x2="1e\+21" y2="0\.000001"/u,
  );
  assert.match(
    markup,
    / stroke-width="0\.5"[^>]+ opacity="0" fill-opacity="0\.25" stroke-opacity="1"/u,
  );
});
