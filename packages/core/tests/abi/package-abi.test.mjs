import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

async function collectFiles(root, extension) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = resolve(root, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(path, extension)));
    } else if (entry.isFile() && entry.name.endsWith(extension)) {
      files.push(path);
    }
  }

  return files.sort((left, right) => left.localeCompare(right));
}

function createDefinitionInput() {
  return {
    identity: {
      namespace: "minimal",
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

  assert.deepEqual(Object.keys(packageModule).sort(), [
    "Collection",
    "Icon",
    "iconDirections",
    "iconNodeKinds",
    "iconPaintSchema",
    "iconPresentationEnumerations",
    "iconPresentationOverrideOrder",
    "iconRtlPolicies",
    "iconTechnicalPresentation",
  ]);
  assert.deepEqual(Object.keys(packageModule.Collection), ["define"]);
  assert.deepEqual(Object.keys(packageModule.Icon), ["define"]);
  assert.ok(Object.isFrozen(packageModule.Collection));
  assert.ok(Object.isFrozen(packageModule.Icon));
  assert.ok(Object.isFrozen(packageModule.iconDirections));
  assert.ok(Object.isFrozen(packageModule.iconNodeKinds));
  assert.ok(Object.isFrozen(packageModule.iconPaintSchema));
  assert.ok(Object.isFrozen(packageModule.iconPaintSchema.keywords));
  assert.ok(Object.isFrozen(packageModule.iconPresentationEnumerations));
  assert.ok(Object.isFrozen(packageModule.iconPresentationEnumerations.fillRule));
  assert.ok(Object.isFrozen(packageModule.iconPresentationEnumerations.strokeLineCap));
  assert.ok(Object.isFrozen(packageModule.iconPresentationEnumerations.strokeLineJoin));
  assert.ok(Object.isFrozen(packageModule.iconPresentationOverrideOrder));
  assert.ok(Object.isFrozen(packageModule.iconRtlPolicies));
  assert.ok(Object.isFrozen(packageModule.iconTechnicalPresentation));
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
  assert.equal(manifest.sideEffects, false);
  assert.equal(manifest.dependencies, undefined);
  assert.equal(manifest.peerDependencies, undefined);
  assert.equal(manifest.optionalDependencies, undefined);
  assert.doesNotMatch(rootDeclaration, /runtime|internal|mutable/iu);
});

test("emits host-independent declarations without development dependency references", async () => {
  const declarations = await collectFiles(resolve(packageRoot, "dist"), ".d.ts");

  assert.ok(declarations.length > 0);

  for (const declaration of declarations) {
    const source = await readFile(declaration, "utf8");

    assert.doesNotMatch(source, /\/\/\/\s*<reference/iu);
    assert.doesNotMatch(
      source,
      /\b(?:from|import)\s*(?:\(\s*)?["'](?!\.)[^"']+["']/gu,
    );
    assert.doesNotMatch(
      source,
      /\b(?:Node|HTMLElement|SVGElement|Document|Window|Buffer|NodeJS)\b/gu,
    );
    assert.doesNotMatch(source, /\b(?:tsx|typescript|@types\/node)\b/gu);
  }
});

test("emits side-effect-free ESM modules without CommonJS compatibility output", async () => {
  const modules = await collectFiles(resolve(packageRoot, "dist"), ".js");

  assert.ok(modules.length > 0);

  for (const module of modules) {
    const source = await readFile(module, "utf8");

    assert.doesNotMatch(source, /\brequire\s*\(/gu);
    assert.doesNotMatch(source, /\bmodule\.exports\b/gu);
  }
});
