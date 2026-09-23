import assert from "node:assert/strict";
import test from "node:test";

import { Collection } from "@luscious-garden/aster-core";
import { asterArtworkLicence } from "../../src/authoring/constants/aster-artwork-licence.constant.js";
import { AmellusCollection } from "../../src/collections/a/amellus/amellus.collection.js";
import { AsterIconLoaders } from "../../src/dynamic/index.js";

test("derives ordered Amellus membership from its source-owned aliases", () => {
  const aliases = Object.keys(AmellusCollection.icons);
  const definitions = Object.values(AmellusCollection.icons);

  assert.ok(aliases.length > 0, "Expected Amellus to contain at least one icon.");
  assert.deepEqual(definitions, AmellusCollection.members);
  assert.equal(new Set(AmellusCollection.members).size, definitions.length);
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
    AmellusCollection.members.every((definition) =>
      Object.hasOwn(
        AsterIconLoaders,
        `${definition.identity.namespace}/${definition.identity.name}`,
      )
    ),
  );
  assert.ok(Object.isFrozen(AmellusCollection));
  assert.ok(Object.isFrozen(AmellusCollection.icons));
  assert.ok(Object.isFrozen(AmellusCollection.members));
  assert.ok(Object.isFrozen(AmellusCollection.metadata));
});

test("keeps icon identity independent from collection membership", async () => {
  const retained = AmellusCollection.icons.arrowLeft;
  const omitted = AmellusCollection.icons.arrowRight;
  const retainedIdentity = retained.identity;
  const additionalCollection = Collection.define({
    identity: { name: "additional" },
    icons: { retained },
    metadata: { displayName: "Additional" },
  });
  const reducedCollection = Collection.define({
    identity: { name: "reduced" },
    icons: { omitted },
    metadata: { displayName: "Reduced" },
  });

  assert.equal(additionalCollection.icons.retained, retained);
  assert.equal(additionalCollection.members[0], retained);
  assert.equal(retained.identity, retainedIdentity);
  assert.equal(reducedCollection.members.includes(retained), false);
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
