import assert from "node:assert/strict";
import test from "node:test";

import type {
  CollectionDefinition,
  IconDefinition,
  IconIdentity,
} from "@aster/core";
import * as collectionExports from "../../src/collections/index.js";
import * as iconExports from "../../src/icons/index.js";
import {
  AsterCollectionManifest,
  AsterIconManifest,
} from "../../src/manifest/index.js";

/**
 * @description Serialises one complete icon identity to its public manifest key.
 * @param identity - Complete portable icon identity.
 * @returns Canonical manifest key.
 */
function iconKey(identity: IconIdentity): string {
  return `${identity.namespace === undefined ? "" : `${identity.namespace}/`}${identity.name}${identity.variant === undefined ? "" : `@${identity.variant}`}`;
}

/**
 * @description Asserts that every reachable object and array is frozen.
 * @param value - Candidate immutable value.
 * @returns Nothing.
 */
function assertDeeplyFrozen(value: unknown): void {
  if (typeof value !== "object" || value === null) {
    return;
  }

  assert.ok(Object.isFrozen(value));

  for (const nested of Object.values(value)) {
    assertDeeplyFrozen(nested);
  }
}

test("publishes exact metadata-only icon and collection records", () => {
  const icons = Object.entries(iconExports)
    .filter(([symbol]) => symbol !== "AsterIcons")
    .map(([symbol, value]) => {
      const definition = value as IconDefinition;
      const { metadata } = definition;

      return {
        key: iconKey(definition.identity),
        identity: definition.identity,
        symbol,
        displayName: metadata.displayName,
        ...(metadata.tags === undefined ? {} : { tags: metadata.tags }),
        rtl: metadata.rtl,
        ...(metadata.licence === undefined ? {} : { licence: metadata.licence }),
        ...(metadata.attribution === undefined
          ? {}
          : { attribution: metadata.attribution }),
        deprecated: metadata.deprecated,
        ...(metadata.replacedBy === undefined
          ? {}
          : { replacedBy: metadata.replacedBy }),
      };
    })
    .sort((left, right) => left.key.localeCompare(right.key));
  const collections = Object.entries(collectionExports)
    .filter(([symbol]) => symbol !== "AsterCollections")
    .map(([symbol, value]) => {
      const definition = value as CollectionDefinition;

      return {
        key: `${definition.identity.namespace === undefined
          ? ""
          : `${definition.identity.namespace}/`}${definition.identity.name}`,
        identity: definition.identity,
        symbol,
        metadata: definition.metadata,
        members: definition.icons.map((icon) => iconKey(icon.identity)),
      };
    })
    .sort((left, right) => left.key.localeCompare(right.key));

  assert.deepEqual(AsterIconManifest, icons);
  assert.deepEqual(AsterCollectionManifest, collections);

  for (const entry of AsterIconManifest) {
    assert.equal(Object.hasOwn(entry, "nodes"), false);
    assert.equal(Object.hasOwn(entry, "viewBox"), false);
    assert.equal(Object.hasOwn(entry, "presentation"), false);
  }

  for (const entry of AsterCollectionManifest) {
    assert.equal(Object.hasOwn(entry, "icons"), false);
  }
});

test("deeply freezes manifest records and their canonical ordering", () => {
  assertDeeplyFrozen(AsterIconManifest);
  assertDeeplyFrozen(AsterCollectionManifest);
  const iconKeys = AsterIconManifest.map(({ key }) => key);
  const collectionKeys = AsterCollectionManifest.map(({ key }) => key);

  assert.deepEqual(
    iconKeys,
    [...iconKeys].sort(),
  );
  assert.deepEqual(
    collectionKeys,
    [...collectionKeys].sort(),
  );
});
