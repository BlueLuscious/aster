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

function probeInheritedGetter(
  field: string,
  inheritedValue: unknown,
  operation: () => unknown,
): { reads: number; result: unknown; error: unknown } {
  const previous = Object.getOwnPropertyDescriptor(Object.prototype, field);
  let reads = 0;
  let result: unknown;
  let error: unknown;

  Object.defineProperty(Object.prototype, field, {
    configurable: true,
    get() {
      reads += 1;
      return inheritedValue;
    },
  });

  try {
    result = operation();
  } catch (caught) {
    error = caught;
  } finally {
    if (previous === undefined) {
      Reflect.deleteProperty(Object.prototype, field);
    } else {
      Object.defineProperty(Object.prototype, field, previous);
    }
  }

  return { reads, result, error };
}

function probeInheritedSetter(
  field: string,
  operation: () => unknown,
): { writes: number; result: unknown; error: unknown } {
  const previous = Object.getOwnPropertyDescriptor(Object.prototype, field);
  let writes = 0;
  let result: unknown;
  let error: unknown;

  Object.defineProperty(Object.prototype, field, {
    configurable: true,
    set() {
      writes += 1;
    },
  });

  try {
    result = operation();
  } catch (caught) {
    error = caught;
  } finally {
    if (previous === undefined) {
      Reflect.deleteProperty(Object.prototype, field);
    } else {
      Object.defineProperty(Object.prototype, field, previous);
    }
  }

  return { writes, result, error };
}

test("does not read inherited optional icon fields", () => {
  const identity = createInput();
  Reflect.deleteProperty(identity.identity, "namespace");
  const inheritedNamespace = probeInheritedGetter("namespace", "external", () =>
    Icon.define(identity as never),
  );
  assert.equal(inheritedNamespace.reads, 0);
  assert.equal(inheritedNamespace.error, undefined);
  assert.equal(
    Object.hasOwn((inheritedNamespace.result as ReturnType<typeof Icon.define>).identity, "namespace"),
    false,
  );

  const presentation = createInput();
  const inheritedOpacity = probeInheritedGetter("fillOpacity", 0.5, () =>
    Icon.define(presentation as never),
  );
  assert.equal(inheritedOpacity.reads, 0);
  assert.equal(inheritedOpacity.error, undefined);
  assert.equal(
    Object.hasOwn(
      (inheritedOpacity.result as ReturnType<typeof Icon.define>).metadata.presentation.defaults,
      "fillOpacity",
    ),
    false,
  );

  const rectangle = createInput();
  rectangle.nodes = [{ kind: "rect", x: 0, y: 0, width: 8, height: 8 }] as never;
  const inheritedRadius = probeInheritedGetter("radiusX", 2, () =>
    Icon.define(rectangle as never),
  );
  assert.equal(inheritedRadius.reads, 0);
  assert.equal(inheritedRadius.error, undefined);
  assert.equal(
    Object.hasOwn((inheritedRadius.result as ReturnType<typeof Icon.define>).nodes[0]!, "radiusX"),
    false,
  );
});

test("does not accept inherited collection identity or metadata fields", () => {
  const identity = probeInheritedGetter("namespace", "external", () =>
    Collection.define({
      identity: { name: "minimal" },
      icons: {},
      metadata: { displayName: "Minimal" },
    }),
  );
  assert.equal(identity.reads, 0);
  assert.equal(identity.error, undefined);
  assert.equal(
    Object.hasOwn((identity.result as ReturnType<typeof Collection.define>).identity, "namespace"),
    false,
  );

  const description = probeInheritedGetter("description", "inherited", () =>
    Collection.define({
      identity: { name: "minimal" },
      icons: {},
      metadata: { displayName: "Minimal" },
    }),
  );
  assert.equal(description.reads, 0);
  assert.equal(description.error, undefined);
  assert.equal(
    Object.hasOwn(
      (description.result as ReturnType<typeof Collection.define>).metadata,
      "description",
    ),
    false,
  );

  const missingMetadata = probeInheritedGetter("displayName", "inherited", () =>
    Collection.define({
      identity: { name: "minimal" },
      icons: {},
      metadata: {},
    } as never),
  );
  assert.equal(missingMetadata.reads, 0);
  assert.ok(missingMetadata.error instanceof IconDefinitionError);
  assert.equal(missingMetadata.error.path, "collection.metadata.displayName");
});

