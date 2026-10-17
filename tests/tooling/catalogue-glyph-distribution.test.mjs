import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import process from "node:process";
import test, { after, before } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
import { Icon } from "@luscious-garden/aster-core";

import { synchroniseIconsCatalogue } from "../../tooling/catalogue/synchronise-icons-catalogue.mjs";

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const variants = [
  "outline",
  "filled",
  "filled-dotted",
  "constructor",
  "index",
  "to-string",
  "2-tone",
  "01",
  "10",
  "2",
  "4294967294",
  "4294967295",
];
let root;

function symbol(variant) {
  return `Camera${variant
    .split("-")
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join("")}`;
}

async function writeSource(path, source) {
  const target = resolve(root, "src", path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `${source}\n`, "utf8");
}

function execute(arguments_) {
  const result = spawnSync(process.execPath, arguments_, {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(result.error, undefined);
  assert.equal(result.status, 0, `${result.stdout}${result.stderr}`);
  assert.equal(result.stderr, "");

  return result.stdout;
}

before(async () => {
  root = await mkdtemp(resolve(tmpdir(), "aster-glyph-distribution-"));
  const core = resolve(root, "node_modules/@luscious-garden/aster-core");
  await mkdir(core, { recursive: true });
  await cp(
    resolve(workspaceRoot, "packages/core/dist"),
    resolve(core, "dist"),
    { recursive: true },
  );
  await cp(
    resolve(workspaceRoot, "packages/core/package.json"),
    resolve(core, "package.json"),
  );
  const packageJson = JSON.parse(
    await readFile(
      resolve(workspaceRoot, "packages/icons/package.json"),
      "utf8",
    ),
  );
  await writeFile(
    resolve(root, "package.json"),
    JSON.stringify({
      name: packageJson.name,
      type: "module",
      exports: packageJson.exports,
    }),
    "utf8",
  );

  for (const variant of variants) {
    await writeSource(
      `glyphs/c/camera/camera-${variant}.icon.ts`,
      [
        'import { Icon } from "@luscious-garden/aster-core";',
        `export const ${symbol(variant)} = Icon.define({`,
        `  identity: { namespace: "fixture", name: "camera", variant: "${variant}" },`,
        "  viewBox: { minX: 0, minY: 0, width: 24, height: 24 },",
        '  nodes: [{ kind: "circle", cx: 12, cy: 12, radius: 4 }],',
        '  metadata: { displayName: "Camera", rtl: "preserve", deprecated: false, presentation: { defaults: {fill: "currentColor"}, overrides: [] } },',
        "});",
      ].join("\n"),
    );
  }
  await writeSource(
    "glyphs/b/bell/bell-outline.icon.ts",
    [
      'import { Icon } from "@luscious-garden/aster-core";',
      "export const BellOutline = Icon.define({",
      '  identity: { name: "bell", variant: "outline" },',
      "  viewBox: { minX: 0, minY: 0, width: 24, height: 24 },",
      '  nodes: [{ kind: "circle", cx: 12, cy: 12, radius: 4 }],',
      '  metadata: { displayName: "Bell", rtl: "preserve", deprecated: false, presentation: { defaults: {fill: "currentColor"}, overrides: [] } },',
      "});",
    ].join("\n"),
  );
  await writeSource(
    "collections/s/selected/selected.collection.ts",
    [
      'import { Collection } from "@luscious-garden/aster-core";',
      'import { CameraOutline } from "../../../glyphs/c/camera/camera-outline.icon.js";',
      "export const Selected = Collection.define({",
      '  identity: { name: "selected" },',
      "  icons: { camera: { outline: CameraOutline } },",
      '  metadata: { displayName: "Selected" },',
      "});",
    ].join("\n"),
  );
  for (const feature of ["manifest", "dynamic"]) {
    await cp(
      resolve(workspaceRoot, `packages/icons/src/${feature}/contracts`),
      resolve(root, `src/${feature}/contracts`),
      { recursive: true },
    );
    await writeSource(
      `${feature}/index.ts`,
      `export * from "../generated/${feature}/index.js";`,
    );
  }
  await synchroniseIconsCatalogue(root);
  await writeSource(
    "consumer.ts",
    [
      'import type { IconDefinition, IconVariantMap } from "@luscious-garden/aster-core";',
      'import { CameraVariants } from "@luscious-garden/aster-icons/camera";',
      'import { CameraOutline } from "@luscious-garden/aster-icons/camera/outline";',
      'import { CameraIndex } from "@luscious-garden/aster-icons/camera/index";',
      "// @ts-expect-error The glyph has no undistributed treatment entry.",
      'import { BellFilled } from "@luscious-garden/aster-icons/bell/filled";',
      "// @ts-expect-error Missing glyphs have no generated entry.",
      'import { MissingVariants } from "@luscious-garden/aster-icons/missing";',
      "// @ts-expect-error The dictionary entry does not re-export individual definitions.",
      'import { CameraFilled } from "@luscious-garden/aster-icons/camera";',
      "// @ts-expect-error The obsolete unsuffixed definition is absent.",
      'import { Camera } from "@luscious-garden/aster-icons/camera";',
      "const dictionary: IconVariantMap = CameraVariants;",
      "const definition: IconDefinition = CameraVariants.outline;",
      "const compound: IconDefinition = CameraVariants.filledDotted;",
      'const digit: IconDefinition = CameraVariants["2Tone"];',
      "const ownConstructor: IconDefinition = CameraVariants.constructor;",
      "const ownToString: IconDefinition = CameraVariants.toString;",
      "// @ts-expect-error A glyph dictionary is not a concrete definition.",
      "const invalidDefinition: IconDefinition = CameraVariants;",
      "// @ts-expect-error Exact dictionaries have no implicit default.",
      "CameraVariants.default;",
      "// @ts-expect-error Undistributed treatments have no generated property.",
      "CameraVariants.stippled;",
      "// @ts-expect-error The dictionary is readonly.",
      "CameraVariants.outline = CameraOutline;",
      "void [dictionary, definition, compound, digit, ownConstructor, ownToString, invalidDefinition, Camera, CameraFilled, CameraIndex, BellFilled, MissingVariants];",
    ].join("\n"),
  );
  const paths = await readdir(resolve(root, "src"), { recursive: true });
  const program = ts.createProgram(
    paths
      .filter((path) => path.endsWith(".ts"))
      .map((path) => resolve(root, "src", path)),
    {
      rootDir: resolve(root, "src"),
      outDir: resolve(root, "dist"),
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      strict: true,
      skipLibCheck: true,
      declaration: true,
    },
  );
  const diagnostics = ts.getPreEmitDiagnostics(program);
  assert.equal(
    diagnostics.length,
    0,
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: () => root,
      getCanonicalFileName: (file) => file,
      getNewLine: () => "\n",
    }),
  );
  assert.equal(program.emit().emitSkipped, false);
});

