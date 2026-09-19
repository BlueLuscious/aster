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

import { NodeCatalogueSourceFileSystem } from "../../tooling/catalogue/runtime/node-catalogue-source-file-system.mjs";
import { synchroniseIconsCatalogue } from "../../tooling/catalogue/synchronise-icons-catalogue.mjs";

const generatedOutputPaths = Object.freeze({
  manifest: "src/generated/manifest/index.ts",
  dynamic: "src/generated/dynamic/index.ts",
  alphaIconFacade: "src/generated/facades/icons/alpha-icon.ts",
  zetaFacade: "src/generated/facades/icons/zeta.ts",
  sampleCollectionFacade:
    "src/generated/facades/collections/sample.ts",
});

const completeGeneratedOutputPaths = Object.freeze(
  Object.values(generatedOutputPaths),
);

function pascalCase(slug) {
  return slug
    .split("-")
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join("");
}

function iconSource(name, variant) {
  const symbol = `${pascalCase(name)}${
    variant === undefined ? "" : pascalCase(variant)
  }`;
  const variantProperty = variant === undefined ? "" : `, variant: "${variant}"`;

  return [
    'import { Icon } from "@aster/core";',
    "",
    `export const ${symbol} = Icon.define({`,
    `  identity: { name: "${name}"${variantProperty} },`,
    `  metadata: { displayName: "${pascalCase(name)}", tags: ["${name}"], rtl: "preserve", deprecated: false },`,
    "});",
    "",
  ].join("\n");
}

function collectionSource(name, imports = [], members = []) {
  return [
    'import { Collection } from "@aster/core";',
    ...imports,
    "",
    `export const ${pascalCase(name)}Collection = Collection.define({`,
    `  identity: { name: "${name}" },`,
    `  icons: [${members.join(", ")}],`,
    `  metadata: { displayName: "${pascalCase(name)}" },`,
    "});\n",
  ].join("\n");
}

