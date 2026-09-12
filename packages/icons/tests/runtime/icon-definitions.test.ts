import assert from "node:assert/strict";
import test from "node:test";

import type { CollectionDefinition, IconDefinition } from "@aster/core";
import { AsterCollections } from "../../src/collections/index.js";
import * as collections from "../../src/collections/index.js";
import { AsterIcons } from "../../src/icons/index.js";
import * as icons from "../../src/icons/index.js";

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

      if (field === "commands" && Array.isArray(value)) {
        for (const command of value) {
          for (const operand of Object.values(command)) {
            if (typeof operand === "number") {
              values.push(operand);
            }
          }
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

test("keeps named icon exports aligned with the complete icon index", () => {
  const exportedDefinitions = Object.entries(icons)
    .filter(([symbol]) => symbol !== "AsterIcons")
    .map(([, definition]) => definition as IconDefinition)
    .sort((left, right) =>
      left.identity.name.localeCompare(right.identity.name),
    );

  assert.deepEqual(AsterIcons, exportedDefinitions);
  assert.ok(Object.isFrozen(AsterIcons));
});

test("keeps named collection exports aligned with the complete collection index", () => {
  const exportedDefinitions = Object.entries(collections)
    .filter(([symbol]) => symbol !== "AsterCollections")
    .map(([, definition]) => definition as CollectionDefinition)
    .sort((left, right) =>
      left.identity.name.localeCompare(right.identity.name),
    );

  assert.deepEqual(AsterCollections, exportedDefinitions);
  assert.ok(Object.isFrozen(AsterCollections));
});

test("keeps every definition aligned with shared authoring defaults", () => {
  const definitions = AsterIcons;
  const identities = new Set<string>();

  assert.ok(
    definitions.length > 0,
    "Expected the Aster icon index to be non-empty.",
  );

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
    const tags = definition.metadata.tags;
    assert.ok(tags);
    assert.ok(
      definition.identity.name
        .split("-")
        .every((part) => tags.includes(part)),
    );
    assert.ok(definition.nodes.length > 0);
    assert.ok(definition.nodes.length <= 16);
    assert.ok(
      definition.nodes.reduce(
        (count, node) => count + (node.kind === "path" ? node.commands.length : 0),
        0,
      ) <= 64,
    );

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
  assert.equal(icons.ArrowRight.metadata.rtl, "mirror");
});

test("keeps collection membership within the independent icon index", () => {
  assert.ok(
    AsterCollections.length > 0,
    "Expected the Aster collection index to be non-empty.",
  );

  for (const collection of AsterCollections) {
    for (const definition of collection.icons) {
      assert.ok(
        AsterIcons.includes(definition),
        `Expected ${definition.identity.name} from ${collection.identity.name} in the icon index.`,
      );
    }

    assertDeeplyFrozen(collection);
  }
});
