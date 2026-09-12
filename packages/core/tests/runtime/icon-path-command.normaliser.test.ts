import assert from "node:assert/strict";
import test from "node:test";

import { IconPathCommandNormaliser } from "../../src/node/runtime/icon-path-command.normaliser.js";
import { IconDefinitionError } from "../../src/shared/runtime/icon-definition.error.js";

const normaliser = new IconPathCommandNormaliser();
const path = "definition.nodes[0].commands";

function expectCommandError(value: unknown, expectedPath: string): void {
  assert.throws(
    () => normaliser.normaliseSequence(value, path),
    (error: unknown) => {
      assert.ok(error instanceof IconDefinitionError);
      assert.equal(error.code, IconDefinitionError.code);
      assert.equal(error.path, expectedPath);
      return true;
    },
  );
}

test("canonicalises every command family and independent contours", () => {
  const input = [
    { kind: "move", x: -0, y: 2 },
    { kind: "line", x: 4, y: 4 },
    {
      kind: "cubic-bezier",
      x: 8,
      y: 8,
      control1X: 5,
      control1Y: 4,
      control2X: 7,
      control2Y: 8,
    },
    {
      kind: "quadratic-bezier",
      x: 12,
      y: 4,
      controlX: 10,
      controlY: -0,
    },
    {
      kind: "arc",
      x: 16,
      y: 8,
      radiusX: -0,
      radiusY: 4,
      rotation: -0,
      largeArc: false,
      sweep: true,
    },
    { kind: "close" },
    { kind: "move", x: 18, y: 18 },
    { kind: "line", x: 20, y: 20 },
  ];

  const accepted = normaliser.normaliseSequence(input, path);
  const move = accepted[0];

  assert.notEqual(accepted, input);
  assert.ok(move?.kind === "move");
  assert.equal(Object.is(move.x, -0), false);
  assert.equal(
    accepted[3]?.kind === "quadratic-bezier"
      ? Object.is(accepted[3].controlY, -0)
      : true,
    false,
  );
  assert.equal(
    accepted[4]?.kind === "arc" ? Object.is(accepted[4].radiusX, -0) : true,
    false,
  );
  assert.ok(Object.isFrozen(accepted));
  assert.ok(accepted.every((command) => Object.isFrozen(command)));

  input[0]!.x = 99;
  assert.equal(move.x, 0);
  assert.deepEqual(
    normaliser.normaliseSequence(structuredClone(input).map((command, index) =>
      index === 0 ? { ...command, x: -0 } : command,
    ), path),
    accepted,
  );
});

test("produces identical canonical output from reordered authored fields", () => {
  const first = normaliser.normaliseSequence(
    [
      { kind: "move", x: 0, y: 0 },
      { kind: "line", x: 4, y: 4 },
    ],
    path,
  );
  const second = normaliser.normaliseSequence(
    [
      { y: -0, x: -0, kind: "move" },
      { y: 4, kind: "line", x: 4 },
    ],
    path,
  );

  assert.deepEqual(second, first);
  assert.equal(JSON.stringify(second), JSON.stringify(first));
});

test("rejects every invalid contour transition deterministically", () => {
  const cases: readonly [unknown, string][] = [
    [[], path],
    [[{ kind: "line", x: 1, y: 1 }], `${path}[0].kind`],
    [[{ kind: "close" }], `${path}[0].kind`],
    [
      [
        { kind: "move", x: 0, y: 0 },
        { kind: "move", x: 1, y: 1 },
      ],
      `${path}[1].kind`,
    ],
    [
      [
        { kind: "move", x: 0, y: 0 },
        { kind: "close" },
      ],
      `${path}[1].kind`,
    ],
    [
      [
        { kind: "move", x: 0, y: 0 },
        { kind: "line", x: 1, y: 1 },
        { kind: "close" },
        { kind: "close" },
      ],
      `${path}[3].kind`,
    ],
    [[{ kind: "move", x: 0, y: 0 }], `${path}[0].kind`],
  ];

  for (const [input, expectedPath] of cases) {
    expectCommandError(input, expectedPath);
  }
});

test("rejects malformed command fields and operands", () => {
  expectCommandError(
    [
      { kind: "move", x: 0, y: 0 },
      { kind: "unknown", x: 1, y: 1 },
    ],
    `${path}[1].kind`,
  );
  expectCommandError(
    [
      { kind: "move", x: 0, y: 0 },
      { kind: "line", x: 1, y: 1, controlX: 2 },
    ],
    `${path}[1].controlX`,
  );
  expectCommandError(
    [
      { kind: "move", x: 0, y: 0 },
      { kind: "line", x: Number.NaN, y: 1 },
    ],
    `${path}[1].x`,
  );
  expectCommandError(
    [
      { kind: "move", x: 0, y: 0 },
      {
        kind: "arc",
        x: 1,
        y: 1,
        radiusX: -1,
        radiusY: 2,
        rotation: 0,
        largeArc: false,
        sweep: true,
      },
    ],
    `${path}[1].radiusX`,
  );
});

test("rejects non-data command state without executing it", () => {
  const accessor = { kind: "line", x: 1, y: 1 };
  let reads = 0;
  Object.defineProperty(accessor, "kind", {
    enumerable: true,
    get() {
      reads += 1;
      return "line";
    },
  });

  expectCommandError(
    [{ kind: "move", x: 0, y: 0 }, accessor],
    `${path}[1].kind`,
  );
  assert.equal(reads, 0);

  const symbolic = { kind: "line", x: 1, y: 1 };
  Object.defineProperty(symbolic, Symbol("state"), { value: true });
  expectCommandError(
    [{ kind: "move", x: 0, y: 0 }, symbolic],
    `${path}[1]`,
  );

  const sparse = new Array(2);
  sparse[0] = { kind: "move", x: 0, y: 0 };
  expectCommandError(sparse, `${path}[1]`);

  class AuthoredCommand {}

  const customPrototype = Object.assign(new AuthoredCommand(), {
    kind: "line",
    x: 1,
    y: 1,
  });
  expectCommandError(
    [{ kind: "move", x: 0, y: 0 }, customPrototype],
    `${path}[1]`,
  );
});

test("accepts null-prototype commands as canonical plain data", () => {
  const move = Object.assign(Object.create(null), {
    kind: "move",
    x: 0,
    y: 0,
  });
  const line = Object.assign(Object.create(null), {
    kind: "line",
    x: 1,
    y: 1,
  });

  const accepted = normaliser.normaliseSequence([move, line], path);

  assert.equal(Object.getPrototypeOf(accepted[0]), Object.prototype);
  assert.equal(Object.getPrototypeOf(accepted[1]), Object.prototype);
});

test("preserves caller-controlled proxy failures", () => {
  const failure = new Error("command-proxy-failure");
  const command = new Proxy(
    { kind: "move", x: 0, y: 0 },
    {
      getPrototypeOf() {
        throw failure;
      },
    },
  );

  assert.throws(
    () => normaliser.normaliseSequence([command], path),
    (error) => error === failure,
  );
});
