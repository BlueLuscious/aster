import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function createDefinitionInput() {
  return {
    identity: {
      collection: "minimal",
      name: "camera",
    },
    viewBox: {
      minX: 0,
      minY: 0,
      width: 24,
      height: 24,
    },
    nodes: [
      {
        kind: "circle",
        cx: 12,
        cy: 12,
        radius: 4,
      },
    ],
    metadata: {
      displayName: "Camera",
      rtl: "preserve",
      presentation: {
        defaults: {
          fill: "none",
          stroke: "currentColor",
        },
        overrides: ["stroke"],
      },
      deprecated: false,
    },
  };
}

test("exposes the exact immutable root value surface", async () => {
  const packageModule = await import("@aster/core");

  assert.deepEqual(Object.keys(packageModule).sort(), ["Icon"]);
  assert.deepEqual(Object.keys(packageModule.Icon), ["define"]);
  assert.ok(Object.isFrozen(packageModule.Icon));
});

test("constructs isolated definitions without a catalogue registry", async () => {
  const { Icon } = await import("@aster/core");
  const first = Icon.define(createDefinitionInput());
  const second = Icon.define(createDefinitionInput());

  assert.notEqual(first, second);
  assert.deepEqual(first, second);
  assert.ok(Object.isFrozen(first));
});

test("rejects implementation subpaths through package exports", async () => {
  await assert.rejects(
    import("@aster/core/definition/runtime/icon-definition.factory.js"),
    (error) => error?.code === "ERR_PACKAGE_PATH_NOT_EXPORTED",
  );
  await assert.rejects(
    import("@aster/core/shared/runtime/icon-definition.error.js"),
    (error) => error?.code === "ERR_PACKAGE_PATH_NOT_EXPORTED",
  );
});

test("publishes only the accepted root export and declaration entry", async () => {
  const manifest = JSON.parse(
    await readFile(resolve(packageRoot, "package.json"), "utf8"),
  );
  const rootDeclaration = await readFile(resolve(packageRoot, "dist/index.d.ts"), "utf8");

  assert.deepEqual(Object.keys(manifest.exports), ["."]);
  assert.equal(manifest.exports["."].import, "./dist/index.js");
  assert.equal(manifest.exports["."].types, "./dist/index.d.ts");
  assert.doesNotMatch(rootDeclaration, /runtime|internal|mutable/iu);
});
