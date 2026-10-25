import assert from "node:assert/strict";
import { copyFile, cp, mkdir, mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

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
      variant: "outline",
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
  const packageModule = await import("@luscious-garden/aster-core");

  assert.deepEqual(Object.keys(packageModule).sort(), [
    "Collection",
    "Icon",
    "IconDefinitionError",
    "iconDirections",
    "iconNodeKinds",
    "iconPaintSchema",
    "iconPathCommandKinds",
    "iconPresentationOverrideOrder",
    "iconRtlPolicies",
    "iconTechnicalPresentation",
  ]);
  assert.deepEqual(Object.keys(packageModule.Collection), ["define"]);
  assert.deepEqual(Object.keys(packageModule.Icon), ["define", "variantPropertyName"]);
  assert.equal(Object.hasOwn(packageModule.Icon, "variantProperty"), false);
  assert.equal(packageModule.Icon.variantPropertyName("filled-dotted"), "filledDotted");
  assert.ok(Object.isFrozen(packageModule.Collection));
  assert.ok(Object.isFrozen(packageModule.Icon));
  assert.ok(Object.isFrozen(packageModule.iconDirections));
  assert.ok(Object.isFrozen(packageModule.iconNodeKinds));
  assert.deepEqual(packageModule.iconPathCommandKinds, {
    move: "move",
    line: "line",
    cubicBezier: "cubic-bezier",
    quadraticBezier: "quadratic-bezier",
    arc: "arc",
    close: "close",
  });
  assert.ok(Object.isFrozen(packageModule.iconPathCommandKinds));
  assert.ok(Object.isFrozen(packageModule.iconPaintSchema));
  assert.ok(Object.isFrozen(packageModule.iconPaintSchema.keywords));
  assert.ok(Object.isFrozen(packageModule.IconDefinitionError));
  assert.ok(Object.isFrozen(packageModule.iconPresentationOverrideOrder));
  assert.ok(Object.isFrozen(packageModule.iconRtlPolicies));
  assert.ok(Object.isFrozen(packageModule.iconTechnicalPresentation));
});

test("exposes deterministic definition failure discrimination", async () => {
  const { Icon, IconDefinitionError } = await import("@luscious-garden/aster-core");

  assert.equal(IconDefinitionError.code, "ASTER-CORE-001");
  assert.throws(
    () => Icon.define({}),
    (error) => {
      assert.ok(error instanceof IconDefinitionError);
      assert.equal(error.code, IconDefinitionError.code);
      assert.equal(error.path, "definition.identity");
      return true;
    },
  );
});

test("constructs isolated definitions without a catalogue registry", async () => {
  const { Icon } = await import("@luscious-garden/aster-core");
  const first = Icon.define(createDefinitionInput());
  const second = Icon.define(createDefinitionInput());

  assert.notEqual(first, second);
  assert.deepEqual(first, second);
  assert.ok(Object.isFrozen(first));
});

test("keeps recognition local while accepting a genuinely independent Core copy", async () => {
  const local = await import("@luscious-garden/aster-core");
  const temporaryRoot = await mkdtemp(resolve(tmpdir(), "aster-core-recognition-"));

  try {
    const copiedRoot = resolve(temporaryRoot, "node_modules/@luscious-garden/aster-core");
    await mkdir(copiedRoot, { recursive: true });
    await copyFile(resolve(packageRoot, "package.json"), resolve(copiedRoot, "package.json"));
    await cp(resolve(packageRoot, "dist"), resolve(copiedRoot, "dist"), { recursive: true });
    const manifest = JSON.parse(await readFile(resolve(copiedRoot, "package.json"), "utf8"));
    const foreign = await import(pathToFileURL(resolve(copiedRoot, manifest.exports["."].import)).href);

    assert.notEqual(local.Icon, foreign.Icon);
    assert.notEqual(local.IconDefinitionError, foreign.IconDefinitionError);
    const foreignDefinition = foreign.Icon.define(createDefinitionInput());
    assert.equal(foreign.Icon.define(foreignDefinition), foreignDefinition);

    const accepted = local.Icon.define(foreignDefinition);
    assert.notEqual(accepted, foreignDefinition);
    assert.deepEqual(accepted, foreignDefinition);
    assert.equal(local.Icon.define(accepted), accepted);
    assert.notEqual(local.Icon.define(foreignDefinition), accepted);
    assert.notEqual(foreign.Icon.define(accepted), accepted);

    const retained = local.Collection.define({
      identity: { name: "foreign-member" },
      icons: { selected: { outline: foreignDefinition } },
      metadata: { displayName: "Foreign Member" },
    });
    assert.equal(retained.icons.selected.outline, foreignDefinition);
    assert.equal(retained.members[0], foreignDefinition);
    assert.notEqual(local.Icon.define(retained.members[0]), foreignDefinition);
    const revalidated = local.Collection.define(retained);
    assert.notEqual(revalidated, retained);
    assert.equal(revalidated.members[0], foreignDefinition);

    const decoded = JSON.parse(JSON.stringify(foreignDefinition));
    const recovered = local.Icon.define(decoded);
    assert.notEqual(recovered, decoded);
    assert.deepEqual(recovered, accepted);
    assert.equal(local.Icon.define(recovered), recovered);

    const invalid = Object.freeze({
      ...foreignDefinition,
      viewBox: Object.freeze({ ...foreignDefinition.viewBox, width: 0 }),
    });
    assert.throws(() => local.Icon.define(invalid), local.IconDefinitionError);
    assert.throws(() => local.Collection.define({
      identity: { name: "invalid-foreign-member" },
      icons: { selected: { outline: invalid } },
      metadata: { displayName: "Invalid Foreign Member" },
    }), local.IconDefinitionError);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("rejects implementation subpaths through package exports", async () => {
  await assert.rejects(
    import("@luscious-garden/aster-core/definition/runtime/icon-definition.factory.js"),
    (error) => error?.code === "ERR_PACKAGE_PATH_NOT_EXPORTED",
  );
  await assert.rejects(
    import("@luscious-garden/aster-core/shared/runtime/icon-definition.error.js"),
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