after(async () => {
  if (root !== undefined) {
    await rm(root, { recursive: true, force: true });
  }
});

test("isolates native ESM treatment, glyph and metadata evaluation in a generated multi-treatment package", () => {
  for (const [path, expectedExports, expectedModules] of [
    [
      "generated/facades/icons/camera/outline.js",
      ["CameraOutline"],
      [
        "generated/facades/icons/camera/outline.js",
        "glyphs/c/camera/camera-outline.icon.js",
      ],
    ],
    [
      "generated/facades/glyphs/camera.js",
      ["CameraVariants"],
      [
        "generated/facades/glyphs/camera.js",
        ...variants.map(
          (variant) => `glyphs/c/camera/camera-${variant}.icon.js`,
        ),
      ],
    ],
    [
      "generated/facades/glyphs/bell.js",
      ["BellVariants"],
      ["generated/facades/glyphs/bell.js", "glyphs/b/bell/bell-outline.icon.js"],
    ],
    [
      "manifest/index.js",
      ["AsterCollectionManifest", "AsterIconManifest"],
      ["manifest/index.js", "generated/manifest/index.js"],
    ],
    [
      "dynamic/index.js",
      ["AsterCollectionLoaders", "AsterIconLoaders"],
      ["dynamic/index.js", "generated/dynamic/index.js"],
    ],
  ]) {
    const evidence = JSON.parse(
      execute([
        resolve(
          workspaceRoot,
          "tooling/performance/shared/module-import-probe.mjs",
        ),
        pathToFileURL(resolve(root, "dist", path)).href,
        root,
      ]),
    );
    assert.deepEqual(evidence.exports, expectedExports);
    assert.deepEqual(evidence.evaluatedModules, expectedModules.sort());
  }
});

