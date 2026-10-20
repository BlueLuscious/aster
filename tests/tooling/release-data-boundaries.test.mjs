import assert from "node:assert/strict";
import test from "node:test";

import { releaseRecordSnapshot } from "../../tooling/release/runtime/release-record.snapshot.mjs";

test("snapshots release evidence as frozen own data without changing its JSON", () => {
  const source = JSON.parse('{"title":"Approved","__proto__":"data","nested":{"value":1}}');
  Object.defineProperty(source, "hidden", { value: "ignored" });
  source[Symbol("ignored")] = "ignored";
  const snapshot = releaseRecordSnapshot(source, "release evidence");
  assert.equal(Object.getPrototypeOf(snapshot), null);
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.hasOwn(snapshot, "__proto__"), true);
  assert.equal(snapshot.__proto__, "data");
  assert.equal(snapshot.nested, source.nested);
  assert.equal(JSON.stringify(snapshot), JSON.stringify(source));
});

test("does not acquire absent release evidence from the input prototype", () => {
  let reads = 0;
  const source = Object.create({ get title() { reads += 1; return "Inherited"; } });
  source.body = "Own notes";
  const snapshot = releaseRecordSnapshot(source, "release evidence");
  assert.deepEqual(Object.keys(snapshot), ["body"]);
  assert.equal(snapshot.title, undefined);
  assert.equal(reads, 0);
});

test("rejects accessor evidence even when its descriptor inherits a value", () => {
  let reads = 0;
  const source = Object.defineProperty({}, "title", {
    enumerable: true,
    get() { reads += 1; return "Accessor"; },
  });
  const previous = Object.getOwnPropertyDescriptor(Object.prototype, "value");
  try {
    Object.defineProperty(Object.prototype, "value", { configurable: true, value: "Inherited" });
    assert.throws(() => releaseRecordSnapshot(source, "release evidence"), /only data properties/u);
    assert.equal(reads, 0);
  } finally {
    if (previous === undefined) {
      Reflect.deleteProperty(Object.prototype, "value");
    } else {
      Object.defineProperty(Object.prototype, "value", previous);
    }
  }
});

test("rejects non-object release evidence with its owning diagnostic label", () => {
  for (const value of [null, undefined, [], "text", 1, true]) {
    assert.throws(() => releaseRecordSnapshot(value, "draft asset"), /Expected draft asset to be an object\./u);
  }
});
