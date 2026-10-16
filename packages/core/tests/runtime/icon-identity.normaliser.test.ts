import assert from "node:assert/strict";
import test from "node:test";

import { Icon, IconDefinitionError } from "../../src/index.js";
import { IconIdentityNormaliser } from "../../src/definition/runtime/icon-identity.normaliser.js";

test("derives a variant property name without changing canonical identity", () => {
  const normaliser = new IconIdentityNormaliser();
  const authored = { namespace: " aster ", name: " camera ", variant: " filled-dotted " };
  const identity = normaliser.normalise(authored);

  assert.deepEqual(identity, { namespace: "aster", name: "camera", variant: "filled-dotted" });
  assert.ok(Object.isFrozen(identity));
  assert.equal(normaliser.variantPropertyName(authored.variant), "filledDotted");
  assert.equal(Icon.variantPropertyName(authored.variant), normaliser.variantPropertyName(authored.variant));
  assert.equal(identity.variant, "filled-dotted");
  assert.equal(authored.variant, " filled-dotted ");
  assert.deepEqual(normaliser.normalise({ name: "camera", variant: "outline" }), {
    name: "camera", variant: "outline",
  });
});

test("preserves treatment validation and caller-owned diagnostic paths", () => {
  const normaliser = new IconIdentityNormaliser();
  const path = "collection.icons.camera.filledDotted";

  for (const invalid of [undefined, null, 1, "", " ", "filledDotted", "filled--dotted"]) {
    assert.throws(() => normaliser.variantPropertyName(invalid, path), error => {
      assert.ok(error instanceof IconDefinitionError);
      assert.equal(error.path, path);
      assert.equal(error.code, IconDefinitionError.code);
      return true;
    });
  }

  assert.throws(() => normaliser.normalise({ name: "camera", variant: "filledDotted" }), error => {
    assert.ok(error instanceof IconDefinitionError);
    assert.equal(error.path, "definition.identity.variant");
    return true;
  });
});
