import assert from "node:assert/strict";
import test from "node:test";

import {
  Collection,
  Icon,
  type CollectionDefinition,
} from "../../src/index.js";

function icon(name = "search") {
  return Icon.define({
    identity: {
      namespace: "aster",
      name,
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

function collection(
  name: string,
  icons: CollectionDefinition["icons"] = [],
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
  const empty = collection("empty");
  const search = icon();
  const populated = collection("interface", [search]);

  assert.deepEqual(empty.icons, []);
  assert.equal(populated.icons[0], search);
  assert.ok(Object.isFrozen(empty));
  assert.ok(Object.isFrozen(empty.icons));
  assert.ok(Object.isFrozen(populated.metadata.tags));
});

test("retains one canonical icon in multiple independent collections", () => {
  const search = icon();
  const interfaceIcons = collection("interface", [search]);
  const navigationIcons = collection("navigation", [search]);

  assert.equal(interfaceIcons.icons[0], search);
  assert.equal(navigationIcons.icons[0], search);
  assert.notEqual(interfaceIcons, navigationIcons);
  assert.equal("collection" in search.identity, false);
});

test("preserves authored membership order without sharing collection state", () => {
  const search = icon("search");
  const settings = icon("settings");
  const accepted = collection("ordered", [settings, search]);

  assert.deepEqual(
    accepted.icons.map((definition) => definition.identity.name),
    ["settings", "search"],
  );
  assert.equal(accepted.icons[0], settings);
  assert.equal(accepted.icons[1], search);
  assert.equal("collection" in settings.identity, false);
  assert.equal("collection" in search.identity, false);
});

test("isolates mutable valid icon input before retaining it", () => {
  const search = structuredClone(icon());
  const retained = collection("isolated", [search]).icons[0];

  assert.notEqual(retained, search);
  assert.ok(Object.isFrozen(retained));
  assert.ok(Object.isFrozen(retained?.nodes));
});

test("rejects duplicate membership and invalid collection metadata", () => {
  const search = icon();

  assert.throws(
    () => collection("duplicate", [search, search]),
    /duplicates an icon identity/u,
  );
  assert.throws(
    () =>
      Collection.define({
        identity: { name: "invalid" },
        icons: [],
        metadata: {
          displayName: "Invalid",
          attribution: "Nobody",
        },
      }),
    /requires an effective licence/u,
  );
});