test("does not invoke an inherited setter while constructing collection aliases", () => {
  const camera = Icon.define(createInput() as never);
  const probe = probeInheritedSetter("camera", () =>
    Collection.define({
      identity: { name: "minimal" },
      icons: { camera },
      metadata: { displayName: "Minimal" },
    }),
  );

  assert.equal(probe.writes, 0);
  assert.equal(probe.error, undefined);
  assert.equal((probe.result as ReturnType<typeof Collection.define>).icons.camera, camera);
});

test("does not invoke an inherited setter while copying node presentation", () => {
  const icon = createInput();
  icon.nodes = [{ ...icon.nodes[0], fill: "none" }] as never;
  const probe = probeInheritedSetter("fill", () => Icon.define(icon as never));

  assert.equal(probe.writes, 0);
  assert.equal(probe.error, undefined);
  assert.equal((probe.result as ReturnType<typeof Icon.define>).nodes[0]?.fill, "none");
});

test("rejects missing required fields without invoking inherited getters", () => {
  const icon = createInput();
  Reflect.deleteProperty(icon, "viewBox");
  const inheritedViewBox = probeInheritedGetter("viewBox", createInput().viewBox, () =>
    Icon.define(icon as never),
  );
  assert.equal(inheritedViewBox.reads, 0);
  assert.ok(inheritedViewBox.error instanceof IconDefinitionError);
  assert.equal(inheritedViewBox.error.path, "definition.viewBox");

  const metadata = createInput();
  Reflect.deleteProperty(metadata.metadata, "deprecated");
  const inheritedDeprecated = probeInheritedGetter("deprecated", false, () =>
    Icon.define(metadata as never),
  );
  assert.equal(inheritedDeprecated.reads, 0);
  assert.ok(inheritedDeprecated.error instanceof IconDefinitionError);
  assert.equal(inheritedDeprecated.error.path, "definition.metadata.deprecated");

  const path = createInput();
  path.nodes = [{
    kind: "path",
    commands: [{ x: 0, y: 0 }, { kind: "line", x: 1, y: 1 }],
  }] as never;
  const inheritedKind = probeInheritedGetter("kind", "move", () =>
    Icon.define(path as never),
  );
  assert.equal(inheritedKind.reads, 0);
  assert.ok(inheritedKind.error instanceof IconDefinitionError);
  assert.equal(inheritedKind.error.path, "definition.nodes[0].commands[0].kind");
});

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

  const nodeKindAccessor = createInput();
  Object.defineProperty(nodeKindAccessor.nodes[0], "kind", {
    configurable: true,
    enumerable: true,
    get() {
      reads += 1;
      return "circle";
    },
  });
  expectDefinitionError(
    () => Icon.define(nodeKindAccessor as never),
    "definition.nodes[0].kind",
  );
  assert.equal(reads, 0);

  const presentationAccessor = createInput();
  Object.defineProperty(presentationAccessor.nodes[0], "fill", {
    configurable: true,
    enumerable: true,
    get() {
      reads += 1;
      return "none";
    },
  });
  expectDefinitionError(
    () => Icon.define(presentationAccessor as never),
    "definition.nodes[0].fill",
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
        icons: { authored },
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
    icons: { authored },
    metadata: { displayName: "Aliases" },
  } as never).icons.authored;

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
    icons: { authored },
    metadata: { displayName: "Normalised" },
  } as never).icons.authored;

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
    icons: { authored },
    metadata: { displayName: "Field Order" },
  } as never).icons.authored;

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
