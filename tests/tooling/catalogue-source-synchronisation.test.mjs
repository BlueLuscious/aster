import assert from "node:assert/strict";
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import { Collection, Icon } from "@luscious-garden/aster-core";

import { NodeCatalogueSourceFileSystem } from "../../tooling/catalogue/runtime/node-catalogue-source-file-system.mjs";
import { catalogueSourceGeneration } from "../../tooling/catalogue/constants/catalogue-source-generation.constant.mjs";
import { CatalogueSourceLayoutNormaliser } from "../../tooling/catalogue/runtime/catalogue-source-layout.normaliser.mjs";
import { CatalogueSourceSynchroniser } from "../../tooling/catalogue/runtime/catalogue-source.synchroniser.mjs";
import { synchroniseIconsCatalogue } from "../../tooling/catalogue/synchronise-icons-catalogue.mjs";
import { RepositoryPathResolver } from "../../tooling/shared/runtime/repository-path.resolver.mjs";

const generatedOutputPaths = Object.freeze({
  manifest: "src/generated/manifest/index.ts",
  dynamic: "src/generated/dynamic/index.ts",
  alphaIconFacade: "src/generated/facades/icons/alpha-icon/outline.ts",
  zetaFacade: "src/generated/facades/icons/zeta/outline.ts",
  alphaIconGlyph: "src/generated/facades/glyphs/alpha-icon.ts",
  zetaGlyph: "src/generated/facades/glyphs/zeta.ts",
  sampleCollectionFacade:
    "src/generated/facades/collections/sample.ts",
});

const completeGeneratedOutputPaths = Object.freeze(
  Object.values(generatedOutputPaths),
);

test("isolates injected source-family configuration before synchronisation", async () => {
  const root = resolve("fixture");
  const family = {
    ...catalogueSourceGeneration.families[0],
    excludedDirectories: ["original"],
  };
  const families = [family];
  const inspected = [];
  const output = (relativePath) => Object.freeze({
    path: resolve(root, relativePath),
    relativePath,
    content: "",
  });
  const synchroniser = new CatalogueSourceSynchroniser(
    { async readTextIfPresent() { return undefined; } },
    {
      reset() {},
      async inspect(_packageRoot, candidate) {
        inspected.push(candidate);
        return Object.freeze([]);
      },
    },
    { plan() { return Object.freeze([]); } },
    { plan() { return output("manifest"); } },
    { plan() { return output("dynamic"); } },
    new RepositoryPathResolver(),
    { validate() {} },
    { async collect() { return Object.freeze([]); } },
    families,
    catalogueSourceGeneration.facadeRoot,
    { async plan() { return undefined; } },
  );

  families.length = 0;
  family.sourceDirectory = "changed";
  family.excludedDirectories.push("changed");
  await synchroniser.synchronise(root, true);

  assert.equal(inspected.length, 1);
  assert.equal(inspected[0].sourceDirectory, "src/glyphs");
  assert.deepEqual(inspected[0].excludedDirectories, ["original"]);
  assert.ok(Object.isFrozen(inspected[0]));
  assert.ok(Object.isFrozen(inspected[0].excludedDirectories));
});

function pascalCase(slug) {
  return slug
    .split("-")
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join("");
}

