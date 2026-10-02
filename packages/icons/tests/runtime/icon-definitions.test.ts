import assert from "node:assert/strict";
import test from "node:test";

import {
  iconTechnicalPresentation,
  type IconDefinition,
} from "@luscious-garden/aster-core";
import {
  amellusIconAuthoringProfile,
} from "../../src/authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../../src/authoring/constants/aster-original-icon-authorship.constant.js";
import {
  AsterCollectionLoaders,
  AsterIconLoaders,
} from "../../src/dynamic/index.js";

const iconDefinitions = Object.freeze(
  await Promise.all(
    Object.values(AsterIconLoaders).map((loader) => {
      assert.ok(loader);
      return loader();
    }),
  ),
);
const collectionDefinitions = Object.freeze(
  await Promise.all(
    Object.values(AsterCollectionLoaders).map((loader) => {
      assert.ok(loader);
      return loader();
    }),
  ),
);

const presentationFields = Object.keys(iconTechnicalPresentation);

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
    }
  }

  return values;
}

test("composes original authorship and the Amellus visual profile", () => {
  const definitions = iconDefinitions;
  const identities = new Set<string>();

  assert.ok(
    definitions.length > 0,
    "Expected the Aster icon loader family to be non-empty.",
  );

  for (const definition of definitions) {
    assert.equal(
      definition.identity.namespace,
      asterOriginalIconAuthorship.namespace,
    );
    assert.equal(identities.has(definition.identity.name), false);
    identities.add(definition.identity.name);
    assert.deepEqual(definition.viewBox, amellusIconAuthoringProfile.viewBox);
    assert.deepEqual(
      definition.metadata.presentation,
      amellusIconAuthoringProfile.presentation,
    );
    assert.equal(
      definition.metadata.licence,
      asterOriginalIconAuthorship.licence,
    );
    assert.equal(
      definition.metadata.attribution,
      asterOriginalIconAuthorship.attribution,
    );
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

  assert.equal(
    definitions.find(({ identity }) => identity.name === "arrow-left")
      ?.metadata.rtl,
    "mirror",
  );
  assert.equal(
    definitions.find(({ identity }) => identity.name === "arrow-right")
      ?.metadata.rtl,
    "mirror",
  );
});

test("keeps collection membership within the independent icon loaders", () => {
  assert.ok(
    collectionDefinitions.length > 0,
    "Expected the Aster collection loader family to be non-empty.",
  );

  for (const collection of collectionDefinitions) {
    for (const definition of collection.members) {
      assert.ok(
        iconDefinitions.includes(definition),
        `Expected ${definition.identity.name} from ${collection.identity.name} in the icon loader family.`,
      );
    }

    assertDeeplyFrozen(collection);
  }
});
