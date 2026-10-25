import assert from "node:assert/strict";
import test from "node:test";

import { Icon, type IconPoint } from "@luscious-garden/aster-core";
import { Svg } from "../../src/index.js";

function createDefinition(kind: "polyline" | "polygon", points: readonly IconPoint[]) {
  return Icon.define({
    identity: { namespace: "testing", name: "point-sequence", variant: "outline" },
    viewBox: { minX: 0, minY: 0, width: 24, height: 24 },
    nodes: [{ kind, points }],
    metadata: {
      displayName: "Point sequence",
      rtl: "preserve",
      presentation: { defaults: {}, overrides: [] },
      deprecated: false,
    },
  });
}

test("preserves canonical numeric spelling and ASCII point separators", () => {
  const points = [
    { x: -0, y: 1e-7 },
    { x: 1e21, y: -1e21 },
    { x: Number.MIN_VALUE, y: Number.MAX_VALUE },
    { x: 0.125, y: -42.5 },
  ];
  const expected = "0 1e-7 1e+21 -1e+21 5e-324 1.7976931348623157e+308 0.125 -42.5";

  for (const kind of ["polyline", "polygon"] as const) {
    const definition = createDefinition(kind, points);
    for (const input of [definition, structuredClone(definition)]) {
      const markup = Svg.render(input);
      assert.ok(markup.includes(`<${kind} points="${expected}"`));
      assert.equal(markup.match(/ points=/gu)?.length, 1);
    }
  }
});

test("retains every coordinate in dense ordered point sequences without mutating callers", () => {
  const points = Array.from({ length: 1024 }, (_, index) => ({
    x: index / 8,
    y: -(index % 16) / 2,
  }));
  const original = structuredClone(points);
  const expected = points.flatMap((point) => [String(point.x), String(point.y)]).join(" ");

  for (const kind of ["polyline", "polygon"] as const) {
    const definition = createDefinition(kind, points);
    const markup = Svg.render(definition);
    assert.ok(markup.includes(`<${kind} points="${expected}"`));
    assert.equal(Svg.render(definition), markup);
    assert.deepEqual(points, original);
    assert.ok(Object.isFrozen(definition.nodes));
  }
});

test("does not consult inherited array-index accessors while serialising dense points", () => {
  const points = Array.from({ length: 1024 }, (_, index) => ({ x: index, y: -index }));
  const definitions = (["polyline", "polygon"] as const).map((kind) => createDefinition(kind, points));
  const expected = definitions.map((definition) => Svg.render(definition));
  const previous = Object.getOwnPropertyDescriptor(Array.prototype, "511");
  let reads = 0;
  let writes = 0;
  const actual: string[] = [];

  Object.defineProperty(Array.prototype, "511", {
    configurable: true,
    get() {
      reads += 1;
      throw new Error("Inherited point lookup");
    },
    set() {
      writes += 1;
      throw new Error("Inherited point assignment");
    },
  });
  try {
    for (const definition of definitions) {
      actual.push(Svg.render(definition));
    }
  } finally {
    if (previous === undefined) {
      Reflect.deleteProperty(Array.prototype, "511");
    } else {
      Object.defineProperty(Array.prototype, "511", previous);
    }
  }

  assert.deepEqual(actual, expected);
  assert.equal(reads, 0);
  assert.equal(writes, 0);
});