test("rejects non-canonical authored namespaces before replacing any generated output", async () => {
  const root = await createPackageFixture();
  try {
    await synchroniseIconsCatalogue(root);
    const expected = await readGeneratedOutputs(root);
    for (const relativePath of [
      "src/glyphs/a/alpha-icon/alpha-icon-outline.icon.ts",
      "src/collections/s/sample/sample.collection.ts",
    ]) {
      const sourcePath = resolve(root, relativePath);
      const original = await readFile(sourcePath, "utf8");
      for (const namespace of ["", " aster ", "UpperCase", "two/parts"]) {
        await writeFile(sourcePath, original.replace(
          "identity: {", `identity: { namespace: ${JSON.stringify(namespace)},`,
        ), "utf8");
        await assert.rejects(synchroniseIconsCatalogue(root), /canonical namespace slug/u);
        assert.deepEqual(await readGeneratedOutputs(root), expected);
      }
      await writeFile(sourcePath, original, "utf8");
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

function iconSource(name, variant = "outline") {
  const symbol = `${pascalCase(name)}${pascalCase(variant)}`;

  return [
    'import { Icon } from "@luscious-garden/aster-core";',
    "",
    `export const ${symbol} = Icon.define({`,
    `  identity: { name: "${name}", variant: "${variant}" },`,
    `  metadata: { displayName: "${pascalCase(name)}", tags: ["${name}"], rtl: "preserve", deprecated: false },`,
    "});",
    "",
  ].join("\n");
}

function collectionSourceWithIcons(name, imports = [], icons = []) {
  return [
    'import { Collection } from "@luscious-garden/aster-core";',
    ...imports,
    "",
    `export const ${pascalCase(name)} = Collection.define({`,
    `  identity: { name: "${name}" },`,
    "  icons: {",
    ...icons,
    "  },",
    `  metadata: { displayName: "${pascalCase(name)}" },`,
    "});\n",
  ].join("\n");
}

function collectionSource(name, imports = [], members = []) {
  return collectionSourceWithIcons(
    name,
    imports,
    members.map(({ alias, symbol }) => `    ${alias}: { ${symbol.endsWith("Stippled") ? "stippled" : "outline"}: ${symbol} },`),
  );
}

async function createPackageFixture() {
  const root = await mkdtemp(join(tmpdir(), "aster-catalogue-source-"));
  const alphaPath = resolve(
    root,
    "src/glyphs/a/alpha-icon/alpha-icon-outline.icon.ts",
  );
  const zetaPath = resolve(root, "src/glyphs/z/zeta/zeta-outline.icon.ts");
  const samplePath = resolve(
    root,
    "src/collections/s/sample/sample.collection.ts",
  );
  const authorshipPath = resolve(
    root,
    "src/authoring/constants/fixture-authorship.constant.ts",
  );

  await mkdir(dirname(alphaPath), { recursive: true });
  await mkdir(dirname(zetaPath), { recursive: true });
  await mkdir(dirname(samplePath), { recursive: true });
  await mkdir(dirname(authorshipPath), { recursive: true });
  await writeFile(
    alphaPath,
    iconSource("alpha-icon"),
    "utf8",
  );
  await writeFile(
    zetaPath,
    [
      'import { Icon } from "@luscious-garden/aster-core";',
      'import { fixtureAuthorship } from "../../../authoring/constants/fixture-authorship.constant.js";',
      "",
      "export const ZetaOutline = Icon.define({",
      '  identity: { namespace: fixtureAuthorship.namespace, name: "zeta", variant: "outline" },',
      '  metadata: { displayName: "ZetaOutline", tags: ["zeta"], rtl: "preserve", licence: fixtureAuthorship.licence, deprecated: false },',
      "});",
      "",
    ].join("\n"),
    "utf8",
  );
  await writeFile(
    authorshipPath,
    'export const fixtureAuthorship = Object.freeze({ namespace: "fixture", licence: "ISC" });\n',
    "utf8",
  );
  await writeFile(
    samplePath,
    collectionSource(
      "sample",
      [
        'import { AlphaIconOutline } from "../../../glyphs/a/alpha-icon/alpha-icon-outline.icon.js";',
      ],
      [{ alias: "alphaIcon", symbol: "AlphaIconOutline" }],
    ),
    "utf8",
  );

  await writeFile(resolve(root, "package.json"), JSON.stringify({
    private: true,
    exports: {
      "./manual": "./manual.js",
      "./*/outline": { types: "./dist/generated/facades/icons/*/outline.d.ts", import: "./dist/generated/facades/icons/*/outline.js" },
      "./*": { types: "./dist/generated/facades/glyphs/*.d.ts", import: "./dist/generated/facades/glyphs/*.js" },
    },
  }, null, 2) + "\n", "utf8");
  return root;
}

async function readGeneratedOutputs(root) {
  return Object.freeze(
    Object.fromEntries(
      await Promise.all(
        completeGeneratedOutputPaths.map(async (path) => [
          path,
          await readFile(resolve(root, path), "utf8"),
        ]),
      ),
    ),
  );
}

test("preserves runtime treatment enumeration in statically derived flat members", async () => {
  const root = await createPackageFixture();
  try {
    const variants = ["10", "2", "01", "2tone", "4294967295", "4294967294", "constructor", "to-string", "filled-dotted"];
    const imports = [];
    const properties = [];
    const leaves = [];
    for (const variant of variants) {
      const symbol = `AlphaIcon${pascalCase(variant)}`;
      await writeFile(resolve(root, `src/glyphs/a/alpha-icon/alpha-icon-${variant}.icon.ts`), iconSource("alpha-icon", variant), "utf8");
      imports.push(`import { ${symbol} } from "../../../glyphs/a/alpha-icon/alpha-icon-${variant}.icon.js";`);
      const property = Icon.variantPropertyName(variant);
      properties.push(`${JSON.stringify(property)}: ${symbol}`);
      leaves.push([property, Icon.define({
        identity: { name: "alpha-icon", variant },
        viewBox: { minX: 0, minY: 0, width: 24, height: 24 },
        nodes: [{ kind: "circle", cx: 12, cy: 12, radius: 4 }],
        metadata: { displayName: "Fixture", rtl: "preserve", deprecated: false, presentation: { defaults: {}, overrides: [] } },
      })]);
    }
    await writeFile(resolve(root, "src/collections/s/sample/sample.collection.ts"),
      collectionSourceWithIcons("sample", imports, [`alphaIcon: { ${properties.join(", ")} },`]), "utf8");
    const runtime = Collection.define({
      identity: { name: "sample" }, icons: { alphaIcon: Object.fromEntries(leaves) }, metadata: { displayName: "Sample" },
    });
    await synchroniseIconsCatalogue(root);
    const manifest = await readFile(resolve(root, generatedOutputPaths.manifest), "utf8");
    const expected = runtime.members.map(leaf => `${leaf.identity.name}@${leaf.identity.variant}`);
    const emitted = ts.transpileModule(manifest, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
    }).outputText;
    const generated = await import(`data:text/javascript;base64,${Buffer.from(emitted).toString("base64")}`);
    assert.deepEqual(generated.AsterCollectionManifest[0].members, expected);
    assert.deepEqual(runtime.members.map(leaf => leaf.identity.variant),
      ["2", "10", "4294967294", "01", "2tone", "4294967295", "constructor", "to-string", "filled-dotted"]);
    assert.deepEqual((await synchroniseIconsCatalogue(root, true)).changedPaths, []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects invalid nested selections before changing any catalogue output", async () => {
  const root = await createPackageFixture();
  try {
    const directory = resolve(root, "src/glyphs/a/alpha-icon");
    for (const variant of ["filled", "tone-1"]) {
      await writeFile(resolve(directory, `alpha-icon-${variant}.icon.ts`), iconSource("alpha-icon", variant), "utf8");
    }
    await writeFile(resolve(root, "src/glyphs/z/zeta/zeta-filled.icon.ts"),
      iconSource("zeta", "filled").replace("identity: { name:", 'identity: { namespace: "fixture", name:'), "utf8");
    await synchroniseIconsCatalogue(root);
    const before = await readGeneratedOutputs(root);
    const path = resolve(root, "src/collections/s/sample/sample.collection.ts");
    const imports = [
      'import { AlphaIconOutline } from "../../../glyphs/a/alpha-icon/alpha-icon-outline.icon.js";',
      'import { AlphaIconFilled } from "../../../glyphs/a/alpha-icon/alpha-icon-filled.icon.js";',
      'import { AlphaIconTone1 } from "../../../glyphs/a/alpha-icon/alpha-icon-tone-1.icon.js";',
      'import { AlphaIconTone1 as OtherTone } from "../../../glyphs/a/alpha-icon/alpha-icon-tone-1.icon.js";',
      'import { ZetaOutline } from "../../../glyphs/z/zeta/zeta-outline.icon.js";',
      'import { ZetaFilled } from "../../../glyphs/z/zeta/zeta-filled.icon.js";',
    ];
    for (const [selection, pattern] of [
      ["alphaIcon: {}", /empty variant group/u],
      ["alphaIcon: AlphaIconOutline", /variant object literals/u],
      ["alphaIcon: { filled: AlphaIconOutline }", /canonical variant property/u],
      ["alphaIcon: { outline: AlphaIconOutline, filled: ZetaOutline }", /canonical variant property|same glyph/u],
      ["alphaIcon: { outline: AlphaIconOutline, filled: ZetaFilled }", /same glyph/u],
      ["alphaIcon: { outline: AlphaIconOutline }, other: { outline: AlphaIconOutline }", /duplicate collection member/u],
      ["alphaIcon: { tone1: AlphaIconTone1, tone1: OtherTone }", /duplicate variant property/u],
      ["alphaIcon: { [\"outline\"]: AlphaIconOutline }", /direct named properties/u],
      ["alphaIcon: { 2: AlphaIconOutline }", /direct named properties/u],
      ["alphaIcon: { AlphaIconOutline }", /direct named properties/u],
      ["alphaIcon: { ...AlphaIconOutline }", /direct named properties/u],
      ["alphaIcon: { get outline() { return AlphaIconOutline; } }", /direct named properties/u],
      ["alphaIcon: { set outline(value) {} }", /direct named properties/u],
      ["alphaIcon: { outline: Icon.define({}) }", /direct named properties/u],
      ["alphaIcon: { outline: { leaf: AlphaIconOutline } }", /direct named properties/u],
    ]) {
      await writeFile(path, collectionSourceWithIcons("sample", imports, [selection]), "utf8");
      await assert.rejects(synchroniseIconsCatalogue(root), pattern);
      assert.deepEqual(await readGeneratedOutputs(root), before);
    }
    await writeFile(path, collectionSourceWithIcons("sample", imports,
      ["constructor: { outline: AlphaIconOutline }, toString: { filled: AlphaIconFilled }"]), "utf8");
    await synchroniseIconsCatalogue(root);
    await writeFile(path, collectionSourceWithIcons("sample"), "utf8");
    await synchroniseIconsCatalogue(root);
    assert.match(await readFile(resolve(root, generatedOutputPaths.manifest), "utf8"), /members: Object\.freeze\(\[\]\)/u);
    await writeFile(path, collectionSource("sample", [imports[0]], [{ alias: "alphaIcon", symbol: "AlphaIconOutline" }]), "utf8");
    await synchroniseIconsCatalogue(root);
    assert.deepEqual(await readGeneratedOutputs(root), before);
    // Equal property names do not hide a distinct glyph or namespace behind the group alias.
    await writeFile(resolve(directory, "alpha-icon-filled.icon.ts"),
      iconSource("alpha-icon", "filled").replace("identity: { name:", 'identity: { namespace: "other", name:'), "utf8");
    await writeFile(path, collectionSourceWithIcons("sample", imports,
      ["alphaIcon: { outline: AlphaIconOutline, filled: AlphaIconFilled }"]), "utf8");
    await assert.rejects(synchroniseIconsCatalogue(root), /same glyph/u);
    assert.deepEqual(await readGeneratedOutputs(root), before);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("derives suffix-free definition symbols from canonical source names", () => {
  const layouts = new CatalogueSourceLayoutNormaliser();
  const [icons, collections] = catalogueSourceGeneration.families;

  for (const { family, path, symbol } of [
    { family: icons, path: "a/arrow-left/arrow-left-outline.icon.ts", symbol: "ArrowLeftOutline" },
    { family: icons, path: "c/camera-retro/camera-retro-filled.icon.ts", symbol: "CameraRetroFilled" },
    { family: collections, path: "s/sample/sample.collection.ts", symbol: "Sample" },
    { family: collections, path: "s/sample-collection/sample-collection.collection.ts", symbol: "SampleCollection" },
  ]) {
    assert.equal(layouts.normalise(path, family).exportName, symbol);
    assert.equal(Object.hasOwn(family, "symbolSuffix"), false);
  }
});

test("rejects obsolete collection exports and unsupported factory imports before writing", async () => {
  const root = await createPackageFixture();

  try {
    await synchroniseIconsCatalogue(root);
    const expected = await readGeneratedOutputs(root);
    const collectionPath = resolve(root, "src/collections/s/sample/sample.collection.ts");
    const source = await readFile(collectionPath, "utf8");

    for (const { invalidSource, pattern } of [
      {
        invalidSource: source.replace("export const Sample =", "export const SampleCollection ="),
        pattern: /must export exactly one constant named Sample\./u,
      },
      {
        invalidSource: source
          .replace("import { Collection }", "import { Collection as CoreCollection }")
          .replace("= Collection.define(", "= CoreCollection.define("),
        pattern: /must initialise Collection\.define/u,
      },
      {
        invalidSource: source.replace("@luscious-garden/aster-core", "not-aster-core"),
        pattern: /must import Collection from @luscious-garden\/aster-core/u,
      },
    ]) {
      await writeFile(collectionPath, invalidSource, "utf8");
      await assert.rejects(synchroniseIconsCatalogue(root), pattern);
      assert.deepEqual(await readGeneratedOutputs(root), expected);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("reports every absent output without writing in check-only mode", async () => {
  const root = await createPackageFixture();

  try {
    const result = await synchroniseIconsCatalogue(root, true);

    assert.deepEqual(result.changedPaths, completeGeneratedOutputPaths);
    assert.equal(result.outputCount, completeGeneratedOutputPaths.length);

    for (const path of completeGeneratedOutputPaths) {
      await assert.rejects(readFile(resolve(root, path), "utf8"));
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("migrates retired glyph paths while retaining individual paths and unrelated files", async () => {
  const root = await createPackageFixture();
  const retired = [
    "src/generated/facades/icons/alpha-icon.ts",
    "src/generated/facades/icons/zeta.ts",
  ];

  try {
    for (const path of retired) {
      await mkdir(dirname(resolve(root, path)), { recursive: true });
      await writeFile(resolve(root, path), "retired facade\n", "utf8");
    }
    const retainedPath = resolve(root, "src/generated/retained.ts");
    await writeFile(retainedPath, "unowned\n", "utf8");
    const packagePath = resolve(root, "package.json");
    const manifest = await readFile(packagePath, "utf8");

    const drift = await synchroniseIconsCatalogue(root, true);
    assert.deepEqual(drift.changedPaths, [...completeGeneratedOutputPaths, ...retired]);
    assert.equal(drift.outputCount, completeGeneratedOutputPaths.length);
    for (const path of retired) {
      assert.equal(await readFile(resolve(root, path), "utf8"), "retired facade\n");
    }
    for (const path of completeGeneratedOutputPaths) {
      await assert.rejects(readFile(resolve(root, path), "utf8"), { code: "ENOENT" });
    }

    assert.deepEqual(await synchroniseIconsCatalogue(root), drift);
    for (const path of retired) {
      await assert.rejects(readFile(resolve(root, path), "utf8"), { code: "ENOENT" });
    }
    assert.equal(await readFile(retainedPath, "utf8"), "unowned\n");
    assert.equal(await readFile(packagePath, "utf8"), manifest);
    assert.deepEqual((await synchroniseIconsCatalogue(root, true)).changedPaths, []);
    assert.deepEqual((await synchroniseIconsCatalogue(root)).changedPaths, []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("migrates a complete legacy dictionary tree and exports without changing leaf paths or bytes", async () => {
  const root = await createPackageFixture();
  try {
    await synchroniseIconsCatalogue(root);
    const expected = await readGeneratedOutputs(root);
    const dictionaries = [generatedOutputPaths.alphaIconGlyph, generatedOutputPaths.zetaGlyph];
    const retired = ["src/generated/facades/icons/alpha-icon.ts", "src/generated/facades/icons/zeta.ts"];
    for (const [index, path] of dictionaries.entries()) {
      await writeFile(resolve(root, retired[index]), expected[path], "utf8");
      await unlink(resolve(root, path));
    }
    const manifestPath = resolve(root, "package.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    delete manifest.exports["./*/outline"];
    manifest.exports["./*"] = { types: "./dist/generated/facades/icons/*.d.ts", import: "./dist/generated/facades/icons/*.js" };
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
    const snapshot = async () => {
      const paths = (await readdir(resolve(root, "src/generated"), {recursive:true})).filter((path) => path.endsWith(".ts")).sort();
      return Object.fromEntries(await Promise.all(paths.map(async (path) => [path, await readFile(resolve(root, "src/generated", path), "utf8")])));
    };
    const before = await snapshot();
    const beforeManifest = await readFile(manifestPath, "utf8");
    const drift = await synchroniseIconsCatalogue(root, true);
    assert.deepEqual(drift.changedPaths, [...dictionaries, ...retired, "package.json"]);
    assert.equal(drift.outputCount, completeGeneratedOutputPaths.length);
    assert.deepEqual(await snapshot(), before);
    assert.equal(await readFile(manifestPath, "utf8"), beforeManifest);
    assert.deepEqual(await synchroniseIconsCatalogue(root), drift);
    assert.deepEqual(await readGeneratedOutputs(root), expected);
    for (const path of retired) {
      await assert.rejects(readFile(resolve(root, path), "utf8"), {code:"ENOENT"});
    }
    assert.deepEqual((await synchroniseIconsCatalogue(root, true)).changedPaths, []);
    assert.deepEqual((await synchroniseIconsCatalogue(root)).changedPaths, []);
  } finally {
    await rm(root, {recursive:true,force:true});
  }
});

test("keeps the internal glyph facade folder distinct from a glyph named glyphs", async () => {
  const root = await createPackageFixture();
  try {
    const source = resolve(root, "src/glyphs/g/glyphs/glyphs-outline.icon.ts");
    await mkdir(dirname(source), {recursive:true});
    await writeFile(source, iconSource("glyphs"), "utf8");
    await synchroniseIconsCatalogue(root);
    assert.match(await readFile(resolve(root, "src/generated/facades/glyphs/glyphs.ts"), "utf8"), /export const GlyphsVariants/u);
    assert.match(await readFile(resolve(root, "src/generated/facades/icons/glyphs/outline.ts"), "utf8"), /export \{ GlyphsOutline \}/u);
    const manifest = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
    assert.equal(manifest.exports["./glyphs/*"], undefined);
    assert.deepEqual((await synchroniseIconsCatalogue(root, true)).changedPaths, []);
  } finally {
    await rm(root, {recursive:true,force:true});
  }
});

test("rejects empty canonical source families before changing the generated set", async () => {
  for (const relativePath of ["src/glyphs", "src/collections"]) {
    const root = await createPackageFixture();
    try {
      await synchroniseIconsCatalogue(root);
      const expected = await readGeneratedOutputs(root);
      const target = resolve(root, relativePath);
      assert.ok(new RepositoryPathResolver().contains(root, target));
      await rm(target, { recursive: true, force: true });
      for (const checkOnly of [true, false]) {
        await assert.rejects(
          synchroniseIconsCatalogue(root, checkOnly),
          /Catalogue source family contains no/u,
        );
        assert.deepEqual(await readGeneratedOutputs(root), expected);
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
});

test("synchronises canonical modules deterministically and reports drift", async () => {
  const root = await createPackageFixture();

  try {
    const generated = await synchroniseIconsCatalogue(root);

    assert.deepEqual(generated.changedPaths, completeGeneratedOutputPaths);
    assert.equal(generated.outputCount, completeGeneratedOutputPaths.length);

    const alphaFacadePath = resolve(
      root,
      generatedOutputPaths.alphaIconFacade,
    );
    const alphaFacade = await readFile(alphaFacadePath, "utf8");
    assert.match(alphaFacade, /^\/\/ Generated by/u);
    assert.match(alphaFacade, /Do not edit manually\.\n\nexport/u);
    assert.match(
      alphaFacade,
      /export \{ AlphaIconOutline \} from "\.\.\/\.\.\/\.\.\/\.\.\/glyphs\/a\/alpha-icon\/alpha-icon-outline\.icon\.js";/u,
    );
    assert.match(
      await readFile(
        resolve(root, generatedOutputPaths.sampleCollectionFacade),
        "utf8",
      ),
      /export \{ Sample \} from "\.\.\/\.\.\/\.\.\/collections\/s\/sample\/sample\.collection\.js";/u,
    );
    const manifest = await readFile(
      resolve(root, generatedOutputPaths.manifest),
      "utf8",
    );
    assert.match(manifest, /export const AsterIconManifest/u);
    assert.match(manifest, /export const AsterCollectionManifest/u);
    assert.match(manifest, /key: "alpha-icon@outline"/u);
    assert.match(manifest, /key: "fixture\/zeta@outline"/u);
    assert.match(manifest, /licence: "ISC"/u);
    assert.match(manifest, /members: Object\.freeze\(\["alpha-icon@outline"\]\)/u);
    assert.match(manifest, /exportName: "Sample"/u);
    assert.doesNotMatch(
      manifest,
      /\b(?:nodes|viewBox|presentation|Icon\.define|Collection\.define)\b/u,
    );
    const dynamic = await readFile(
      resolve(root, generatedOutputPaths.dynamic),
      "utf8",
    );
    assert.match(dynamic, /export const AsterIconLoaders/u);
    assert.match(dynamic, /export const AsterCollectionLoaders/u);
    assert.match(dynamic, /"alpha-icon@outline": Object\.freeze/u);
    assert.match(dynamic, /"fixture\/zeta@outline": Object\.freeze/u);
    assert.match(dynamic, /"sample": Object\.freeze/u);
    assert.match(dynamic, /\.then\(\(\{ Sample \}\) => Sample\)/u);
    assert.match(
      dynamic,
      /import\("\.\.\/facades\/icons\/alpha-icon\/outline\.js"\)/u,
    );
    assert.match(
      dynamic,
      /import\("\.\.\/facades\/collections\/sample\.js"\)/u,
    );
    assert.doesNotMatch(dynamic, /(?:glyphs|collections\/s\/sample)/u);

    const current = await synchroniseIconsCatalogue(root, true);
    assert.deepEqual(current.changedPaths, []);

    const manifestPath = resolve(root, generatedOutputPaths.manifest);
    await writeFile(manifestPath, "stale\n", "utf8");
    const drift = await synchroniseIconsCatalogue(root, true);
    assert.deepEqual(drift.changedPaths, [generatedOutputPaths.manifest]);
    assert.equal(await readFile(manifestPath, "utf8"), "stale\n");

    await synchroniseIconsCatalogue(root);
    assert.equal(await readFile(manifestPath, "utf8"), manifest);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("retains own constructor loaders without inherited fallback", async () => {
  const root = await createPackageFixture();

  try {
    const iconPath = resolve(root, "src/glyphs/c/constructor/constructor-outline.icon.ts");
    const collectionPath = resolve(
      root,
      "src/collections/c/constructor/constructor.collection.ts",
    );
    await mkdir(dirname(iconPath), { recursive: true });
    await mkdir(dirname(collectionPath), { recursive: true });
    await writeFile(iconPath, iconSource("constructor"), "utf8");
    await writeFile(
      collectionPath,
      collectionSource(
        "constructor",
        ['import { ConstructorOutline as ConstructorIcon } from "../../../glyphs/c/constructor/constructor-outline.icon.js";'],
        [{ alias: "disc", symbol: "ConstructorIcon" }],
      ),
      "utf8",
    );

    const generated = await synchroniseIconsCatalogue(root);
    assert.equal(generated.outputCount, completeGeneratedOutputPaths.length + 3);
    const expected = await readGeneratedOutputs(root);
    const current = await synchroniseIconsCatalogue(root, true);
    assert.deepEqual(current.changedPaths, []);
    const repeated = await synchroniseIconsCatalogue(root);
    assert.deepEqual(repeated.changedPaths, []);
    assert.deepEqual(await readGeneratedOutputs(root), expected);

    const runtimePath = resolve(root, "runtime/generated/dynamic/index.mjs");
    await mkdir(dirname(runtimePath), { recursive: true });
    await writeFile(resolve(root, "runtime/package.json"), '{"type":"module"}\n', "utf8");
    await writeFile(
      runtimePath,
      ts.transpileModule(expected[generatedOutputPaths.dynamic], {
        compilerOptions: {
          module: ts.ModuleKind.ES2022,
          target: ts.ScriptTarget.ES2022,
        },
      }).outputText,
      "utf8",
    );

    const definitions = [
      { family: "icon", directory: "icons", symbol: "ConstructorOutline" },
      { family: "collection", directory: "collections", symbol: "Constructor" },
    ];

    for (const { family, directory, symbol } of definitions) {
      const subpath = family === "icon" ? "constructor/outline" : "constructor";
      const facadePath = resolve(root, `runtime/generated/facades/${directory}/${subpath}.js`);
      await mkdir(dirname(facadePath), { recursive: true });
      await writeFile(
        facadePath,
        `export const ${symbol} = Object.freeze({ family: "${family}", identity: Object.freeze({ name: "constructor", ${family === "icon" ? 'variant: "outline"' : ""} }) });\n`,
        "utf8",
      );
    }

    const dynamic = await import(pathToFileURL(runtimePath).href);
    assert.deepEqual(Object.keys(dynamic).sort(), ["AsterCollectionLoaders", "AsterIconLoaders"]);
    assert.deepEqual(Object.keys(dynamic.AsterIconLoaders), ["alpha-icon@outline", "constructor@outline", "fixture/zeta@outline"]);
    assert.deepEqual(Object.keys(dynamic.AsterCollectionLoaders), ["constructor", "sample"]);

    for (const { family, directory, symbol } of definitions) {
      const loaders = family === "icon" ? dynamic.AsterIconLoaders : dynamic.AsterCollectionLoaders;
      const subpath = family === "icon" ? "constructor/outline" : "constructor";
      const key = family === "icon" ? "constructor@outline" : "constructor";
      const direct = await import(
        pathToFileURL(resolve(root, `runtime/generated/facades/${directory}/${subpath}.js`)).href,
      );
      assert.equal(Object.getPrototypeOf(loaders), null);
      assert.ok(Object.isFrozen(loaders));
      assert.ok(Object.hasOwn(loaders, key));
      const loader = loaders[key];
      assert.equal(typeof loader, "function");
      assert.ok(Object.isFrozen(loader));
      const pending = loader();
      assert.ok(pending instanceof Promise);
      assert.equal(await pending, direct[symbol]);
      assert.equal(await loader(), direct[symbol]);

      for (const key of Object.getOwnPropertyNames(Object.prototype)) {
        if (Object.hasOwn(loaders, key)) {
          continue;
        }

        assert.equal(loaders[key], undefined, key);
        assert.equal(loaders[key]?.(), undefined, key);
        assert.equal(key in loaders, false, key);
      }
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("synchronises collection membership from the canonical source alone", async () => {
  const root = await createPackageFixture();
  const collectionPath = resolve(
    root,
    "src/collections/s/sample/sample.collection.ts",
  );

  try {
    await synchroniseIconsCatalogue(root);
    await writeFile(
      collectionPath,
      collectionSource(
        "sample",
        [
          'import { AlphaIconOutline } from "../../../glyphs/a/alpha-icon/alpha-icon-outline.icon.js";',
          'import { ZetaOutline } from "../../../glyphs/z/zeta/zeta-outline.icon.js";',
        ],
        [
          { alias: "alphaIcon", symbol: "AlphaIconOutline" },
          { alias: "zeta", symbol: "ZetaOutline" },
        ],
      ),
      "utf8",
    );

    const added = await synchroniseIconsCatalogue(root);
    const addedManifest = await readFile(
      resolve(root, generatedOutputPaths.manifest),
      "utf8",
    );

    assert.deepEqual(added.changedPaths, [generatedOutputPaths.manifest]);
    assert.match(
      addedManifest,
      /members: Object\.freeze\(\["alpha-icon@outline", "fixture\/zeta@outline"\]\)/u,
    );

    await writeFile(
      collectionPath,
      collectionSource(
        "sample",
        ['import { ZetaOutline } from "../../../glyphs/z/zeta/zeta-outline.icon.js";'],
        [{ alias: "zeta", symbol: "ZetaOutline" }],
      ),
      "utf8",
    );

    const removed = await synchroniseIconsCatalogue(root);
    const removedManifest = await readFile(
      resolve(root, generatedOutputPaths.manifest),
      "utf8",
    );

    assert.deepEqual(removed.changedPaths, [generatedOutputPaths.manifest]);
    assert.match(
      removedManifest,
      /members: Object\.freeze\(\["fixture\/zeta@outline"\]\)/u,
    );
    assert.deepEqual(
      (await synchroniseIconsCatalogue(root, true)).changedPaths,
      [],
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("adds and removes source modules across generated integrations", async () => {
  const root = await createPackageFixture();

  try {
    await synchroniseIconsCatalogue(root);
    const sourcePath = resolve(root, "src/glyphs/m/middle/middle-outline.icon.ts");
    await mkdir(dirname(sourcePath), { recursive: true });
    await writeFile(sourcePath, iconSource("middle"), "utf8");

    const added = await synchroniseIconsCatalogue(root);
    assert.deepEqual(added.changedPaths, [
      generatedOutputPaths.manifest,
      generatedOutputPaths.dynamic,
      "src/generated/facades/icons/middle/outline.ts",
      "src/generated/facades/glyphs/middle.ts",
    ]);
    assert.match(
      await readFile(resolve(root, generatedOutputPaths.manifest), "utf8"),
      /exportName: "MiddleOutline"/u,
    );

    await unlink(sourcePath);
    const removed = await synchroniseIconsCatalogue(root);
    assert.deepEqual(removed.changedPaths, [
      generatedOutputPaths.manifest,
      generatedOutputPaths.dynamic,
      "src/generated/facades/glyphs/middle.ts",
      "src/generated/facades/icons/middle/outline.ts",
    ]);
    assert.doesNotMatch(
      await readFile(resolve(root, generatedOutputPaths.manifest), "utf8"),
      /Middle/u,
    );
    assert.doesNotMatch(
      await readFile(resolve(root, generatedOutputPaths.dynamic), "utf8"),
      /middle/u,
    );
    await assert.rejects(
      readFile(resolve(root, "src/generated/facades/icons/middle/outline.ts"), "utf8"),
    );

    const collectionPath = resolve(
      root,
      "src/collections/s/secondary/secondary.collection.ts",
    );
    await mkdir(dirname(collectionPath), { recursive: true });
    await writeFile(
      collectionPath,
      collectionSource("secondary"),
      "utf8",
    );
    const collectionAdded = await synchroniseIconsCatalogue(root);
    assert.deepEqual(collectionAdded.changedPaths, [
      generatedOutputPaths.manifest,
      generatedOutputPaths.dynamic,
      "src/generated/facades/collections/secondary.ts",
    ]);
    assert.match(
      await readFile(resolve(root, generatedOutputPaths.manifest), "utf8"),
      /name: "secondary"/u,
    );

    await unlink(collectionPath);
    const collectionRemoved = await synchroniseIconsCatalogue(root);
    assert.deepEqual(collectionRemoved.changedPaths, [
      generatedOutputPaths.manifest,
      generatedOutputPaths.dynamic,
      "src/generated/facades/collections/secondary.ts",
    ]);
    assert.doesNotMatch(
      await readFile(resolve(root, generatedOutputPaths.manifest), "utf8"),
      /name: "secondary"/u,
    );
    await assert.rejects(
      readFile(
        resolve(root, "src/generated/facades/collections/secondary.ts"),
        "utf8",
      ),
    );
    assert.doesNotMatch(
      await readFile(resolve(root, generatedOutputPaths.dynamic), "utf8"),
      /secondary/u,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("refreshes imported manifest authorities between synchronisations", async () => {
  const root = await createPackageFixture();
  const authorshipPath = resolve(
    root,
    "src/authoring/constants/fixture-authorship.constant.ts",
  );

  try {
    await synchroniseIconsCatalogue(root);
    await writeFile(
      authorshipPath,
      'export const fixtureAuthorship = Object.freeze({ namespace: "updated", licence: "CC0-1.0" });\n',
      "utf8",
    );

    const refreshed = await synchroniseIconsCatalogue(root);
    const manifest = await readFile(
      resolve(root, generatedOutputPaths.manifest),
      "utf8",
    );

    assert.deepEqual(refreshed.changedPaths, [
      generatedOutputPaths.manifest,
      generatedOutputPaths.dynamic,
    ]);
    assert.match(manifest, /key: "updated\/zeta@outline"/u);
    assert.match(manifest, /licence: "CC0-1\.0"/u);
    assert.doesNotMatch(manifest, /key: "fixture\/zeta@outline"/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("discovers nested explicit treatments and collections with portable specifiers", async () => {
  const root = await createPackageFixture();

  try {
    const cameraRoot = resolve(root, "src/glyphs/c/camera");
    const retroRoot = resolve(root, "src/glyphs/c/camera-retro");
    const archiveRoot = resolve(root, "src/collections/a/archive");
    await mkdir(cameraRoot, { recursive: true });
    await mkdir(retroRoot, { recursive: true });
    await mkdir(archiveRoot, { recursive: true });
    await writeFile(
      resolve(cameraRoot, "camera-outline.icon.ts"),
      iconSource("camera"),
      "utf8",
    );
    await writeFile(
      resolve(cameraRoot, "camera-stippled.icon.ts"),
      iconSource("camera", "stippled"),
      "utf8",
    );
    await writeFile(
      resolve(retroRoot, "camera-retro-outline.icon.ts"),
      iconSource("camera-retro"),
      "utf8",
    );
    await writeFile(
      resolve(archiveRoot, "archive.collection.ts"),
      collectionSource(
        "archive",
        [
          'import { CameraStippled } from "../../../glyphs/c/camera/camera-stippled.icon.js";',
        ],
        [{ alias: "cameraStippled", symbol: "CameraStippled" }],
      ),
      "utf8",
    );
    await writeFile(resolve(cameraRoot, "notes.ts"), "ignored\n", "utf8");

    await synchroniseIconsCatalogue(root);

    const dynamic = await readFile(
      resolve(root, generatedOutputPaths.dynamic),
      "utf8",
    );

    assert.match(
      await readFile(
        resolve(root, "src/generated/facades/icons/camera/outline.ts"),
        "utf8",
      ),
      /export \{ CameraOutline \} from "\.\.\/\.\.\/\.\.\/\.\.\/glyphs\/c\/camera\/camera-outline\.icon\.js";/u,
    );
    assert.match(
      await readFile(
        resolve(root, "src/generated/facades/icons/camera/stippled.ts"),
        "utf8",
      ),
      /export \{ CameraStippled \} from "\.\.\/\.\.\/\.\.\/\.\.\/glyphs\/c\/camera\/camera-stippled\.icon\.js";/u,
    );
    assert.match(
      await readFile(
        resolve(root, "src/generated/facades/collections/archive.ts"),
        "utf8",
      ),
      /export \{ Archive \} from "\.\.\/\.\.\/\.\.\/collections\/a\/archive\/archive\.collection\.js";/u,
    );
    assert.match(
      dynamic,
      /"camera@stippled": Object\.freeze/u,
    );
    assert.match(
      dynamic,
      /import\("\.\.\/facades\/icons\/camera\/stippled\.js"\)/u,
    );
    assert.match(dynamic, /"archive": Object\.freeze/u);

    await unlink(resolve(retroRoot, "camera-retro-outline.icon.ts"));
    const removed = await synchroniseIconsCatalogue(root);

    assert.deepEqual(removed.changedPaths, [
      generatedOutputPaths.manifest,
      generatedOutputPaths.dynamic,
      "src/generated/facades/glyphs/camera-retro.ts",
      "src/generated/facades/icons/camera-retro/outline.ts",
    ]);
    assert.doesNotMatch(
      await readFile(resolve(root, generatedOutputPaths.manifest), "utf8"),
      /CameraRetro/u,
    );
    assert.doesNotMatch(
      await readFile(resolve(root, generatedOutputPaths.dynamic), "utf8"),
      /camera-retro/u,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects absent icon treatments before replacing generated outputs", async () => {
  const root = await createPackageFixture();
  try {
    await synchroniseIconsCatalogue(root);
    const expected = await readGeneratedOutputs(root);
    const iconRoot = resolve(root, "src/glyphs/c/camera");
    await mkdir(iconRoot, { recursive: true });
    const implicitPath = resolve(iconRoot, "camera.icon.ts");
    await writeFile(implicitPath, iconSource("camera"), "utf8");
    await assert.rejects(synchroniseIconsCatalogue(root), /requires an explicit variant filename/u);
    assert.deepEqual(await readGeneratedOutputs(root), expected);
    await unlink(implicitPath);

    const explicitPath = resolve(iconRoot, "camera-outline.icon.ts");
    await writeFile(explicitPath, iconSource("camera").replace(', variant: "outline"', ""), "utf8");
    await assert.rejects(synchroniseIconsCatalogue(root), /identity must match camera@outline/u);
    assert.deepEqual(await readGeneratedOutputs(root), expected);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("derives a dictionary-only glyph facade from open treatment slugs", async () => {
  const root = await createPackageFixture();
  try {
    const iconRoot = resolve(root, "src/glyphs/c/camera");
    await mkdir(iconRoot, { recursive: true });
    for (const variant of ["2-tone", "filled-dotted"]) {
      await writeFile(resolve(iconRoot, `camera-${variant}.icon.ts`), iconSource("camera", variant), "utf8");
    }
    await synchroniseIconsCatalogue(root);
    const outputs = await readGeneratedOutputs(root);
    const manifest = outputs[generatedOutputPaths.manifest];
    const dynamic = outputs[generatedOutputPaths.dynamic];
    assert.match(manifest, /key: "camera@2-tone"/u);
    assert.match(manifest, /exportName: "Camera2Tone"/u);
    assert.match(manifest, /key: "camera@filled-dotted"/u);
    assert.match(dynamic, /facades\/icons\/camera\/2-tone\.js/u);
    const glyph = await readFile(resolve(root, "src/generated/facades/glyphs/camera.ts"), "utf8");
    assert.match(glyph, /export const CameraVariants = Object\.freeze\(variants\)/u);
    assert.match(glyph, /"2Tone": Camera2Tone/u);
    assert.match(glyph, /"filledDotted": CameraFilledDotted/u);
    assert.match(glyph, /Object\.setPrototypeOf\(variants, null\)/u);
    assert.doesNotMatch(glyph, /export \{|"default"|outline/u);
    assert.deepEqual((await synchroniseIconsCatalogue(root, true)).changedPaths, []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects glyph property, binding and namespace collisions without any output write", async () => {
  for (const { variants, namespaces, pattern } of [
    { variants: ["tone-1", "tone1"], pattern: /glyph variant property collision/u },
    { variants: ["variants"], pattern: /glyph symbol collision/u },
    { variants: ["filled"], namespaces: ["different"], pattern: /Ambiguous generated glyph public subpath/u },
  ]) {
    const root = await createPackageFixture();
    try {
      await synchroniseIconsCatalogue(root);
      const expected = await readGeneratedOutputs(root);
      const generatedPaths = await readdir(resolve(root, "src/generated"), { recursive: true });
      for (const [index, variant] of variants.entries()) {
        const source = iconSource("alpha-icon", variant);
        await writeFile(resolve(root, `src/glyphs/a/alpha-icon/alpha-icon-${variant}.icon.ts`),
          namespaces === undefined ? source : source.replace("identity: { name:", `identity: { namespace: "${namespaces[index]}", name:`), "utf8");
      }
      await assert.rejects(synchroniseIconsCatalogue(root), pattern);
      assert.deepEqual(await readGeneratedOutputs(root), expected);
      await assert.rejects(synchroniseIconsCatalogue(root, true), pattern);
      assert.deepEqual(await readGeneratedOutputs(root), expected);
      assert.deepEqual(await readdir(resolve(root, "src/generated"), { recursive: true }), generatedPaths);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
});

test("allows repeated definition symbols in independent glyph module scopes", async () => {
  const root = await createPackageFixture();
  try {
    const path = resolve(root, "src/glyphs/a/alpha/alpha-icon-outline.icon.ts");
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, iconSource("alpha", "icon-outline"), "utf8");
    await synchroniseIconsCatalogue(root);
    const glyph = await readFile(resolve(root, "src/generated/facades/glyphs/alpha.ts"), "utf8");
    assert.match(glyph, /export const AlphaVariants/u);
    assert.match(glyph, /"iconOutline": AlphaIconOutline/u);
    assert.match(await readFile(resolve(root, generatedOutputPaths.alphaIconGlyph), "utf8"), /"outline": AlphaIconOutline/u);
    assert.deepEqual((await synchroniseIconsCatalogue(root, true)).changedPaths, []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("updates actual glyph treatments and removes stale aggregate drift deterministically", async () => {
  const root = await createPackageFixture();
  try {
    await synchroniseIconsCatalogue(root);
    const sourcePath = resolve(root, "src/glyphs/a/alpha-icon/alpha-icon-filled-dotted.icon.ts");
    await writeFile(sourcePath, iconSource("alpha-icon", "filled-dotted"), "utf8");
    const added = await synchroniseIconsCatalogue(root);
    assert.deepEqual(added.changedPaths, [
      generatedOutputPaths.manifest, generatedOutputPaths.dynamic,
      "src/generated/facades/icons/alpha-icon/filled-dotted.ts", generatedOutputPaths.alphaIconGlyph,
      "package.json",
    ]);
    const glyphPath = resolve(root, generatedOutputPaths.alphaIconGlyph);
    const expected = await readFile(glyphPath, "utf8");
    assert.match(expected, /"filledDotted": AlphaIconFilledDotted/u);
    assert.match(expected, /"outline": AlphaIconOutline/u);
    await writeFile(glyphPath, `${expected}// stale\n`, "utf8");
    assert.deepEqual((await synchroniseIconsCatalogue(root, true)).changedPaths, [generatedOutputPaths.alphaIconGlyph]);
    assert.deepEqual((await synchroniseIconsCatalogue(root)).changedPaths, [generatedOutputPaths.alphaIconGlyph]);
    assert.equal(await readFile(glyphPath, "utf8"), expected);
    await unlink(sourcePath);
    const removed = await synchroniseIconsCatalogue(root);
    assert.deepEqual(new Set(removed.changedPaths), new Set(added.changedPaths));
    assert.doesNotMatch(await readFile(glyphPath, "utf8"), /filled|Filled/u);
    assert.deepEqual((await synchroniseIconsCatalogue(root)).changedPaths, []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects transitional flat source paths before writing", async () => {
  const root = await createPackageFixture();

  try {
    const flatPath = resolve(root, "src/glyphs/flat.icon.ts");
    await writeFile(
      flatPath,
      iconSource("flat"),
      "utf8",
    );

    await assert.rejects(
      synchroniseIconsCatalogue(root),
      /Invalid canonical catalogue source path/u,
    );

    for (const path of completeGeneratedOutputPaths) {
      await assert.rejects(readFile(resolve(root, path), "utf8"));
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("reports and removes obsolete facade files as one owned directory", async () => {
  const root = await createPackageFixture();

  try {
    await synchroniseIconsCatalogue(root);
    const obsoletePath = "src/generated/facades/icons/obsolete.ts";
    await writeFile(resolve(root, obsoletePath), "stale\n", "utf8");

    const drift = await synchroniseIconsCatalogue(root, true);
    assert.deepEqual(drift.changedPaths, [obsoletePath]);
    assert.equal(await readFile(resolve(root, obsoletePath), "utf8"), "stale\n");

    const synchronised = await synchroniseIconsCatalogue(root);
    assert.deepEqual(synchronised.changedPaths, [obsoletePath]);
    await assert.rejects(readFile(resolve(root, obsoletePath), "utf8"));
    assert.deepEqual(
      await readdir(resolve(root, "src/generated")),
      ["dynamic", "facades", "manifest"],
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects removed icons retained by canonical collections before writing", async () => {
  const root = await createPackageFixture();

  try {
    await synchroniseIconsCatalogue(root);
    const outputs = await readGeneratedOutputs(root);
    await unlink(
      resolve(root, "src/glyphs/a/alpha-icon/alpha-icon-outline.icon.ts"),
    );

    await assert.rejects(
      synchroniseIconsCatalogue(root),
      /contains dangling icon reference/u,
    );
    assert.deepEqual(await readGeneratedOutputs(root), outputs);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects reserved public subpaths before replacing existing outputs", async () => {
  const root = await createPackageFixture();

  try {
    await synchroniseIconsCatalogue(root);
    const outputs = await readGeneratedOutputs(root);
    const manifestPath = resolve(
      root,
      "src/glyphs/m/manifest/manifest-outline.icon.ts",
    );
    await mkdir(dirname(manifestPath), { recursive: true });
    await writeFile(
      manifestPath,
      iconSource("manifest"),
      "utf8",
    );

    await assert.rejects(
      synchroniseIconsCatalogue(root),
      /collides with a reserved public subpath/u,
    );
    assert.deepEqual(await readGeneratedOutputs(root), outputs);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects generated directory entries outside the owned facade root", async () => {
  const root = await mkdtemp(join(tmpdir(), "aster-catalogue-publication-"));
  const facadeRoot = resolve(root, "facades");
  const retainedPath = resolve(facadeRoot, "retained.ts");
  const escapedPath = resolve(root, "escaped.ts");
  const fileSystem = new NodeCatalogueSourceFileSystem();

  try {
    await mkdir(facadeRoot, { recursive: true });
    await writeFile(retainedPath, "retained\n", "utf8");

    await assert.rejects(
      fileSystem.replaceDirectory(
        facadeRoot,
        [Object.freeze({ relativePath: "../escaped.ts", content: "unsafe\n" })],
      ),
      /escapes its owned root/u,
    );
    assert.equal(await readFile(retainedPath, "utf8"), "retained\n");
    await assert.rejects(readFile(escapedPath, "utf8"));
    assert.deepEqual(await readdir(root), ["facades"]);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects invalid and malformed canonical modules before writing", async () => {
  const cases = [
    {
      files: [["b/Bad/Bad.icon.ts", iconSource("bad")]],
      pattern: /Invalid canonical catalogue source name/u,
    },
    {
      files: [[
        "w/wrong/wrong-outline.icon.ts",
        'import { Icon } from "@luscious-garden/aster-core";\n\nexport const Other = Icon.define({});\n',
      ]],
      pattern: /must export exactly one constant named WrongOutline/u,
    },
    {
      files: [["p/plain/plain-outline.icon.ts", "export const PlainOutline = {};\n"]],
      pattern: /must initialise Icon\.define/u,
    },
    {
      files: [["b/broken/broken-outline.icon.ts", "export const BrokenOutline = {;\n"]],
      pattern: /Invalid TypeScript catalogue source/u,
    },
    {
      files: [["m/manifest/manifest-outline.icon.ts", iconSource("manifest")]],
      pattern: /collides with a reserved public subpath/u,
    },
    {
      files: [[
        "c/camera/camera-outline.icon.ts",
        'import { Icon } from "@luscious-garden/aster-core";\n\nexport const CameraOutline = Icon.define({ identity: { name: "photograph", variant: "outline" } });\n',
      ]],
      pattern: /identity must match camera@outline/u,
    },
    {
      files: [[
        "c/camera/camera-filled.icon.ts",
        'import { Icon } from "@luscious-garden/aster-core";\n\nexport const CameraFilled = Icon.define({ identity: { name: "camera", variant: "outline" } });\n',
      ]],
      pattern: /identity must match camera@filled/u,
    },
    {
      files: [[
        "c/computed/computed-outline.icon.ts",
        'import { Icon } from "@luscious-garden/aster-core";\n\nexport const ComputedOutline = Icon.define({ identity: { name: "computed", variant: "outline" }, metadata: { displayName: createName(), rtl: "preserve", deprecated: false } });\n',
      ]],
      pattern: /unsupported static catalogue syntax CallExpression/u,
    },
    {
      files: [[
        "c/cyclic/cyclic-outline.icon.ts",
        'import { Icon } from "@luscious-garden/aster-core";\n\nconst label = label;\nexport const CyclicOutline = Icon.define({ identity: { name: "cyclic", variant: "outline" }, metadata: { displayName: label, rtl: "preserve", deprecated: false } });\n',
      ]],
      pattern: /cyclic static catalogue reference through label/u,
    },
    {
      files: [[
        "f/foreign/foreign-outline.icon.ts",
        'import { Icon } from "@luscious-garden/aster-not-core";\n\nexport const ForeignOutline = Icon.define({ identity: { name: "foreign", variant: "outline" }, metadata: { displayName: "Foreign", rtl: "preserve", deprecated: false } });\n',
      ]],
      pattern: /must import Icon from @luscious-garden\/aster-core as one runtime named import/u,
    },
    {
      files: [[
        "t/type-only/type-only-outline.icon.ts",
        'import type { Icon } from "@luscious-garden/aster-core";\n\nexport const TypeOnlyOutline = Icon.define({ identity: { name: "type-only", variant: "outline" }, metadata: { displayName: "Type Only", rtl: "preserve", deprecated: false } });\n',
      ]],
      pattern: /must import Icon from @luscious-garden\/aster-core as one runtime named import/u,
    },
    {
      files: [["x/camera/camera-outline.icon.ts", iconSource("camera")]],
      pattern: /Invalid canonical catalogue source initial directory/u,
    },
  ];

  for (const fixture of cases) {
    const root = await createPackageFixture();

    try {
      for (const [name, content] of fixture.files) {
        const sourcePath = resolve(root, "src/glyphs", name);
        await mkdir(dirname(sourcePath), { recursive: true });
        await writeFile(sourcePath, content, "utf8");
      }

      await assert.rejects(
        synchroniseIconsCatalogue(root),
        fixture.pattern,
      );

      for (const path of completeGeneratedOutputPaths) {
        await assert.rejects(readFile(resolve(root, path), "utf8"));
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
});

test("rejects non-runtime collection members before replacing outputs", async () => {
  const root = await createPackageFixture();
  const collectionPath = resolve(
    root,
    "src/collections/s/sample/sample.collection.ts",
  );

  try {
    await synchroniseIconsCatalogue(root);
    const outputs = await readGeneratedOutputs(root);
    await writeFile(
      collectionPath,
      collectionSource(
        "sample",
        [
          'import type { AlphaIconOutline } from "../../../glyphs/a/alpha-icon/alpha-icon-outline.icon.js";',
        ],
        [{ alias: "alphaIcon", symbol: "AlphaIconOutline" }],
      ),
      "utf8",
    );

    await assert.rejects(
      synchroniseIconsCatalogue(root),
      /collection member AlphaIconOutline must use a runtime named import/u,
    );
    assert.deepEqual(await readGeneratedOutputs(root), outputs);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects unsupported collection icon dictionary syntax before replacing outputs", async () => {
  const cases = [
    {
      source: collectionSource(
        "sample",
        [
          'import { AlphaIconOutline } from "../../../glyphs/a/alpha-icon/alpha-icon-outline.icon.js";',
        ],
        [{ alias: "alphaIcon", symbol: "AlphaIconOutline" }],
      ).replace(
        "  icons: {\n    alphaIcon: { outline: AlphaIconOutline },\n  },",
        "  icons: [AlphaIconOutline],",
      ),
      pattern: /must declare icons as an object literal/u,
    },
    {
      source: collectionSourceWithIcons(
        "sample",
        [
          'import { AlphaIconOutline } from "../../../glyphs/a/alpha-icon/alpha-icon-outline.icon.js";',
        ],
        ["    AlphaIconOutline: { outline: AlphaIconOutline },"],
      ),
      pattern: /collection icon alias AlphaIconOutline must use lower camel-case syntax/u,
    },
    {
      source: collectionSourceWithIcons(
        "sample",
        [
          'import { AlphaIconOutline } from "../../../glyphs/a/alpha-icon/alpha-icon-outline.icon.js";',
        ],
        [
          "    alphaIcon: { outline: AlphaIconOutline },",
          "    alphaIcon: { outline: AlphaIconOutline },",
        ],
      ),
      pattern: /contains duplicate collection icon alias alphaIcon/u,
    },
    {
      source: collectionSourceWithIcons(
        "sample",
        [
          'import { AlphaIconOutline } from "../../../glyphs/a/alpha-icon/alpha-icon-outline.icon.js";',
        ],
        [
          "    alphaIcon: { outline: AlphaIconOutline },",
          "    repeatedAlpha: { outline: AlphaIconOutline },",
        ],
      ),
      pattern: /contains duplicate collection member AlphaIconOutline/u,
    },
    {
      source: collectionSourceWithIcons(
        "sample",
        [
          'import { AlphaIconOutline } from "../../../glyphs/a/alpha-icon/alpha-icon-outline.icon.js";',
        ],
        ["    ...{ alphaIcon: AlphaIconOutline },"],
      ),
      pattern: /must use direct lower camel-case properties/u,
    },
    {
      source: collectionSourceWithIcons(
        "sample",
        [
          'import { AlphaIconOutline } from "../../../glyphs/a/alpha-icon/alpha-icon-outline.icon.js";',
        ],
        ["    [\"alphaIcon\"]: AlphaIconOutline,"],
      ),
      pattern: /must use direct lower camel-case properties/u,
    },
    {
      source: collectionSourceWithIcons(
        "sample",
        [
          'import { AlphaIconOutline } from "../../../glyphs/a/alpha-icon/alpha-icon-outline.icon.js";',
        ],
        ["    get alphaIcon() { return AlphaIconOutline; },"],
      ),
      pattern: /must use direct lower camel-case properties/u,
    },
    {
      source: collectionSourceWithIcons(
        "sample",
        [],
        ["    alphaIcon: createIcon(),"],
      ),
      pattern: /must use direct lower camel-case properties/u,
    },
  ];

  for (const fixture of cases) {
    const root = await createPackageFixture();
    const collectionPath = resolve(
      root,
      "src/collections/s/sample/sample.collection.ts",
    );

    try {
      await synchroniseIconsCatalogue(root);
      const outputs = await readGeneratedOutputs(root);
      await writeFile(collectionPath, fixture.source, "utf8");

      await assert.rejects(
        synchroniseIconsCatalogue(root),
        fixture.pattern,
      );
      assert.deepEqual(await readGeneratedOutputs(root), outputs);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
});

test("rejects invalid imported manifest authorities before replacing outputs", async () => {
  const cases = [
    {
      source:
        'const fixtureAuthorship = Object.freeze({ namespace: "fixture", licence: "ISC" });\n',
      pattern: /cannot resolve static import fixtureAuthorship/u,
    },
    {
      source:
        'export const fixtureAuthorship = Object.freeze({ namespace: "fixture", namespace: "duplicate", licence: "ISC" });\n',
      pattern: /duplicate static property namespace/u,
    },
    {
      source:
        'export const fixtureAuthorship = Object.freeze({ namespace: "fixture", licence: "ISC" });\nexport const fixtureAuthorship = Object.freeze({ namespace: "duplicate", licence: "ISC" });\n',
      pattern: /ambiguous static constant fixtureAuthorship/u,
    },
  ];

  for (const fixture of cases) {
    const root = await createPackageFixture();
    const authorshipPath = resolve(
      root,
      "src/authoring/constants/fixture-authorship.constant.ts",
    );

    try {
      await synchroniseIconsCatalogue(root);
      const outputs = await readGeneratedOutputs(root);
      await writeFile(authorshipPath, fixture.source, "utf8");

      await assert.rejects(
        synchroniseIconsCatalogue(root),
        fixture.pattern,
      );
      assert.deepEqual(await readGeneratedOutputs(root), outputs);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
});

test("rejects invalid static authority bindings before replacing outputs", async () => {
  const cases = [
    {
      imports: [
        'import type { fixtureAuthorship } from "../../../authoring/constants/fixture-authorship.constant.js";',
      ],
      pattern: /unsupported static identifier fixtureAuthorship/u,
    },
    {
      imports: [
        'import { fixtureAuthorship } from "../../../authoring/constants/fixture-authorship.constant.js";',
        'import { fixtureAuthorship } from "../../../authoring/constants/fixture-authorship.constant.js";',
      ],
      pattern: /ambiguous static import fixtureAuthorship/u,
    },
  ];

  for (const fixture of cases) {
    const root = await createPackageFixture();
    const zetaPath = resolve(root, "src/glyphs/z/zeta/zeta-outline.icon.ts");

    try {
      await synchroniseIconsCatalogue(root);
      const outputs = await readGeneratedOutputs(root);
      await writeFile(
        zetaPath,
        [
          'import { Icon } from "@luscious-garden/aster-core";',
          ...fixture.imports,
          "",
          "export const ZetaOutline = Icon.define({",
          '  identity: { namespace: fixtureAuthorship.namespace, name: "zeta", variant: "outline" },',
          '  metadata: { displayName: "ZetaOutline", rtl: "preserve", deprecated: false },',
          "});",
          "",
        ].join("\n"),
        "utf8",
      );

      await assert.rejects(
        synchroniseIconsCatalogue(root),
        fixture.pattern,
      );
      assert.deepEqual(await readGeneratedOutputs(root), outputs);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  }
});
