import assert from "node:assert/strict";
import test from "node:test";

import { Collection, Icon } from "../../src/index.js";

function icon(variant: string, name = "camera", namespace?: string) {
  return Icon.define({
    identity: { name, variant, ...(namespace === undefined ? {} : { namespace }) },
    viewBox: { minX: 0, minY: 0, width: 24, height: 24 },
    nodes: [{ kind: "circle", cx: 12, cy: 12, radius: 4 }],
    metadata: {
      displayName: name, rtl: "preserve", deprecated: false,
      presentation: { defaults: {}, overrides: [] },
    },
  });
}

function define(icons: unknown) {
  return Collection.define({
    identity: { name: "grouped" }, icons, metadata: { displayName: "Grouped" },
  } as never);
}

test("derives portable variant properties without narrowing treatment slugs", () => {
  for (const [slug, property] of [
    ["outline", "outline"], [" filled-stippled ", "filledStippled"],
    ["2-tone", "2Tone"], ["01", "01"], ["tone-1", "tone1"],
    ["constructor", "constructor"], ["to-string", "toString"],
  ]) {
    assert.equal(Icon.variantPropertyName(slug!), property);
  }
  for (const invalid of [undefined, null, 1, "", " ", "Outline", "filled--dotted"]) {
    assert.throws(() => Icon.variantPropertyName(invalid as never), /variant/u);
  }
});

test("derives flat members from frozen prototype-free variant groups", () => {
  const outline = icon("outline");
  const filled = icon("filled");
  const collection = Collection.define({
    identity: { name: "camera" },
    icons: { camera: { outline, filled } },
    metadata: { displayName: "Camera" },
  });
  assert.equal(collection.icons.camera.outline, outline);
  assert.equal(collection.icons.camera.filled, filled);
  assert.deepEqual(collection.members, [outline, filled]);
  assert.equal(Object.getPrototypeOf(collection.icons), null);
  assert.equal(Object.getPrototypeOf(collection.icons.camera), null);
  assert.ok(Object.isFrozen(collection.icons.camera));
  assert.equal(collection.icons.camera["absent" as "outline"], undefined);
  assert.deepEqual(Collection.define(collection).members, collection.members);
});

test("publishes closed own data fields without invoking inherited map setters", () => {
  const selected = icon("tone-one");
  const group = Object.assign(Object.create(null), { toneOne: selected });
  const input = Object.assign(Object.create(null), { selectedGlyph: group });
  let calls = 0;
  const fields = ["selectedGlyph", "toneOne"];
  const originals = fields.map(field => Object.getOwnPropertyDescriptor(Object.prototype, field));
  let collection: ReturnType<typeof define>;
  try {
    for (const field of fields) {
      Object.defineProperty(Object.prototype, field, {
        configurable: true,
        get() { calls += 1; throw new Error("inherited getter"); },
        set() { calls += 1; throw new Error("inherited setter"); },
      });
    }
    collection = define(input);
  } finally {
    fields.forEach((field, index) => {
      const original = originals[index];
      if (original === undefined) {
        Reflect.deleteProperty(Object.prototype, field);
      } else {
        Object.defineProperty(Object.prototype, field, original);
      }
    });
  }
  assert.equal(calls, 0);
  const acceptedGroup = collection.icons.selectedGlyph!;
  for (const [owner, field, value] of [
    [collection.icons, "selectedGlyph", acceptedGroup],
    [acceptedGroup, "toneOne", selected],
  ] as const) {
    assert.equal(Object.getPrototypeOf(owner), null);
    assert.ok(Object.isFrozen(owner));
    assert.deepEqual(Object.getOwnPropertyDescriptor(owner, field), {
      value, enumerable: true, writable: false, configurable: false,
    });
    assert.equal(Reflect.set(owner, field, selected), false);
    assert.equal(Reflect.deleteProperty(owner, field), false);
  }
  assert.deepEqual(collection.members, [selected]);
});

test("retains explicit member order and duplicate rejection across many repeated treatments", () => {
  const treatments = ["outline", "filled-dotted", "2-tone"];
  const selected = Array.from({ length: 100 }, (_, index) => {
    const leaves = treatments.map(treatment => icon(treatment, `glyph-${index}`, "scale"));
    const group = Object.fromEntries(leaves.map(leaf => [Icon.variantPropertyName(leaf.identity.variant), leaf]));
    return { alias: `glyph${index}`, leaves, group };
  });
  const input = Object.fromEntries(selected.map(({ alias, group }) => [alias, group]));
  const collection = define(input);
  assert.equal(collection.members.length, 300);
  assert.deepEqual(collection.members, selected.flatMap(({ leaves }) => leaves));
  for (const { alias, leaves, group } of selected) {
    assert.deepEqual(Object.keys(collection.icons[alias]!), Object.keys(group));
    assert.deepEqual(Object.values(collection.icons[alias]!), leaves);
  }
  assert.throws(() => define({ ...input, duplicate: selected.at(-1)!.group }),
    /collection\.icons\.duplicate\.outline.*duplicates an icon identity/u);
  assert.deepEqual(Collection.define(collection).members, collection.members);
});

