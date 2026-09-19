import assert from "node:assert/strict";
import test from "node:test";

import * as collectionExports from "../../src/collections/index.js";
import {
  AsterCollectionLoaders,
  AsterIconLoaders,
} from "../../src/dynamic/index.js";
import * as iconExports from "../../src/icons/index.js";
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

test("loads every exact icon and collection definition asynchronously", async () => {
  for (const entry of AsterIconManifest) {
    const loader = AsterIconLoaders[entry.key];

    assert.ok(loader);
    assert.equal(
      await loader(),
      (iconExports as Record<string, unknown>)[entry.symbol],
    );
  }

  for (const entry of AsterCollectionManifest) {
    const loader = AsterCollectionLoaders[entry.key];

    assert.ok(loader);
    assert.equal(
      await loader(),
      (collectionExports as Record<string, unknown>)[entry.symbol],
    );
  }
});
