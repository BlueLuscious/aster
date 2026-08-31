import assert from "node:assert/strict";
import test from "node:test";

import type { IconDefinition } from "@aster/core";
import {
  AsterCollection,
  AsterCollections,
} from "../../src/collections/index.js";
import { AsterIcons } from "../../src/icons/index.js";
import * as icons from "../../src/icons/index.js";

const expectedSymbols = [
  "ArrowLeft",
  "Bell",
  "Camera",
  "Check",
  "Close",
  "Cloud",
  "Folder",
  "Heart",
  "Home",
  "Leaf",
  "Lock",
  "Plus",
  "Search",
  "Settings",
  "Star",
  "User",
] as const;

const presentationFields = [
  "fill",
  "fillRule",
  "stroke",
  "strokeWidth",
  "strokeLineCap",
  "strokeLineJoin",
  "strokeMiterLimit",
  "opacity",
  "fillOpacity",
  "strokeOpacity",
] as const;

function assertDeeplyFrozen(value: unknown): void {
  if (typeof value !== "object" || value === null) {
    return;
  }

  assert.ok(Object.isFrozen(value));

  for (const nested of Object.values(value)) {
    assertDeeplyFrozen(nested);
  }
}

function numericGeometryValues(definition: IconDefinition): readonly number[] {
  const values: number[] = [];

  for (const node of definition.nodes) {
    for (const [field, value] of Object.entries(node)) {
      if (typeof value === "number") {
        values.push(value);
      }

      if (field === "points" && Array.isArray(value)) {
        for (const point of value) {
          values.push(point.x, point.y);
        }
      }

      if (field === "data" && typeof value === "string") {
        values.push(
          ...(value.match(/-?(?:\d+(?:\.\d+)?|\.\d+)/gu) ?? []).map(Number),
        );
      }
    }
  }

  return values;
}

test("exports the exact representative pilot set", () => {
  assert.deepEqual(
    Object.keys(icons).sort(),
    ["AsterIcons", ...expectedSymbols].sort(),
  );
  assert.equal(AsterIcons.length, 16);
  assert.deepEqual(
    AsterIcons,
    expectedSymbols.map((symbol) => icons[symbol]),
  );
  assert.ok(Object.isFrozen(AsterIcons));
});

test("keeps every definition aligned with shared authoring defaults", () => {
  const definitions = AsterIcons;
  const identities = new Set<string>();

  for (const definition of definitions) {
    assert.equal(definition.identity.namespace, "aster");
    assert.equal(identities.has(definition.identity.name), false);
    identities.add(definition.identity.name);
    assert.deepEqual(definition.viewBox, {
      minX: 0,
      minY: 0,
      width: 24,
      height: 24,
    });
    assert.deepEqual(definition.metadata.presentation, {
      defaults: {
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.5,
        strokeLineCap: "round",
        strokeLineJoin: "round",
      },
      overrides: [],
      defaultSize: 24,
      minimumSize: 16,
    });
    assert.equal(definition.metadata.licence, "ISC");
    assert.equal(definition.metadata.attribution, "BlueLuscious");
    assert.equal(definition.metadata.deprecated, false);
    assert.ok(definition.nodes.length > 0);
    assert.ok(definition.nodes.length <= 16);

    for (const node of definition.nodes) {
      for (const field of presentationFields) {
        assert.equal(field in node, false);
      }
    }

    for (const value of numericGeometryValues(definition)) {
      assert.equal(
        Number.isInteger(value / 0.5),
        true,
        `${definition.identity.name} contains off-grid value ${value}`,
      );
    }

    assertDeeplyFrozen(definition);
  }

  assert.equal(icons.ArrowLeft.metadata.rtl, "mirror");

  for (const definition of definitions) {
    if (definition !== icons.ArrowLeft) {
      assert.equal(definition.metadata.rtl, "preserve");
    }
  }
});

test("retains the complete pilot through independent collection membership", () => {
  assert.equal(AsterCollection.identity.name, "aster");
  assert.deepEqual(AsterCollection.icons, AsterIcons);
  assert.deepEqual(AsterCollections, [AsterCollection]);
  assert.ok(Object.isFrozen(AsterCollections));

  for (const definition of AsterIcons) {
    assert.ok(AsterCollection.icons.includes(definition));
  }

  assertDeeplyFrozen(AsterCollection);
});
