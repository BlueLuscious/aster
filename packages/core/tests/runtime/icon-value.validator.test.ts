import assert from "node:assert/strict";
import test from "node:test";

import { IconDefinitionError } from "../../src/index.js";
import { CanonicalSlugValidator } from "../../src/shared/runtime/canonical-slug.validator.js";
import { IconValueValidator } from "../../src/shared/runtime/icon-value.validator.js";

test("validates canonical slugs without trimming or narrowing the treatment vocabulary", () => {
  const validator = new CanonicalSlugValidator();
  for (const slug of ["outline", "filled-dotted", "2-tone", "tone-1", "tone1", "0", "arrow-left"]) {
    assert.equal(validator.validate(slug, "candidate"), slug);
  }

  for (const slug of ["", "Outline", "filledDotted", "filled--dotted", "-a", "a-", "a_b", "a/b", "a@b", " outline "]) {
    assert.throws(() => validator.validate(slug, "candidate"), (error: unknown) => {
      assert.ok(error instanceof IconDefinitionError);
      assert.equal(error.code, IconDefinitionError.code);
      assert.equal(error.path, "candidate");
      assert.equal(error.message, "ASTER-CORE-001 at candidate: expected an ASCII lowercase kebab-case slug.");
      return true;
    });
  }
});

test("canonicalises primitive text while leaving strict slug validation with its domain owner", () => {
  const values = new IconValueValidator();
  const slugs = new CanonicalSlugValidator();
  assert.equal(values.text(" \tfilled-dotted\n", "candidate"), "filled-dotted");
  assert.equal(values.text("  Camera Outline  ", "candidate"), "Camera Outline");
  assert.equal(slugs.validate(values.text(" outline ", "candidate"), "candidate"), "outline");
  assert.throws(() => slugs.validate(" outline ", "candidate"), IconDefinitionError);
});

test("rejects empty and non-text primitive inputs without coercing caller-owned values", () => {
  const validator = new IconValueValidator();
  let coercions = 0;
  const candidate = { toString() { coercions += 1; return "outline"; } };

  for (const value of [undefined, null, false, 0, [], candidate, "", " \t\n"]) {
    assert.throws(() => validator.text(value, "candidate"), (error: unknown) => {
      assert.ok(error instanceof IconDefinitionError);
      assert.equal(error.path, "candidate");
      assert.equal(error.message, "ASTER-CORE-001 at candidate: expected non-empty text.");
      return true;
    });
  }
  assert.equal(coercions, 0);
});

test("preserves canonical numeric boundaries independently from primitive text acceptance", () => {
  const validator = new IconValueValidator();
  assert.ok(Object.is(validator.finiteNumber(-0, "candidate"), 0));
  assert.equal(validator.nonNegativeNumber(0, "candidate"), 0);
  assert.equal(validator.positiveNumber(Number.MIN_VALUE, "candidate"), Number.MIN_VALUE);
  assert.equal(validator.opacity(0, "candidate"), 0);
  assert.equal(validator.opacity(1, "candidate"), 1);

  for (const value of [undefined, null, "1", Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => validator.finiteNumber(value, "candidate"), IconDefinitionError);
  }
  assert.throws(() => validator.positiveNumber(-0, "candidate"), IconDefinitionError);
  assert.throws(() => validator.nonNegativeNumber(-1, "candidate"), IconDefinitionError);
  assert.throws(() => validator.opacity(1.01, "candidate"), IconDefinitionError);
});
