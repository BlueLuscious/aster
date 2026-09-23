import assert from "node:assert/strict";
import test from "node:test";

import {
  Collection,
  Icon,
  type CollectionIconMap,
} from "../../src/index.js";

function icon(
  name = "search",
  namespace = "aster",
  variant?: string,
) {
  return Icon.define({
    identity: {
      namespace,
      name,
      ...(variant === undefined ? {} : { variant }),
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
      tags: ["find", "search"],
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
  });
}

function collection<TIconMap extends CollectionIconMap>(
  name: string,
  icons: TIconMap,
) {
  return Collection.define({
    identity: {
      namespace: "blue-luscious",
      name,
    },
    icons,
    metadata: {
      displayName: name,
      description: "Portable icon collection.",
      tags: ["interface-icons"],
      licence: "ISC",
      attribution: "BlueLuscious",
    },
  });
}

test("constructs empty and populated deeply frozen collections", () => {
  const empty = collection("empty", {});
  const search = icon();
  const populated = collection("interface", { search });

  assert.deepEqual(empty.icons, {});
  assert.deepEqual(empty.members, []);
  assert.equal(populated.icons.search, search);
  assert.equal(populated.members[0], search);
  assert.ok(Object.isFrozen(empty));
  assert.ok(Object.isFrozen(empty.icons));
  assert.ok(Object.isFrozen(empty.members));
  assert.ok(Object.isFrozen(populated.metadata.tags));
});

test("retains one canonical icon in multiple independent collections", () => {
  const search = icon();
  const interfaceIcons = collection("interface", { search });
  const navigationIcons = collection("navigation", { search });

  assert.equal(interfaceIcons.icons.search, search);
  assert.equal(interfaceIcons.members[0], search);
  assert.equal(navigationIcons.icons.search, search);
  assert.equal(navigationIcons.members[0], search);
  assert.notEqual(interfaceIcons, navigationIcons);
  assert.equal("collection" in search.identity, false);
});

test("derives ordered members from authored alias order", () => {
  const search = icon("search");
  const settings = icon("settings");
  const accepted = collection("ordered", { settings, search });

  assert.deepEqual(Object.keys(accepted.icons), ["settings", "search"]);
  assert.deepEqual(
    accepted.members.map((definition) => definition.identity.name),
    ["settings", "search"],
  );
  assert.equal(accepted.icons.settings, accepted.members[0]);
  assert.equal(accepted.icons.search, accepted.members[1]);
  assert.equal("collection" in settings.identity, false);
  assert.equal("collection" in search.identity, false);
});

test("isolates mutable icon input across both membership views", () => {
  const search = structuredClone(icon());
  const accepted = collection("isolated", { search });
  const retained = accepted.icons.search;

  assert.notEqual(retained, search);
  assert.equal(retained, accepted.members[0]);
  assert.ok(Object.isFrozen(retained));
  assert.ok(Object.isFrozen(retained.nodes));
});

test("supports explicit aliases for variants and repeated local names", () => {
  const camera = icon("camera");
  const cameraStippled = icon("camera", "aster", "stippled");
  const externalCamera = icon("camera", "external");
  const accepted = collection("cameras", {
    camera,
    cameraStippled,
    externalCamera,
  });

  assert.equal(accepted.icons.camera, camera);
  assert.equal(accepted.icons.cameraStippled, cameraStippled);
  assert.equal(accepted.icons.externalCamera, externalCamera);
  assert.deepEqual(accepted.members, [camera, cameraStippled, externalCamera]);
});

test("accepts lower camel-case aliases that shadow object prototype names", () => {
  const constructor = icon("constructor");
  const toString = icon("stringify");
  const accepted = collection("prototype-aliases", {
    constructor,
    toString,
  });

  assert.equal(accepted.icons.constructor, constructor);
  assert.equal(accepted.icons.toString, toString);
  assert.deepEqual(accepted.members, [constructor, toString]);
});

test("accepts null-prototype maps and returns canonical plain data", () => {
  const search = icon();
  const authored = Object.assign(Object.create(null), { search }) as {
    search: typeof search;
  };
  const accepted = collection("null-prototype", authored);

  assert.equal(Object.getPrototypeOf(accepted.icons), Object.prototype);
  assert.equal(accepted.icons.search, search);
  assert.equal(accepted.members[0], search);
});

test("revalidates complete definitions from keyed membership", () => {
  const search = icon("search");
  const settings = icon("settings");
  const original = collection("complete", { settings, search });
  const accepted = Collection.define(original);
  const cloned = Collection.define(structuredClone(original));

  assert.notEqual(accepted, original);
  assert.notEqual(accepted.icons, original.icons);
  assert.notEqual(accepted.members, original.members);
  assert.equal(accepted.icons.settings, original.icons.settings);
  assert.equal(accepted.icons.search, original.icons.search);
  assert.deepEqual(accepted.members, original.members);
  assert.equal(cloned.icons.settings, cloned.members[0]);
  assert.equal(cloned.icons.search, cloned.members[1]);
  assert.deepEqual(cloned, original);
});

test("rejects complete definitions whose submitted members disagree", () => {
  const search = icon("search");
  const settings = icon("settings");
  const original = collection("inconsistent", { settings, search });

  assert.throws(
    () =>
      Collection.define({
        ...original,
        members: [search, settings],
      } as never),
    /collection\.members\[0\].*does not match derived membership/u,
  );
  assert.throws(
    () =>
      Collection.define({
        ...original,
        members: [settings],
      } as never),
    /collection\.members.*does not match derived membership/u,
  );
});

test("rejects duplicate identities and invalid collection metadata", () => {
  const search = icon();

  assert.throws(
    () => collection("duplicate", { primary: search, secondary: search }),
    /collection\.icons\.secondary.*duplicates an icon identity/u,
  );
  assert.throws(
    () =>
      Collection.define({
        identity: { name: "invalid" },
        icons: {},
        metadata: {
          displayName: "Invalid",
          attribution: "Nobody",
        },
      }),
    /requires an effective licence/u,
  );
});

test("requires every authored collection field as an own data property", () => {
  const search = icon();
  const input = {
    identity: { name: "required" },
    icons: { search },
    metadata: { displayName: "Required" },
  };

  for (const field of ["identity", "icons", "metadata"] as const) {
    const incomplete: Partial<typeof input> = { ...input };
    delete incomplete[field];

    assert.throws(
      () => Collection.define(incomplete as never),
      new RegExp(`collection\\.${field}.*expected an enumerable data field`, "u"),
    );
  }
});

test("rejects invalid, symbolic, and reflective aliases", () => {
  const search = icon();

  for (const alias of ["arrow-left", "ArrowLeft", "123camera"]) {
    assert.throws(
      () => collection("invalid-alias", { [alias]: search }),
      /collection\.icons\..*expected a lower camel-case alias/u,
    );
  }

  const symbolic = { search };
  Object.defineProperty(symbolic, Symbol("hidden"), {
    enumerable: true,
    value: search,
  });
  assert.throws(
    () => collection("symbolic", symbolic),
    /collection\.icons.*expected string aliases/u,
  );

  let invoked = false;
  const accessor = {};
  Object.defineProperty(accessor, "search", {
    enumerable: true,
    get() {
      invoked = true;
      return search;
    },
  });
  assert.throws(
    () => collection("accessor", accessor as never),
    /collection\.icons\.search.*expected an enumerable data field/u,
  );
  assert.equal(invoked, false);

  const hidden = {};
  Object.defineProperty(hidden, "search", {
    enumerable: false,
    value: search,
  });
  assert.throws(
    () => collection("hidden", hidden as never),
    /collection\.icons\.search.*expected an enumerable data field/u,
  );

  class CustomMap {}

  const customMap = Object.assign(new CustomMap(), { search });

  assert.throws(
    () => collection("custom-prototype", customMap as never),
    /collection\.icons.*expected a plain object/u,
  );
});
