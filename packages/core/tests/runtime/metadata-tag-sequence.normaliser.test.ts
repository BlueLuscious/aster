import assert from "node:assert/strict";
import test from "node:test";

import { Collection, Icon, IconDefinitionError } from "../../src/index.js";
import { MetadataTagSequenceNormaliser } from "../../src/metadata/runtime/metadata-tag-sequence.normaliser.js";

test("isolates canonical tag sequences without sorting, deduplicating or mutating authored input", () => {
  const normaliser = new MetadataTagSequenceNormaliser();
  const input = [" second ", "first"];
  const accepted = normaliser.normalise(input, "metadata.tags");
  assert.deepEqual(accepted, ["second", "first"]);
  assert.deepEqual(input, [" second ", "first"]);
  assert.notEqual(accepted, input);
  assert.ok(Object.isFrozen(accepted));
  assert.deepEqual(normaliser.normalise([], "metadata.tags"), []);
});

test("preserves caller-owned paths while rejecting malformed and canonically duplicate tags", () => {
  const normaliser = new MetadataTagSequenceNormaliser();
  for (const [value, path] of [
    [undefined, "metadata.tags"],
    [["tag", " tag "], "metadata.tags"],
    [["Filled"], "metadata.tags[0]"],
    [[""], "metadata.tags[0]"],
    [[1], "metadata.tags[0]"],
  ] as const) {
    assert.throws(() => normaliser.normalise(value, "metadata.tags"), (error: unknown) => {
      assert.ok(error instanceof IconDefinitionError);
      assert.equal(error.path, path);
      return true;
    });
  }
});

test("uses the same tag acceptance rule for icon and collection metadata", () => {
  const tags = [" camera ", "interface-icons"];
  const icon = (values: readonly string[]) => Icon.define({
    identity: { name: "camera", variant: "outline" },
    viewBox: { minX: 0, minY: 0, width: 24, height: 24 },
    nodes: [{ kind: "circle", cx: 12, cy: 12, radius: 4 }],
    metadata: {
      displayName: "Camera", rtl: "preserve", deprecated: false,
      presentation: { defaults: {}, overrides: [] }, tags: values,
    },
  });
  const collection = (values: readonly string[]) => Collection.define({
    identity: { name: "minimal" }, icons: {}, metadata: { displayName: "Minimal", tags: values },
  });
  assert.deepEqual(icon(tags).metadata.tags, collection(tags).metadata.tags);
  assert.deepEqual(tags, [" camera ", "interface-icons"]);
  for (const [construct, path] of [
    [icon, "definition.metadata.tags"],
    [collection, "collection.metadata.tags"],
  ] as const) {
    assert.throws(() => construct(["camera", " camera "]), (error: unknown) => {
      assert.ok(error instanceof IconDefinitionError);
      assert.equal(error.path, path);
      assert.equal(error.message, `ASTER-CORE-001 at ${path}: expected unique tags.`);
      return true;
    });
  }
});
