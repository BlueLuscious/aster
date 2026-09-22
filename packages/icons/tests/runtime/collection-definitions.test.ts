import assert from "node:assert/strict";
import test from "node:test";

import { Collection } from "@luscious-garden/aster-core";
import { asterArtworkLicence } from "../../src/authoring/constants/aster-artwork-licence.constant.js";
import { AmellusCollection } from "../../src/collections/a/amellus/amellus.collection.js";
import { AsterIconLoaders } from "../../src/dynamic/index.js";

const amellusInventory = [
  "arrow-left",
  "arrow-right",
  "arrow-up",
  "arrow-down",
  "home",
  "menu",
  "check",
  "close",
  "download",
  "plus",
  "search",
  "settings",
  "heart",
  "info",
  "lock",
  "star",
  "warning",
  "camera",
  "pause",
  "play",
  "bell",
  "mail",
  "cloud",
  "folder",
  "leaf",
  "user",
] as const;

test("composes the exact Amellus inventory in accepted semantic order", () => {
  assert.deepEqual(
    AmellusCollection.icons.map((definition) => definition.identity.name),
    amellusInventory,
  );
  assert.deepEqual(AmellusCollection.metadata, {
    displayName: "Amellus",
    description: "Minimalist general-purpose outline icons for application interfaces.",
    tags: [
      "application-icons",
      "general-purpose",
      "interface-icons",
      "minimalist",
      "outline-icons",
    ],
    licence: asterArtworkLicence,
    attribution: "BlueLuscious",
  });
  assert.ok(
    AmellusCollection.icons.every((definition) =>
      Object.hasOwn(
        AsterIconLoaders,
        `${definition.identity.namespace}/${definition.identity.name}`,
      )
    ),
  );
  assert.ok(Object.isFrozen(AmellusCollection));
  assert.ok(Object.isFrozen(AmellusCollection.icons));
  assert.ok(Object.isFrozen(AmellusCollection.metadata));
});

test("keeps icon identity independent from collection membership", async () => {
  const retained = AmellusCollection.icons[0];
  const omitted = AmellusCollection.icons[1];
  assert.ok(retained);
  assert.ok(omitted);
  const retainedIdentity = retained.identity;
  const additionalCollection = Collection.define({
    identity: { name: "additional" },
    icons: [retained],
    metadata: { displayName: "Additional" },
  });
  const reducedCollection = Collection.define({
    identity: { name: "reduced" },
    icons: AmellusCollection.icons.slice(1),
    metadata: { displayName: "Reduced" },
  });

  assert.equal(additionalCollection.icons[0], retained);
  assert.equal(retained.identity, retainedIdentity);
  assert.equal(reducedCollection.icons.includes(retained), false);
  const retainedLoader = AsterIconLoaders[
    `${retained.identity.namespace}/${retained.identity.name}`
  ];
  const omittedLoader = AsterIconLoaders[
    `${omitted.identity.namespace}/${omitted.identity.name}`
  ];
  assert.ok(retainedLoader);
  assert.ok(omittedLoader);
  assert.equal(await retainedLoader(), retained);
  assert.equal(await omittedLoader(), omitted);
});