test("rejects flat maps, empty groups, family drift and mismatched properties", () => {
  const outline = icon("outline", "camera", "aster");
  for (const [icons, pattern] of [
    [{ camera: outline }, /definition\./u],
    [{ camera: {} }, /collection\.icons\.camera.*empty/u],
    [{ camera: { filled: outline } }, /collection\.icons\.camera\.filled/u],
    [{ camera: { outline, filled: icon("filled", "bell", "aster") } }, /same glyph/u],
    [{ camera: { outline, filled: icon("filled", "camera", "external") } }, /same glyph/u],
    [{ camera: { outline, filled: icon("filled") } }, /same glyph/u],
  ] as const) {
    assert.throws(() => define(icons), pattern);
  }
  assert.deepEqual(define({}).members, []);
});

test("checks duplicates across aliases but permits disjoint selections of a glyph", () => {
  const outline = icon("outline");
  const filled = icon("filled");
  assert.throws(() => define({ first: { outline }, second: { outline } }), /duplicates an icon identity/u);
  assert.deepEqual(define({ first: { outline }, second: { filled } }).members, [outline, filled]);
  assert.throws(() => define({ camera: { tone1: icon("tone-1"), other: icon("tone1") } }), /variant property/u);
});

test("uses native numeric property order and keeps shadowing keys safe", () => {
  const input = Object.fromEntries(["10", "2", "01", "2tone", "4294967295", "4294967294", "constructor", "toString"]
    .map((property) => [property, icon(property === "toString" ? "to-string" : property)]));
  const collection = define({ camera: input });
  assert.deepEqual(collection.members.map(i => i.identity.variant),
    ["2", "10", "4294967294", "01", "2tone", "4294967295", "constructor", "to-string"]);
  assert.equal(collection.icons.camera?.["valueOf"], undefined);
  assert.ok(Object.hasOwn(collection.icons.camera!, "constructor"));
});

test("rejects reflective inner maps without executing getters", () => {
  let reads = 0;
  const outline = icon("outline");
  for (const enumerable of [true, false]) {
    const group = {};
    Object.defineProperty(group, "outline", { enumerable, get() { reads += 1; return outline; } });
    assert.throws(() => define({ camera: group }), /enumerable data field/u);
  }
  const symbolic = { outline, [Symbol("hidden")]: outline };
  assert.throws(() => define({ camera: symbolic }), /string/u);
  assert.throws(() => define({ camera: Object.create({ outline }) }), /plain object/u);
  assert.throws(() => define({ camera: [outline] }), /plain object/u);
  assert.equal(reads, 0);
  const nullGroup = Object.assign(Object.create(null), { outline });
  assert.equal(define(Object.assign(Object.create(null), { camera: nullGroup })).members[0], outline);
});

test("checks submitted member order and isolates mutable nested selections", () => {
  const outline = icon("outline");
  const filled = icon("filled");
  const input = { camera: { outline, filled } };
  const collection = define(input);
  input.camera.filled = icon("filled", "bell");
  assert.deepEqual(collection.members, [outline, filled]);
  assert.equal(collection.icons.camera?.filled, filled);
  const reversed = { ...collection, members: [filled, outline] };
  const incomplete = { ...collection, members: [outline] };
  assert.throws(() => Collection.define(reversed), /collection\.members\[0\]/u);
  assert.throws(() => Collection.define(incomplete), /collection\.members/u);
  const hidden = Object.defineProperty({}, "outline", { value: outline });
  const setter = Object.defineProperty({}, "outline", { enumerable: true, set() { throw new Error("not invoked"); } });
  for (const group of [hidden, setter]) {
    assert.throws(() => define({ camera: group }), /enumerable data field/u);
  }
  assert.throws(() => define({ camera: { outline }, bell: filled }), /definition\./u);
});

test("does not inherit namespace while comparing recognised group leaves", () => {
  const outline = icon("outline");
  const filled = icon("filled");
  let reads = 0;
  const original = Object.getOwnPropertyDescriptor(Object.prototype, "namespace");
  try {
    Object.defineProperty(Object.prototype, "namespace", {
      configurable: true, get() { reads += 1; return "polluted"; },
    });
    assert.deepEqual(define({ camera: { outline, filled } }).members, [outline, filled]);
  } finally {
    if (original === undefined) {
      Reflect.deleteProperty(Object.prototype, "namespace");
    } else {
      Object.defineProperty(Object.prototype, "namespace", original);
    }
  }
  assert.equal(reads, 0);
});
