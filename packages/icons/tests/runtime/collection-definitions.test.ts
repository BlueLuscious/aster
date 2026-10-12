import assert from "node:assert/strict";
import test from "node:test";

import { Collection } from "@luscious-garden/aster-core";
import { asterArtworkLicence } from "../../src/authoring/constants/aster-artwork-licence.constant.js";
import { Amellus } from "../../src/collections/a/amellus/amellus.collection.js";
import { AsterCollectionLoaders, AsterIconLoaders } from "../../src/dynamic/index.js";

test("exposes one canonical collection value through its facade and lazy loader", async () => {
  const direct = await import("../../src/generated/facades/collections/amellus.js");
  const loader = AsterCollectionLoaders.amellus;

  assert.ok(loader);
  assert.deepEqual(Object.keys(direct), ["Amellus"]);
  assert.equal(Object.hasOwn(direct, "AmellusCollection"), false);
  assert.equal(direct.Amellus, Amellus);
  assert.equal(await loader(), Amellus);
  assert.equal(await loader(), direct.Amellus);
  assert.equal(Amellus.icons, direct.Amellus.icons);
  assert.equal(Amellus.members, direct.Amellus.members);
  assert.equal(Amellus.metadata, direct.Amellus.metadata);
});

test("derives ordered Amellus membership from its source-owned aliases", () => {
  const aliases = Object.keys(Amellus.icons);
  const definitions = Object.values(Amellus.icons);

  assert.ok(aliases.length > 0, "Expected Amellus to contain at least one icon.");
  assert.deepEqual(definitions, Amellus.members);
  assert.equal(new Set(Amellus.members).size, definitions.length);
  assert.deepEqual(Amellus.metadata, {
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
    Amellus.members.every((definition) =>
      Object.hasOwn(
        AsterIconLoaders,
        `${definition.identity.namespace}/${definition.identity.name}`,
      )
    ),
  );
  assert.ok(Object.isFrozen(Amellus));
  assert.ok(Object.isFrozen(Amellus.icons));
  assert.ok(Object.isFrozen(Amellus.members));
  assert.ok(Object.isFrozen(Amellus.metadata));
});

test("keeps icon identity independent from collection membership", async () => {
  const retained = Amellus.icons.arrowLeft;
  const omitted = Amellus.icons.arrowRight;
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
