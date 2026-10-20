import assert from "node:assert/strict";
import test from "node:test";
import { Icon } from "@luscious-garden/aster-core";

import {
  AsterCollectionLoaders,
  AsterIconLoaders,
} from "../../src/dynamic/index.js";
import {
  AsterCollectionManifest,
  AsterIconManifest,
} from "../../src/manifest/index.js";

test("keeps loader keys exactly aligned with manifest identities", () => {
  assert.deepEqual(
    Object.keys(AsterIconLoaders),
    AsterIconManifest.map(({ key }) => key),
  );
  assert.deepEqual(
    Object.keys(AsterCollectionLoaders),
    AsterCollectionManifest.map(({ key }) => key),
  );
  assert.ok(Object.isFrozen(AsterIconLoaders));
  assert.ok(Object.isFrozen(AsterCollectionLoaders));
  assert.ok(
    Object.values(AsterIconLoaders).every(
      (loader) => loader !== undefined && Object.isFrozen(loader),
    ),
  );
  assert.ok(
    Object.values(AsterCollectionLoaders).every(
      (loader) => loader !== undefined && Object.isFrozen(loader),
    ),
  );
  assert.equal(AsterIconLoaders["aster/absent"], undefined);
  assert.equal(AsterCollectionLoaders.absent, undefined);
});

for (const { family, loaders } of [
  { family: "icon", loaders: AsterIconLoaders },
  { family: "collection", loaders: AsterCollectionLoaders },
]) {
  test(`keeps absent ${family} loader keys free of inherited properties`, () => {
    for (const key of Object.getOwnPropertyNames(Object.prototype)) {
      if (Object.hasOwn(loaders, key)) {
        continue;
      }

      const selected = loaders[key]?.();

      assert.equal(loaders[key], undefined, key);
      assert.equal(selected, undefined, key);
      assert.equal(key in loaders, false, key);
    }

    assert.equal(Object.getPrototypeOf(loaders), null);
  });
}

test("loads every exact icon and collection definition asynchronously", async () => {
  for (const entry of AsterIconManifest) {
    const loader = AsterIconLoaders[entry.key];

    assert.ok(loader);
    const definition = await loader();

    assert.deepEqual(definition.identity, entry.identity);
    assert.equal(definition.metadata.displayName, entry.displayName);
    assert.equal(await loader(), definition);
  }

  for (const entry of AsterCollectionManifest) {
    const loader = AsterCollectionLoaders[entry.key];

    assert.ok(loader);
    const definition = await loader();

    assert.deepEqual(definition.identity, entry.identity);
    assert.deepEqual(
      definition.members.map(({ identity }) =>
        `${identity.namespace}/${identity.name}@${identity.variant}`
      ),
      entry.members,
    );
    assert.equal(await loader(), definition);
  }
});

test("retains canonical leaves across concurrent icon and collection loads", async () => {
  const requests = Object.entries(AsterIconLoaders).map(async ([key, loader]) => {
    assert.ok(loader);
    const [first, second] = await Promise.all([loader(), loader()]);
    assert.equal(first, second, key);
    assert.equal(Icon.define(first), first, key);
    return [key, first] as const;
  });
  const [entries, collections] = await Promise.all([
    Promise.all(requests),
    Promise.all(Object.values(AsterCollectionLoaders).map(async (loader) => {
      assert.ok(loader);
      const [first, second] = await Promise.all([loader(), loader()]);
      assert.equal(first, second);
      return first;
    })),
  ]);
  const definitions = new Set(entries.map(([, definition]) => definition));
  for (const collection of collections) {
    for (const definition of collection.members) {
      assert.ok(definitions.has(definition));
    }
  }
});
