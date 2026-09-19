import assert from "node:assert/strict";
import test from "node:test";

import { Icon } from "@aster/core";
import {
  amellusIconAuthoringProfile,
} from "../../src/authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../../src/authoring/constants/aster-original-icon-authorship.constant.js";

test("keeps original authorship separate from Amellus visual policy", () => {
  assert.deepEqual(asterOriginalIconAuthorship, {
    namespace: "aster",
    licence: "ISC",
    attribution: "BlueLuscious",
  });
  assert.deepEqual(amellusIconAuthoringProfile, {
    viewBox: { minX: 0, minY: 0, width: 24, height: 24 },
    presentation: {
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
    },
  });
  assert.ok(Object.isFrozen(asterOriginalIconAuthorship));
  assert.ok(Object.isFrozen(amellusIconAuthoringProfile));
  assert.ok(Object.isFrozen(amellusIconAuthoringProfile.viewBox));
  assert.ok(Object.isFrozen(amellusIconAuthoringProfile.presentation));
  assert.ok(Object.isFrozen(amellusIconAuthoringProfile.presentation.defaults));
  assert.ok(Object.isFrozen(amellusIconAuthoringProfile.presentation.overrides));
});

test("allows original Aster artwork to use another visual profile", () => {
  const definition = Icon.define({
    identity: {
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
    amellusIconAuthoringProfile.presentation,
  );
});

test("allows independently owned artwork to provide its own authorship", () => {
  const definition = Icon.define({
    identity: { namespace: "external", name: "authorship-fixture" },
    viewBox: amellusIconAuthoringProfile.viewBox,
    nodes: [{ kind: "circle", cx: 12, cy: 12, radius: 4 }],
    metadata: {
      displayName: "Authorship fixture",
      rtl: "preserve",
      presentation: amellusIconAuthoringProfile.presentation,
      licence: "CC0-1.0",
      attribution: "External Author",
      deprecated: false,
    },
  });

  assert.equal(definition.identity.namespace, "external");
  assert.equal(definition.metadata.licence, "CC0-1.0");
  assert.equal(definition.metadata.attribution, "External Author");
});
