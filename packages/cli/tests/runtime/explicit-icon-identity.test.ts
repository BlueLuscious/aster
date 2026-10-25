import assert from "node:assert/strict";
import test from "node:test";

import { CatalogueDiscoveryIdentityNormaliser } from "../../src/catalogue/runtime/catalogue-discovery-identity.normaliser.js";
import { CanonicalIdentityValidator } from "../../src/shared/runtime/canonical-identity.validator.js";

test("distinguishes complete icon identities from variant-free collection identities", () => {
  const validator = new CanonicalIdentityValidator();
  for (const value of ["camera@outline", "aster/camera@2-tone", "aster/camera@filled-dotted"]) {
    assert.equal(validator.icon(value), true, value);
    assert.equal(validator.collection(value), false, value);
  }
  for (const value of ["camera", "aster/camera"]) {
    assert.equal(validator.icon(value), false, value);
    assert.equal(validator.collection(value), true, value);
  }
  for (const value of ["camera@", "camera@Outline", "camera@filled--dotted", "camera@outline@filled", "aster/camera/outline"]) {
    assert.equal(validator.icon(value), false, value);
  }
});

test("rejects incomplete discovery identities without changing collection identity", () => {
  const normaliser = new CatalogueDiscoveryIdentityNormaliser();
  const glyph = { namespace: "testing", name: "camera" };
  for (const value of [glyph, { ...glyph, variant: undefined }, { ...glyph, variant: "" }]) {
    assert.equal(normaliser.icon(value), undefined);
  }
  assert.deepEqual(normaliser.collection(glyph), glyph);
  for (const variant of ["outline", "2-tone", "filled-dotted"]) {
    const identity = { ...glyph, variant };
    assert.deepEqual(normaliser.icon(identity), identity);
    assert.equal(normaliser.collection(identity), undefined);
  }
});