test("preserves fixed routes and rejects missing glyphs or treatments without index fallbacks", () => {
  const output = execute([
    "--input-type=module",
    "--eval",
    [
      'import assert from "node:assert/strict";',
      'import { CameraVariants } from "@luscious-garden/aster-icons/camera";',
      'import { CameraIndex } from "@luscious-garden/aster-icons/camera/index";',
      'import { AsterIconManifest } from "@luscious-garden/aster-icons/manifest";',
      'import { AsterIconLoaders } from "@luscious-garden/aster-icons/dynamic";',
      'import { Selected } from "@luscious-garden/aster-icons/collections/selected";',
      "assert.equal(CameraIndex, CameraVariants.index);",
      "assert.equal(Selected.members[0], CameraVariants.outline);",
      'assert.ok(AsterIconManifest.some(({key}) => key === "fixture/camera@index"));',
      'assert.equal(await AsterIconLoaders["fixture/camera@index"](), CameraIndex);',
      'for (const subpath of ["missing", "camera/missing", "bell/filled", "camera/outline/extra", "camera/index/index"]) {',
      '  await assert.rejects(import(`@luscious-garden/aster-icons/${subpath}`), {code: "ERR_MODULE_NOT_FOUND"});',
      "}",
      'for (const subpath of ["", "/collections"]) {',
      '  await assert.rejects(import(`@luscious-garden/aster-icons${subpath}`), {code: "ERR_PACKAGE_PATH_NOT_EXPORTED"});',
      "}",
    ].join("\n"),
  ]);
  assert.equal(output, "");
});

test("retains exact frozen own-data glyph keys and canonical leaf identity through generated public routes", () => {
  const expectedKeys = Object.keys(
    Object.fromEntries(
      [...variants]
        .sort()
        .map((variant) => [Icon.variantPropertyName(variant), true]),
    ),
  );
  const output = execute([
    "--input-type=module",
    "--eval",
    [
      'import assert from "node:assert/strict";',
      'import { CameraVariants } from "@luscious-garden/aster-icons/camera";',
      'import { BellVariants } from "@luscious-garden/aster-icons/bell";',
      'import { Selected } from "@luscious-garden/aster-icons/collections/selected";',
      'import { AsterIconLoaders, AsterCollectionLoaders } from "@luscious-garden/aster-icons/dynamic";',
      'import { AsterIconManifest } from "@luscious-garden/aster-icons/manifest";',
      `assert.deepEqual(Object.keys(CameraVariants), ${JSON.stringify(expectedKeys)});`,
      'assert.deepEqual(Object.keys(BellVariants), ["outline"]);',
      "for (const dictionary of [CameraVariants, BellVariants]) {",
      "  assert.equal(Object.getPrototypeOf(dictionary), null);",
      "  assert.ok(Object.isFrozen(dictionary));",
      "  for (const key of Object.keys(dictionary)) {",
      "    const descriptor = Object.getOwnPropertyDescriptor(dictionary, key);",
      "    assert.ok(descriptor.enumerable && !descriptor.writable && !descriptor.configurable);",
      "    assert.equal(descriptor.get, undefined);",
      "    assert.ok(Object.isFrozen(descriptor.value));",
      "  }",
      '  for (const key of [...Object.getOwnPropertyNames(Object.prototype), "absent", "default", "stippled"]) {',
      "    if (Object.hasOwn(dictionary, key)) continue;",
      "    assert.equal(dictionary[key], undefined);",
      "    assert.equal(key in dictionary, false);",
      "  }",
      "}",
      "for (const entry of AsterIconManifest) {",
      "  const {name, variant} = entry.identity;",
      "  const direct = await import(`@luscious-garden/aster-icons/${name}/${variant}`);",
      "  assert.deepEqual(Object.keys(direct), [entry.symbol]);",
      '  const property = variant.split("-").map((part, index) => index === 0 ? part : part[0].toUpperCase() + part.slice(1)).join("");',
      '  const dictionary = name === "camera" ? CameraVariants : BellVariants;',
      "  assert.equal(dictionary[property], direct[entry.symbol]);",
      "  assert.equal(await AsterIconLoaders[entry.key](), direct[entry.symbol]);",
      "}",
      "assert.equal(Selected.icons.camera.outline, CameraVariants.outline);",
      'assert.deepEqual(Object.keys(Selected.icons.camera), ["outline"]);',
      "assert.equal(Selected.members[0], CameraVariants.outline);",
      "assert.equal(await AsterCollectionLoaders.selected(), Selected);",
      'assert.equal(AsterIconLoaders["fixture/camera"], undefined);',
      'assert.equal(AsterIconLoaders["fixture/camera@stippled"]?.(), undefined);',
      'await assert.rejects(import("@luscious-garden/aster-icons/camera/stippled"), {code: "ERR_MODULE_NOT_FOUND"});',
      'for (const name of ["Camera", "CameraOutline"]) {',
      '  const { spawnSync } = await import("node:child_process");',
      '  const result = spawnSync(process.execPath, ["--input-type=module", "--eval", `import { ${name} } from "@luscious-garden/aster-icons/camera";`], {encoding:"utf8"});',
      "  assert.equal(result.error, undefined);",
      "  assert.equal(result.status, 1);",
      "  assert.match(result.stderr, /does not provide an export named/);",
      "}",
    ].join("\n"),
  ]);
  assert.equal(output, "");
});
