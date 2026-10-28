import assert from "node:assert/strict";
import test from "node:test";

import { Collection, Icon } from "@luscious-garden/aster-core";
import { asterArtworkLicence } from "../../src/authoring/constants/aster-artwork-licence.constant.js";
import {
  amellusIconAuthoringProfile,
} from "../../src/authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../../src/authoring/constants/aster-original-icon-authorship.constant.js";

test("keeps original authorship separate from Amellus visual policy", () => {
  assert.deepEqual(asterOriginalIconAuthorship, {
    namespace: "aster",
    licence: asterArtworkLicence,
    attribution: "BlueLuscious",
  });
  assert.deepEqual(amellusIconAuthoringProfile.viewBox, {
    minX: 0, minY: 0, width: 24, height: 24,
  });
  assert.deepEqual(Object.keys(amellusIconAuthoringProfile.presentations), [
    "outline", "filled",
  ]);
  for (const [variant, presentation] of Object.entries(
    amellusIconAuthoringProfile.presentations,
  )) {
    assert.deepEqual(presentation, {
      defaults: {
        fill: variant === "outline" ? "none" : "currentColor",
        stroke: "currentColor",
        strokeWidth: 1.5,
        strokeLineCap: "round",
        strokeLineJoin: "round",
      },
      overrides: [],
      defaultSize: 24,
      minimumSize: 16,
    });
    assert.ok(Object.isFrozen(presentation));
    assert.ok(Object.isFrozen(presentation.defaults));
    assert.ok(Object.isFrozen(presentation.overrides));
  }
  assert.ok(Object.isFrozen(asterOriginalIconAuthorship));
  assert.ok(Object.isFrozen(amellusIconAuthoringProfile));
  assert.ok(Object.isFrozen(amellusIconAuthoringProfile.viewBox));
  assert.ok(Object.isFrozen(amellusIconAuthoringProfile.presentations));
});

test("allows original Aster artwork to use another visual profile", () => {
  const definition = Icon.define({
    identity: {
      variant: "outline",
      namespace: asterOriginalIconAuthorship.namespace,
      name: "alternative-profile-fixture",
    },
    viewBox: { minX: 0, minY: 0, width: 32, height: 32 },
    nodes: [{ kind: "circle", cx: 16, cy: 16, radius: 8 }],
    metadata: {
      displayName: "Alternative profile fixture",
      rtl: "preserve",
      presentation: {
        defaults: { fill: "currentColor", stroke: "none" },
        overrides: [],
        defaultSize: 32,
        minimumSize: 20,
      },
      licence: asterOriginalIconAuthorship.licence,
      attribution: asterOriginalIconAuthorship.attribution,
      deprecated: false,
    },
  });

  assert.deepEqual(definition.viewBox, {
    minX: 0,
    minY: 0,
    width: 32,
    height: 32,
  });
  assert.notDeepEqual(definition.viewBox, amellusIconAuthoringProfile.viewBox);
  assert.notDeepEqual(
    definition.metadata.presentation,
    amellusIconAuthoringProfile.presentations.outline,
  );
});

test("allows independently owned artwork to provide its own authorship", () => {
  const definition = Icon.define({
    identity: { variant: "outline", namespace: "external", name: "authorship-fixture" },
    viewBox: amellusIconAuthoringProfile.viewBox,
    nodes: [{ kind: "circle", cx: 12, cy: 12, radius: 4 }],
    metadata: {
      displayName: "Authorship fixture",
      rtl: "preserve",
      presentation: amellusIconAuthoringProfile.presentations.outline,
      licence: "CC0-1.0",
      attribution: "External Author",
      deprecated: false,
    },
  });

  assert.equal(definition.identity.namespace, "external");
  assert.equal(definition.metadata.licence, "CC0-1.0");
  assert.equal(definition.metadata.attribution, "External Author");

  const collection = Collection.define({
    identity: { name: "independent-curation" },
    icons: { external: { outline: definition } },
    metadata: {
      displayName: "Independent curation",
      licence: asterArtworkLicence,
      attribution: asterOriginalIconAuthorship.attribution,
    },
  });

  assert.equal(collection.icons.external.outline, definition);
  assert.equal(collection.members[0], definition);
  assert.equal(collection.metadata.licence, asterArtworkLicence);
  assert.equal(collection.icons.external.outline.metadata.licence, "CC0-1.0");
  assert.equal(collection.icons.external.outline.metadata.attribution, "External Author");
});
