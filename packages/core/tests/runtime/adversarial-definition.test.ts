import assert from "node:assert/strict";
import test from "node:test";

import {
  Collection,
  Icon,
  IconDefinitionError,
} from "../../src/index.js";

function createInput() {
  return {
    identity: {
      namespace: "aster",
      name: "search",
    },
    viewBox: {
      minX: 0,
      minY: 0,
      width: 24,
      height: 24,
    },
    nodes: [
      {
        kind: "circle",
        cx: 12,
        cy: 12,
        radius: 4,
      },
    ],
    metadata: {
      displayName: "Search",
      tags: ["find"],
      rtl: "preserve",
      presentation: {
        defaults: {
          fill: "none",
          stroke: "currentColor",
        },
        overrides: [],
      },
      deprecated: false,
    },
  };
}

function expectDefinitionError(
  operation: () => unknown,
  path: string,
): IconDefinitionError {
  let accepted: IconDefinitionError | undefined;

  assert.throws(operation, (error: unknown) => {
    assert.ok(error instanceof IconDefinitionError);
    assert.equal(error.code, IconDefinitionError.code);
    assert.equal(error.path, path);
    assert.equal(error.cause, undefined);
    assert.match(error.message, /^ASTER-CORE-001 at /u);
    accepted = error;
    return true;
  });

  assert.ok(accepted !== undefined);
  return accepted;
}

function freezeEnumerableGraph(value: unknown): void {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
    return;
  }

  for (const nested of Object.values(value)) {
    freezeEnumerableGraph(nested);
  }

  Object.freeze(value);
}

test("rejects symbolic, hidden, and accessor-owned fields", () => {
  const symbolic = createInput();
  Object.defineProperty(symbolic, Symbol("hidden"), {
    enumerable: false,
    value: { mutable: true },
  });
  expectDefinitionError(() => Icon.define(symbolic as never), "definition");

  const hidden = createInput();
  Object.defineProperty(hidden.identity, "name", {
    configurable: true,
    enumerable: false,
    value: "search",
  });
  expectDefinitionError(
    () => Icon.define(hidden as never),
    "definition.identity.name",
  );

  const accessor = createInput();
  let reads = 0;
  Object.defineProperty(accessor.metadata, "displayName", {
    configurable: true,
    enumerable: true,
    get() {
      reads += 1;
      return "Search";
    },
  });
  expectDefinitionError(
    () => Icon.define(accessor as never),
    "definition.metadata.displayName",
  );
  assert.equal(reads, 0);
});

test("rejects sparse arrays and arrays with authored properties", () => {
  const sparseNodes = createInput();
  sparseNodes.nodes = new Array(1) as never;
  expectDefinitionError(
    () => Icon.define(sparseNodes as never),
    "definition.nodes[0]",
  );

  const sparsePoints = createInput();
  sparsePoints.nodes = [
    {
      kind: "polyline",
      points: new Array(2),
    },
  ] as never;
  expectDefinitionError(
    () => Icon.define(sparsePoints as never),
    "definition.nodes[0].points[0]",
  );

  const extendedTags = createInput();
  Object.assign(extendedTags.metadata.tags, { owner: "catalogue" });
  expectDefinitionError(
    () => Icon.define(extendedTags as never),
    "definition.metadata.tags.owner",
  );
});

test("accepts null-prototype records and returns canonical plain data", () => {
  const authored = createInput();
  const nullPrototype = Object.assign(Object.create(null), authored);
  nullPrototype.identity = Object.assign(Object.create(null), authored.identity);

  const accepted = Icon.define(nullPrototype as never);

  assert.equal(Object.getPrototypeOf(accepted), Object.prototype);
  assert.equal(Object.getPrototypeOf(accepted.identity), Object.prototype);
  assert.ok(Object.isFrozen(accepted));
  assert.ok(Object.isFrozen(accepted.identity));
});

test("rejects custom prototypes and cyclic domain values deterministically", () => {
  class AuthoredDefinition {}

  const customPrototype = Object.assign(new AuthoredDefinition(), createInput());
  expectDefinitionError(
    () => Icon.define(customPrototype as never),
    "definition",
  );

  const cyclic = createInput();
  cyclic.identity.name = cyclic.identity as never;
  expectDefinitionError(
    () => Icon.define(cyclic as never),
    "definition.identity.name",
  );
});

test("does not retain frozen authored graphs with hidden state", () => {
  const authored = createInput();
  const hidden = Symbol("mutable-state");
  Object.defineProperty(authored, hidden, {
    enumerable: false,
    value: { mutable: true },
  });
  freezeEnumerableGraph(authored);

  expectDefinitionError(
    () =>
      Collection.define({
        identity: { name: "adversarial" },
        icons: [authored],
        metadata: { displayName: "Adversarial" },
      } as never),
    "definition",
  );
});

test("reconstructs frozen graphs that contain repeated object aliases", () => {
  const authored = createInput();
  const point = { x: 2, y: 2 };
  authored.nodes = [
    {
      kind: "polyline",
      points: [point, point],
    },
  ] as never;
  freezeEnumerableGraph(authored);

  const retained = Collection.define({
    identity: { name: "aliases" },
    icons: [authored],
    metadata: { displayName: "Aliases" },
  } as never).icons[0];

  assert.notEqual(retained, authored);
  assert.equal(retained?.nodes[0]?.kind, "polyline");

  if (retained?.nodes[0]?.kind === "polyline") {
    assert.notEqual(retained.nodes[0].points[0], retained.nodes[0].points[1]);
    assert.deepEqual(retained.nodes[0].points[0], retained.nodes[0].points[1]);
  }
});

test("reconstructs frozen valid input that is not already canonical", () => {
  const authored = createInput();
  authored.metadata.displayName = " Search ";
  authored.metadata.presentation.overrides = ["stroke", "fill"] as never;
  freezeEnumerableGraph(authored);

  const retained = Collection.define({
    identity: { name: "normalised" },
    icons: [authored],
    metadata: { displayName: "Normalised" },
  } as never).icons[0];

  assert.notEqual(retained, authored);
  assert.equal(retained?.metadata.displayName, "Search");
  assert.deepEqual(retained?.metadata.presentation.overrides, ["fill", "stroke"]);
});

test("reconstructs frozen input with non-canonical field order", () => {
  const input = createInput();
  const authored = {
    metadata: input.metadata,
    nodes: input.nodes,
    viewBox: input.viewBox,
    identity: input.identity,
  };
  freezeEnumerableGraph(authored);

  const retained = Collection.define({
    identity: { name: "field-order" },
    icons: [authored],
    metadata: { displayName: "Field Order" },
  } as never).icons[0];

  assert.notEqual(retained, authored);
  assert.deepEqual(Object.keys(retained ?? {}), [
    "identity",
    "viewBox",
    "nodes",
    "metadata",
  ]);
});

test("propagates proxy execution failures without misclassifying them", () => {
  const failure = new Error("proxy-own-keys-failure");
  const authored = new Proxy(createInput(), {
    ownKeys() {
      throw failure;
    },
  });

  assert.throws(() => Icon.define(authored as never), (error) => error === failure);
});