async function createPackageFixture() {
  const root = await mkdtemp(join(tmpdir(), "aster-catalogue-source-"));
  const alphaPath = resolve(
    root,
    "src/glyphs/a/alpha-icon/alpha-icon.icon.ts",
  );
  const zetaPath = resolve(root, "src/glyphs/z/zeta/zeta.icon.ts");
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
      'import { Icon } from "@aster/core";',
      'import { fixtureAuthorship } from "../../../authoring/constants/fixture-authorship.constant.js";',
      "",
      "export const Zeta = Icon.define({",
      '  identity: { namespace: fixtureAuthorship.namespace, name: "zeta" },',
      '  metadata: { displayName: "Zeta", tags: ["zeta"], rtl: "preserve", licence: fixtureAuthorship.licence, deprecated: false },',
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
        'import { AlphaIcon } from "../../../glyphs/a/alpha-icon/alpha-icon.icon.js";',
      ],
      ["AlphaIcon"],
    ),
    "utf8",
  );

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
      /export \{ AlphaIcon \} from "\.\.\/\.\.\/\.\.\/glyphs\/a\/alpha-icon\/alpha-icon\.icon\.js";/u,
    );
    assert.match(
      await readFile(
        resolve(root, generatedOutputPaths.sampleCollectionFacade),
        "utf8",
      ),
      /export \{ SampleCollection \} from "\.\.\/\.\.\/\.\.\/collections\/s\/sample\/sample\.collection\.js";/u,
    );
    const manifest = await readFile(
      resolve(root, generatedOutputPaths.manifest),
      "utf8",
    );
    assert.match(manifest, /export const AsterIconManifest/u);
    assert.match(manifest, /export const AsterCollectionManifest/u);
    assert.match(manifest, /key: "alpha-icon"/u);
    assert.match(manifest, /key: "fixture\/zeta"/u);
    assert.match(manifest, /licence: "ISC"/u);
    assert.match(manifest, /members: Object\.freeze\(\["alpha-icon"\]\)/u);
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
    assert.match(dynamic, /"alpha-icon": Object\.freeze/u);
    assert.match(dynamic, /"fixture\/zeta": Object\.freeze/u);
    assert.match(dynamic, /"sample": Object\.freeze/u);
    assert.match(
      dynamic,
      /import\("\.\.\/facades\/icons\/alpha-icon\.js"\)/u,
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

test("adds and removes source modules across generated integrations", async () => {
  const root = await createPackageFixture();

  try {
    await synchroniseIconsCatalogue(root);
    const sourcePath = resolve(root, "src/glyphs/m/middle/middle.icon.ts");
    await mkdir(dirname(sourcePath), { recursive: true });
    await writeFile(sourcePath, iconSource("middle"), "utf8");

    const added = await synchroniseIconsCatalogue(root);
    assert.deepEqual(added.changedPaths, [
      generatedOutputPaths.manifest,
      generatedOutputPaths.dynamic,
      "src/generated/facades/icons/middle.ts",
    ]);
    assert.match(
      await readFile(resolve(root, generatedOutputPaths.manifest), "utf8"),
      /symbol: "Middle"/u,
    );

    await unlink(sourcePath);
    const removed = await synchroniseIconsCatalogue(root);
    assert.deepEqual(removed.changedPaths, [
      generatedOutputPaths.manifest,
      generatedOutputPaths.dynamic,
      "src/generated/facades/icons/middle.ts",
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
      readFile(resolve(root, "src/generated/facades/icons/middle.ts"), "utf8"),
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
    assert.match(manifest, /key: "updated\/zeta"/u);
    assert.match(manifest, /licence: "CC0-1\.0"/u);
    assert.doesNotMatch(manifest, /key: "fixture\/zeta"/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("discovers nested base icons, variants and collections with portable specifiers", async () => {
  const root = await createPackageFixture();

  try {
    const cameraRoot = resolve(root, "src/glyphs/c/camera");
    const retroRoot = resolve(root, "src/glyphs/c/camera-retro");
    const archiveRoot = resolve(root, "src/collections/a/archive");
    await mkdir(cameraRoot, { recursive: true });
    await mkdir(retroRoot, { recursive: true });
    await mkdir(archiveRoot, { recursive: true });
    await writeFile(
      resolve(cameraRoot, "camera.icon.ts"),
      iconSource("camera"),
      "utf8",
    );
    await writeFile(
      resolve(cameraRoot, "camera-stippled.icon.ts"),
      iconSource("camera", "stippled"),
      "utf8",
    );
    await writeFile(
      resolve(retroRoot, "camera-retro.icon.ts"),
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
        ["CameraStippled"],
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
        resolve(root, "src/generated/facades/icons/camera.ts"),
        "utf8",
      ),
      /export \{ Camera \} from "\.\.\/\.\.\/\.\.\/glyphs\/c\/camera\/camera\.icon\.js";/u,
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
      /export \{ ArchiveCollection \} from "\.\.\/\.\.\/\.\.\/collections\/a\/archive\/archive\.collection\.js";/u,
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

    await unlink(resolve(retroRoot, "camera-retro.icon.ts"));
    const removed = await synchroniseIconsCatalogue(root);

    assert.deepEqual(removed.changedPaths, [
      generatedOutputPaths.manifest,
      generatedOutputPaths.dynamic,
      "src/generated/facades/icons/camera-retro.ts",
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
      resolve(root, "src/glyphs/a/alpha-icon/alpha-icon.icon.ts"),
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
      "src/glyphs/m/manifest/manifest.icon.ts",
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
        "w/wrong/wrong.icon.ts",
        'import { Icon } from "@aster/core";\n\nexport const Other = Icon.define({});\n',
      ]],
      pattern: /must export exactly one constant named Wrong/u,
    },
    {
      files: [["p/plain/plain.icon.ts", "export const Plain = {};\n"]],
      pattern: /must initialise Icon\.define/u,
    },
    {
      files: [["b/broken/broken.icon.ts", "export const Broken = {;\n"]],
      pattern: /Invalid TypeScript catalogue source/u,
    },
    {
      files: [["m/manifest/manifest.icon.ts", iconSource("manifest")]],
      pattern: /collides with a reserved public subpath/u,
    },
    {
      files: [[
        "c/camera/camera.icon.ts",
        'import { Icon } from "@aster/core";\n\nexport const Camera = Icon.define({ identity: { name: "photograph" } });\n',
      ]],
      pattern: /identity must match camera/u,
    },
    {
      files: [[
        "c/camera/camera-filled.icon.ts",
        'import { Icon } from "@aster/core";\n\nexport const CameraFilled = Icon.define({ identity: { name: "camera", variant: "outline" } });\n',
      ]],
      pattern: /identity must match camera@filled/u,
    },
    {
      files: [[
        "c/computed/computed.icon.ts",
        'import { Icon } from "@aster/core";\n\nexport const Computed = Icon.define({ identity: { name: "computed" }, metadata: { displayName: createName(), rtl: "preserve", deprecated: false } });\n',
      ]],
      pattern: /unsupported static catalogue syntax CallExpression/u,
    },
    {
      files: [[
        "c/cyclic/cyclic.icon.ts",
        'import { Icon } from "@aster/core";\n\nconst label = label;\nexport const Cyclic = Icon.define({ identity: { name: "cyclic" }, metadata: { displayName: label, rtl: "preserve", deprecated: false } });\n',
      ]],
      pattern: /cyclic static catalogue reference through label/u,
    },
    {
      files: [[
        "f/foreign/foreign.icon.ts",
        'import { Icon } from "@aster/not-core";\n\nexport const Foreign = Icon.define({ identity: { name: "foreign" }, metadata: { displayName: "Foreign", rtl: "preserve", deprecated: false } });\n',
      ]],
      pattern: /must import Icon from @aster\/core as one runtime named import/u,
    },
    {
      files: [[
        "t/type-only/type-only.icon.ts",
        'import type { Icon } from "@aster/core";\n\nexport const TypeOnly = Icon.define({ identity: { name: "type-only" }, metadata: { displayName: "Type Only", rtl: "preserve", deprecated: false } });\n',
      ]],
      pattern: /must import Icon from @aster\/core as one runtime named import/u,
    },
    {
      files: [["x/camera/camera.icon.ts", iconSource("camera")]],
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
          'import type { AlphaIcon } from "../../../glyphs/a/alpha-icon/alpha-icon.icon.js";',
        ],
        ["AlphaIcon"],
      ),
      "utf8",
    );

    await assert.rejects(
      synchroniseIconsCatalogue(root),
      /collection member AlphaIcon must use a runtime named import/u,
    );
    assert.deepEqual(await readGeneratedOutputs(root), outputs);
  } finally {
    await rm(root, { recursive: true, force: true });
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
    const zetaPath = resolve(root, "src/glyphs/z/zeta/zeta.icon.ts");

    try {
      await synchroniseIconsCatalogue(root);
      const outputs = await readGeneratedOutputs(root);
      await writeFile(
        zetaPath,
        [
          'import { Icon } from "@aster/core";',
          ...fixture.imports,
          "",
          "export const Zeta = Icon.define({",
          '  identity: { namespace: fixtureAuthorship.namespace, name: "zeta" },',
          '  metadata: { displayName: "Zeta", rtl: "preserve", deprecated: false },',
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
