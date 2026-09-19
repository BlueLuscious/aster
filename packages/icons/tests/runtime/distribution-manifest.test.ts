import assert from "node:assert/strict";
import test from "node:test";

import type {
  IconIdentity,
} from "@aster/core";
import {
  AsterCollectionLoaders,
  AsterIconLoaders,
} from "../../src/dynamic/index.js";
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
 * @description Converts one canonical kebab-case slug to its public PascalCase symbol segment.
 * @param slug - Canonical identity slug.
 * @returns Public symbol segment.
 */
function symbolSegment(slug: string): string {
  return slug
    .split("-")
    .map((part) => `${part[0]?.toUpperCase()}${part.slice(1)}`)
    .join("");
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

test("publishes exact metadata-only icon and collection records", async () => {
  const icons = await Promise.all(
    AsterIconManifest.map(async ({ key }) => {
      const loader = AsterIconLoaders[key];
      assert.ok(loader);
      const definition = await loader();
      const { metadata } = definition;

      return {
        key: iconKey(definition.identity),
        identity: definition.identity,
        symbol: `${symbolSegment(definition.identity.name)}${
          definition.identity.variant === undefined
            ? ""
            : symbolSegment(definition.identity.variant)
        }`,
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
    }),
  );
  const collections = await Promise.all(
    AsterCollectionManifest.map(async ({ key }) => {
      const loader = AsterCollectionLoaders[key];
      assert.ok(loader);
      const definition = await loader();

      return {
        key: `${definition.identity.namespace === undefined
          ? ""
          : `${definition.identity.namespace}/`}${definition.identity.name}`,
        identity: definition.identity,
        symbol: `${symbolSegment(definition.identity.name)}Collection`,
        metadata: definition.metadata,
        members: definition.icons.map((icon) => iconKey(icon.identity)),
      };
    }),
  );

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
