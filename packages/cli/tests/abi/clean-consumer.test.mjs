import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { findPackageJSON } from "node:module";
import { tmpdir } from "node:os";
import { basename, dirname, relative, resolve } from "node:path";
import process from "node:process";
import test, { after, before } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  AsterCollectionLoaders,
  AsterIconLoaders,
} from "@luscious-garden/aster-icons/dynamic";

const asterIconDefinitions = await Promise.all(
  Object.values(AsterIconLoaders).map((loader) => {
    assert.ok(loader);
    return loader();
  }),
);
const asterCollectionDefinitions = await Promise.all(
  Object.values(AsterCollectionLoaders).map((loader) => {
    assert.ok(loader);
    return loader();
  }),
);

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const workspaceRoot = resolve(packageRoot, "../..");
const packageVersion = JSON.parse(
  await readFile(resolve(packageRoot, "package.json"), "utf8"),
).version;
assert.ok(asterIconDefinitions.length > 0, "Expected the packed icon family to be non-empty.");
assert.ok(
  asterCollectionDefinitions.length > 0,
  "Expected the packed collection family to be non-empty.",
);
const representativeCollection = asterCollectionDefinitions.find(
  (collection) => collection.members.length > 0,
);
assert.ok(
  representativeCollection,
  "Expected one non-empty collection for packed CLI conformance.",
);
const representativeCollectionIdentity = `${
  representativeCollection.identity.namespace === undefined
    ? ""
    : `${representativeCollection.identity.namespace}/`
}${representativeCollection.identity.name}`;
const representativeCollectionLiteral = JSON.stringify(
  representativeCollectionIdentity,
);
const taggedIcon = asterIconDefinitions.find(
  (icon) => (icon.metadata.tags?.length ?? 0) > 0,
);
assert.ok(taggedIcon, "Expected one tagged icon for packed CLI conformance.");
const representativeTag = taggedIcon.metadata.tags?.[0];
assert.ok(representativeTag, "Expected one representative packed icon tag.");
const representativeTagLiteral = JSON.stringify(representativeTag);
const expectedCollectionPaths = Object.freeze(
  representativeCollection.members
    .map(
      (icon) => `${
        icon.identity.namespace === undefined
          ? ""
          : `${icon.identity.namespace}/`
      }${icon.identity.name}${
        icon.identity.variant === undefined ? "" : `@${icon.identity.variant}`
      }.svg`,
    )
    .sort((left, right) => left.localeCompare(right)),
);
let consumerRoot;
let packedPackages;

function runPnpm(arguments_) {
  const options = {
    cwd: workspaceRoot,
    encoding: "utf8",
  };

  if (process.platform !== "win32") {
    return spawnSync("pnpm", arguments_, options);
  }

  const command = [
    "pnpm",
    ...arguments_.map(
      (argument) => `"${argument.replaceAll('"', '""')}"`,
    ),
  ].join(" ");

  return spawnSync(command, { ...options, shell: true });
}

function assertSuccessfulProcess(result, operation) {
  assert.equal(result.error, undefined, `${operation} could not start`);
  assert.equal(
    result.status,
    0,
    `${operation}: stdout=${result.stdout} stderr=${result.stderr}`,
  );
}

async function packPublishedPackage(name, tarballRoot) {
  const packed = runPnpm([
    "--dir",
    resolve(workspaceRoot, "packages", name),
    "pack",
    "--pack-destination",
    tarballRoot,
    "--json",
  ]);

  assertSuccessfulProcess(packed, `pack @luscious-garden/aster-${name}`);

  const artefact = JSON.parse(packed.stdout);

  return Object.freeze({
    filename: basename(artefact.filename),
    files: Object.freeze(artefact.files.map(({ path }) => path)),
  });
}

function runModule(source) {
  return spawnSync(
    process.execPath,
    ["--input-type=module", "--eval", source],
    {
      cwd: consumerRoot,
      encoding: "utf8",
    },
  );
}

function runExecutable(arguments_, cwd = consumerRoot) {
  return spawnSync(
    process.execPath,
    [
      resolve(
        consumerRoot,
        "node_modules",
        "@luscious-garden",
        "aster-cli",
        "dist",
        "shell",
        "aster.js",
      ),
      ...arguments_,
    ],
    {
      cwd,
      encoding: "utf8",
    },
  );
}

async function installedManifestPath(selector) {
  const path = await realpath(resolve(
    consumerRoot,
    "node_modules",
    "@luscious-garden",
    `aster-${selector}`,
    "package.json",
  ));

  assert.match(relative(await realpath(consumerRoot), path), /^node_modules[\\/]/u);
  return path;
}

async function withInstalledManifests(updates, action) {
  const originals = [];

  try {
    for (const [selector, update] of Object.entries(updates)) {
      const path = await installedManifestPath(selector);
      const original = await readFile(path, "utf8");
      originals.push({ path, original });
      const content = typeof update === "string"
        ? update
        : JSON.stringify({ ...JSON.parse(original), ...update });
      await writeFile(path, content, "utf8");
    }

    return await action();
  } finally {
    for (const { path, original } of originals) {
      await writeFile(path, original, "utf8");
    }
  }
}

function assertMetadataFailure(arguments_) {
  const human = runExecutable(arguments_);
  const machine = runExecutable([...arguments_, "--json"]);

  assert.equal(human.status, 1);
  assert.equal(human.stdout, "");
  assert.equal(human.stderr, "[ASTER-CLI-999] standalone shell failed unexpectedly\n");
  assert.equal(machine.status, 1);
  assert.equal(machine.stderr, "");
  const result = JSON.parse(machine.stdout);
  assert.equal(result.ok, false);
  assert.equal(result.command, undefined);
  assert.equal(result.diagnostic.code, "ASTER-CLI-999");
  assert.equal(result.payload, undefined);
  assert.doesNotMatch(machine.stdout, /aster-cli-consumer-|package\.json/u);
}

before(async () => {
  consumerRoot = await mkdtemp(resolve(tmpdir(), "aster-cli-consumer-"));
  const tarballRoot = resolve(consumerRoot, "tarballs");

  await mkdir(tarballRoot, { recursive: true });
  const packageNames = ["core", "icons", "svg", "cli"];
  packedPackages = Object.fromEntries(
    await Promise.all(
      packageNames.map(async (name) => [
        name,
        await packPublishedPackage(name, tarballRoot),
      ]),
    ),
  );
  const packageSpecifications = Object.fromEntries(
    packageNames.map((name) => [
      `@luscious-garden/aster-${name}`,
      `file:./tarballs/${packedPackages[name].filename}`,
    ]),
  );
  await writeFile(
    resolve(consumerRoot, "package.json"),
    `${JSON.stringify({
      private: true,
      type: "module",
      dependencies: packageSpecifications,
      pnpm: { overrides: packageSpecifications },
    })}\n`,
    "utf8",
  );
  await writeFile(resolve(consumerRoot, ".npmrc"), "engine-strict=true\n", "utf8");
  const installed = runPnpm([
    "--dir",
    consumerRoot,
    "install",
    "--offline",
    "--ignore-scripts",
    "--package-import-method=copy",
    "--frozen-lockfile=false",
  ]);

  assertSuccessfulProcess(installed, "install packed Aster packages");
});

after(async () => {
  await rm(consumerRoot, { recursive: true, force: true });
});

test("installs independent package versions with bounded public dependency ranges", async () => {
  const expectedDependencies = {
    core: undefined,
    icons: { "@luscious-garden/aster-core": "^0.1.0-rc.1" },
    svg: { "@luscious-garden/aster-core": "^0.1.0-rc.1" },
    cli: {
      "@luscious-garden/aster-core": "^0.1.0-rc.1",
      "@luscious-garden/aster-icons": "^0.1.0-rc.1",
      "@luscious-garden/aster-svg": "^0.1.0-rc.1",
    },
  };

  for (const [name, dependencies] of Object.entries(expectedDependencies)) {
    const manifest = JSON.parse(await readFile(
      resolve(consumerRoot, "node_modules", "@luscious-garden", `aster-${name}`, "package.json"),
      "utf8",
    ));

    assert.equal(manifest.version, "0.1.0-rc.1");
    assert.deepEqual(manifest.dependencies, dependencies);
    assert.equal(
      manifest.homepage,
      `https://github.com/BlueLuscious/aster/tree/master/packages/${name}#readme`,
    );
  }
});

test("installs only accepted public package files and notices", async () => {
  const names = (await readdir(resolve(consumerRoot, "node_modules", "@luscious-garden")))
    .sort((left, right) => left.localeCompare(right));

  assert.deepEqual(names, ["aster-cli", "aster-core", "aster-icons", "aster-svg"]);

  for (const packageName of names) {
    const name = packageName.slice("aster-".length);
    const files = packedPackages[name].files;

    assert.ok(files.includes("package.json"), `Missing ${name} manifest.`);
    assert.ok(files.includes("README.md"), `Missing ${name} README.`);
    assert.ok(files.includes("LICENSE"), `Missing ${name} software notice.`);
    assert.equal(files.includes("ARTWORK-LICENCE.md"), name === "icons");
    assert.ok(files.some((file) => file.endsWith(".d.ts")));
    const readme = await readFile(
      resolve(
        consumerRoot,
        "node_modules",
        "@luscious-garden",
        packageName,
        "README.md",
      ),
      "utf8",
    );

    assert.ok(!readme.includes("/blob/develop/"), `Stale ${name} README branch link.`);
    assert.ok(readme.includes("/blob/master/"), `Missing ${name} release branch link.`);
    const unexpected = files.filter((file) => !(
      file.startsWith("dist/") || [
        "package.json",
        "README.md",
        "LICENSE",
        "ARTWORK-LICENCE.md",
      ].includes(file)
    ));
    assert.deepEqual(unexpected, [], `Unexpected ${name} package content.`);
  }
});

test("executes packaged README examples through packed package entrypoints", async () => {
  const examples = [
    {
      name: "core",
      result: 'Camera.identity.name === "camera" && InterfaceIcons.icons.camera === Camera && InterfaceIcons.members[0] === Camera',
    },
    {
      name: "icons",
      result: 'markup.startsWith("<svg ") && cameraMarkup.startsWith("<svg ") && collectionMarkup.length === AmellusCollection.members.length && collectionMarkup.every((entry) => entry.startsWith("<svg "))',
    },
    { name: "svg", result: 'markup.includes("<circle ")' },
  ];

  for (const { name, result } of examples) {
    const readme = await readFile(
      resolve(consumerRoot, "node_modules", "@luscious-garden", `aster-${name}`, "README.md"),
      "utf8",
    );
    const sources = Array.from(
      readme.matchAll(/```ts\r?\n([\s\S]*?)\r?\n```/gu),
      (match) => match[1],
    );

    assert.ok(sources.length > 0, `Missing executable ${name} README example.`);
    assert.ok(!readme.includes("../../docs/"), `Broken ${name} package documentation link.`);

    const source = sources.join("\n\n");
    const executed = runModule(`${source}\nif (!(${result})) throw new Error("README example failed");`);

    assert.equal(executed.status, 0, `${name}: ${executed.stderr}`);
    assert.equal(executed.stderr, "");
  }

  const rootReadme = await readFile(resolve(workspaceRoot, "README.md"), "utf8");
  const rootSource = rootReadme.match(/```ts\r?\n([\s\S]*?)\r?\n```/)?.[1];
  assert.ok(rootSource, "Missing root README example.");
  const executed = runModule(`${rootSource}\nif (!markup.startsWith("<svg ")) throw new Error("Root README example failed");`);
  assert.equal(executed.status, 0, executed.stderr);
  assert.equal(executed.stderr, "");
});

test("composes packed Core, Icons, and SVG through public consumer entrypoints", () => {
  const baseIcon = asterIconDefinitions.find(
    (icon) => icon.identity.variant === undefined,
  );
  const collection = asterCollectionDefinitions[0];
  assert.ok(baseIcon, "Expected one packed base icon.");
  assert.ok(collection, "Expected one packed collection.");

  const executed = runModule([
    'import { Icon } from "@luscious-garden/aster-core";',
    'import { AsterIconManifest, AsterCollectionManifest } from "@luscious-garden/aster-icons/manifest";',
    'import { AsterIconLoaders, AsterCollectionLoaders } from "@luscious-garden/aster-icons/dynamic";',
    'import { Svg } from "@luscious-garden/aster-svg";',
    "const iconEntry = AsterIconManifest.find(({ identity }) => identity.variant === undefined);",
    "const collectionEntry = AsterCollectionManifest[0];",
    'if (!iconEntry || !collectionEntry) throw new Error("Missing packed catalogue entries");',
    "const icon = await AsterIconLoaders[iconEntry.key]();",
    "const collection = await AsterCollectionLoaders[collectionEntry.key]();",
    "const directIcon = await import(`@luscious-garden/aster-icons/${iconEntry.identity.name}`);",
    "const directCollection = await import(`@luscious-garden/aster-icons/collections/${collectionEntry.identity.name}`);",
    "const rebuilt = Icon.define(icon);",
    "const markup = Svg.render(rebuilt);",
    "process.stdout.write(JSON.stringify({",
    "  icon: iconEntry.key,",
    "  collection: collectionEntry.key,",
    "  exactIcon: directIcon[iconEntry.symbol] === icon,",
    "  exactCollection: directCollection[collectionEntry.symbol] === collection,",
    "  rebuilt: JSON.stringify(rebuilt) === JSON.stringify(icon),",
    '  svg: markup.startsWith("<svg ") && markup.endsWith("</svg>"),',
    "}));",
  ].join("\n"));

  assert.equal(executed.status, 0, executed.stderr);
  assert.equal(executed.stderr, "");
  assert.deepEqual(JSON.parse(executed.stdout), {
    icon: `${baseIcon.identity.namespace === undefined
      ? ""
      : `${baseIcon.identity.namespace}/`}${baseIcon.identity.name}`,
    collection: `${collection.identity.namespace === undefined
      ? ""
      : `${collection.identity.namespace}/`}${collection.identity.name}`,
    exactIcon: true,
    exactCollection: true,
    rebuilt: true,
    svg: true,
  });
});

test("preserves canonical ownership across packed authoring and command boundaries", () => {
  const executed = runModule([
    'import { Collection, Icon } from "@luscious-garden/aster-core";',
    'import { AsterIconManifest } from "@luscious-garden/aster-icons/manifest";',
    'import { AsterIconLoaders } from "@luscious-garden/aster-icons/dynamic";',
    'import { Svg } from "@luscious-garden/aster-svg";',
    'import { AsterCatalogue, AsterCommands } from "@luscious-garden/aster-cli";',
    "const entry = AsterIconManifest[0];",
    'if (entry === undefined) throw new Error("Missing packed icon entry.");',
    "const source = await AsterIconLoaders[entry.key]();",
    "const authored = structuredClone(source);",
    "const canonical = Icon.define(authored);",
    "const collection = Collection.define({",
    '  identity: { name: "packed-ownership" },',
    "  icons: { probe: canonical },",
    '  metadata: { displayName: "Packed Ownership" },',
    "});",
    "const markup = Svg.render(canonical);",
    'authored.identity.name = "changed";',
    'authored.nodes[0].kind = "changed";',
    'authored.nodes.push({ kind: "circle", cx: 12, cy: 12, radius: 2 });',
    'authored.metadata.displayName = "Changed";',
    "const result = await AsterCommands.execute(",
    '  { command: "export", subject: "icon", identity: entry.key },',
    '  { catalogues: [AsterCatalogue], productName: "Aster", productVersion: "0.0.0" },',
    ");",
    'if (!result.ok) throw new Error("Packed export failed.");',
    "process.stdout.write(JSON.stringify({",
    "  isolated: canonical.identity.name === source.identity.name",
    "    && canonical.nodes.length === source.nodes.length",
    "    && canonical.nodes[0].kind === source.nodes[0].kind",
    "    && canonical.metadata.displayName === source.metadata.displayName,",
    "  frozen: Object.isFrozen(canonical) && Object.isFrozen(canonical.nodes)",
    "    && Object.isFrozen(canonical.nodes[0]) && Object.isFrozen(canonical.metadata),",
    "  retained: collection.icons.probe === canonical && collection.members[0] === canonical,",
    "  membershipFrozen: Object.isFrozen(collection.icons) && Object.isFrozen(collection.members),",
    "  manifestFrozen: Object.isFrozen(AsterIconManifest) && Object.isFrozen(entry),",
    "  rendered: Svg.render(canonical) === markup && markup.startsWith('<svg '),",
    "  planFrozen: Object.isFrozen(result.payload.plan)",
    "    && Object.isFrozen(result.payload.plan.artefacts)",
    "    && Object.isFrozen(result.payload.plan.artefacts[0]),",
    "}));",
  ].join("\n"));

  assert.equal(executed.status, 0, executed.stderr);
  assert.equal(executed.stderr, "");
  assert.deepEqual(JSON.parse(executed.stdout), {
    isolated: true,
    frozen: true,
    retained: true,
    membershipFrozen: true,
    manifestFrozen: true,
    rendered: true,
    planFrozen: true,
  });
});

test("type-checks cross-package usage against packed declarations", async () => {
  await writeFile(resolve(consumerRoot, "consumer.ts"), [
    'import type { IconDefinition } from "@luscious-garden/aster-core";',
    'import { Collection } from "@luscious-garden/aster-core";',
    'import { AsterIconManifest } from "@luscious-garden/aster-icons/manifest";',
    'import { AsterIconLoaders } from "@luscious-garden/aster-icons/dynamic";',
    'import { Svg } from "@luscious-garden/aster-svg";',
    'import { AsterCatalogue, AsterCommands } from "@luscious-garden/aster-cli";',
    "const entry = AsterIconManifest[0];",
    'if (entry === undefined) throw new Error("Missing icon");',
    "const loader = AsterIconLoaders[entry.key];",
    'if (loader === undefined) throw new Error("Missing loader");',
    "const icon: IconDefinition = await loader();",
    "const authored = {",
    "  ...icon,",
    '  nodes: [{ kind: "circle", cx: 12, cy: 12, radius: 4 }],',
    '  metadata: { ...icon.metadata, displayName: "  Packed Icon  " },',
    "} satisfies IconDefinition;",
    "const collectionInput = {",
    '  identity: { name: "packed-authored" },',
    "  icons: { probe: authored },",
    '  metadata: { displayName: "Packed Authored" },',
    "};",
    "const collection = Collection.define(collectionInput);",
    "const literalCollection = Collection.define({",
    "  ...collectionInput,",
    "  icons: {",
    "    probe: {",
    "      ...authored,",
    '      metadata: { ...authored.metadata, displayName: "  Packed Icon  " as const },',
    "    },",
    "  },",
    "});",
    "const canonicalMember: IconDefinition = collection.icons.probe;",
    "const optionalAliases: { probe?: IconDefinition } = {};",
    "const optionalCollection = Collection.define({",
    '  identity: { name: "packed-optional" },',
    "  icons: optionalAliases,",
    '  metadata: { displayName: "Packed Optional" },',
    "});",
    "const optionalMember: IconDefinition | undefined = optionalCollection.icons.probe;",
    "if (false) {",
    "  // @ts-expect-error Optional aliases remain optional in packed declarations.",
    "  const requiredMember: IconDefinition = optionalCollection.icons.probe;",
    "  // @ts-expect-error Packed canonical nodes are readonly despite mutable authoring.",
    '  collection.icons.probe.nodes.push({ kind: "circle", cx: 6, cy: 6, radius: 2 });',
    "  // @ts-expect-error Packed canonical metadata is readonly despite mutable authoring.",
    '  collection.icons.probe.metadata.displayName = "Changed";',
    "  // @ts-expect-error Normalised output cannot retain the authored metadata literal.",
    '  const authoredLiteral: "  Packed Icon  " = literalCollection.icons.probe.metadata.displayName;',
    "  // @ts-expect-error Packed canonical membership still rejects unknown aliases.",
    "  collection.icons.unknown;",
    "  void authoredLiteral;",
    "  void requiredMember;",
    "}",
    "void canonicalMember;",
    "void optionalMember;",
    "export const markup: string = Svg.render(icon);",
    "export const listed = await AsterCommands.execute(",
    '  { command: "list", subject: "catalogues" },',
    '  { catalogues: [AsterCatalogue], productName: "Aster", productVersion: "0.1.0-rc.1" },',
    ");",
    "",
  ].join("\n"), "utf8");
  await writeFile(resolve(consumerRoot, "tsconfig.json"), `${JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      module: "NodeNext",
      moduleResolution: "NodeNext",
      strict: true,
      noEmit: true,
      types: [],
    },
    include: ["consumer.ts"],
  })}\n`, "utf8");

  const checked = spawnSync(process.execPath, [
    resolve(workspaceRoot, "node_modules/typescript/bin/tsc"),
    "-p",
    resolve(consumerRoot, "tsconfig.json"),
  ], { cwd: consumerRoot, encoding: "utf8" });

  assertSuccessfulProcess(checked, "type-check packed Aster packages");
});

test("keeps private package internals outside the packed consumer", () => {
  const executed = runModule([
    "const specifiers = [",
    '  "@luscious-garden/aster-core/definition/runtime/icon-definition.factory.js",',
    '  "@luscious-garden/aster-icons",',
    '  "@luscious-garden/aster-icons/collections",',
    '  "@luscious-garden/aster-svg/render/runtime/svg-markup.serialiser.js",',
    '  "@luscious-garden/aster-cli/shell/aster.js",',
    '  "@luscious-garden/aster-import",',
    "];",
    "const codes = [];",
    "for (const specifier of specifiers) {",
    "  try { await import(specifier); codes.push('accepted'); }",
    "  catch (error) { codes.push(error.code); }",
    "}",
    "process.stdout.write(JSON.stringify(codes));",
  ].join("\n"));

  assert.equal(executed.status, 0, executed.stderr);
  assert.equal(executed.stderr, "");
  assert.deepEqual(JSON.parse(executed.stdout), [
    "ERR_PACKAGE_PATH_NOT_EXPORTED",
    "ERR_PACKAGE_PATH_NOT_EXPORTED",
    "ERR_PACKAGE_PATH_NOT_EXPORTED",
    "ERR_PACKAGE_PATH_NOT_EXPORTED",
    "ERR_PACKAGE_PATH_NOT_EXPORTED",
    "ERR_MODULE_NOT_FOUND",
  ]);
});

test("imports the public package without source files or observable effects", () => {
  const imported = runModule('await import("@luscious-garden/aster-cli");');
  const inspected = runModule([
    'import * as AsterCli from "@luscious-garden/aster-cli";',
    "process.stdout.write(JSON.stringify(Object.keys(AsterCli).sort()));",
  ].join("\n"));

  assert.equal(imported.status, 0);
  assert.equal(imported.stdout, "");
  assert.equal(imported.stderr, "");
  assert.equal(inspected.status, 0);
  assert.equal(inspected.stderr, "");
  assert.deepEqual(JSON.parse(inspected.stdout), [
    "AsterCatalogue",
    "AsterCommands",
    "catalogueResultKinds",
    "exportTargets",
    "reviewSubjects",
    "reviewTargets",
  ]);
});

test("links and executes the packed CLI binary through the package manager", () => {
  const linked = runPnpm(["--dir", consumerRoot, "exec", "aster", "version"]);

  assertSuccessfulProcess(linked, "execute linked Aster binary");
  assert.equal(linked.stdout, `Aster ${packageVersion}\n`);
});

test("reports independently versioned packages resolved from the packed executable", async () => {
  const versions = Object.freeze({
    core: "0.2.4",
    icons: "0.3.1",
    svg: "0.9.0-rc.2",
    cli: "0.1.7",
  });
  const packages = Object.entries(versions).map(([selector, version]) => ({
    name: `@luscious-garden/aster-${selector}`,
    version,
  }));
  const packedExecutable = await realpath(resolve(
    consumerRoot,
    "node_modules",
    "@luscious-garden",
    "aster-cli",
    "dist",
    "shell",
    "aster.js",
  ));

  await withInstalledManifests(
    Object.fromEntries(Object.entries(versions).map(([selector, version]) => [
      selector,
      { version },
    ])),
    async () => {
      for (const selector of Object.keys(versions)) {
        assert.equal(
          await realpath(findPackageJSON(
            `@luscious-garden/aster-${selector}`,
            pathToFileURL(packedExecutable).href,
          )),
          await installedManifestPath(selector),
        );
      }

      const all = runExecutable(["version", "--all", "--json"]);
      assertSuccessfulProcess(all, "report packed package versions as JSON");
      assert.equal(all.stderr, "");
      assert.deepEqual(JSON.parse(all.stdout), {
        ok: true,
        command: "version",
        payload: { kind: "package-versions", packages },
      });

      const human = runExecutable(["version", "--all"], workspaceRoot);
      assertSuccessfulProcess(human, "report packed package versions outside the consumer");
      assert.equal(human.stderr, "");
      assert.equal(human.stdout, [
        "Installed Aster packages:",
        ...packages.map(({ name, version }) => `  ${name} ${version}`),
        "",
      ].join("\n"));

      for (const [selector, version] of Object.entries(versions)) {
        const name = `@luscious-garden/aster-${selector}`;
        const named = runExecutable(["version", selector]);
        const namedJson = runExecutable(["version", selector, "--json"]);
        assertSuccessfulProcess(named, `report packed ${selector} version`);
        assertSuccessfulProcess(namedJson, `report packed ${selector} version as JSON`);
        assert.equal(named.stdout, `${name} ${version}\n`);
        assert.equal(named.stderr, "");
        assert.equal(namedJson.stderr, "");
        assert.deepEqual(JSON.parse(namedJson.stdout), {
          ok: true,
          command: "version",
          payload: {
            kind: "package-versions",
            packages: [{ name, version }],
          },
        });
      }

      const plain = runExecutable(["version"]);
      const plainJson = runExecutable(["version", "--json"]);
      assertSuccessfulProcess(plain, "report packed CLI product version");
      assertSuccessfulProcess(plainJson, "report packed CLI product version as JSON");
      assert.equal(plain.stdout, `Aster ${versions.cli}\n`);
      assert.equal(plain.stderr, "");
      assert.deepEqual(JSON.parse(plainJson.stdout), {
        ok: true,
        command: "version",
        payload: {
          kind: "version",
          productName: "Aster",
          productVersion: versions.cli,
        },
      });

      const linked = runPnpm(["--dir", consumerRoot, "exec", "aster", "version", "--all"]);
      assertSuccessfulProcess(linked, "report installed versions through linked Aster binary");
      assert.equal(linked.stdout, human.stdout);
    },
  );
});

test("fails atomically for damaged installed metadata after startup", async () => {
  await withInstalledManifests({ icons: "{broken" }, async () => {
    assertMetadataFailure(["version", "icons"]);
    assertMetadataFailure(["version", "--all"]);
    assertSuccessfulProcess(runExecutable(["version", "core"]), "read unaffected Core metadata");
    assertSuccessfulProcess(runExecutable(["version"]), "read plain CLI version");
  });

  await withInstalledManifests({ svg: { name: "@luscious-garden/other" } }, async () => {
    assertMetadataFailure(["version", "svg"]);
    assertMetadataFailure(["version", "--all"]);
  });

  const manifest = await installedManifestPath("icons");
  const hidden = `${manifest}.missing`;
  await rename(manifest, hidden);
  try {
    assertMetadataFailure(["version", "icons"]);
    assertMetadataFailure(["version", "--all"]);
  } finally {
    await rename(hidden, manifest);
  }
});

test("leaves missing pre-bootstrap dependencies to native Node errors", async () => {
  const root = await mkdtemp(resolve(tmpdir(), "aster-cli-native-"));
  const packagesRoot = resolve(root, "node_modules", "@luscious-garden");

  try {
    await mkdir(packagesRoot, { recursive: true });
    await cp(await realpath(resolve(
      consumerRoot,
      "node_modules",
      "@luscious-garden",
      "aster-cli",
    )), resolve(packagesRoot, "aster-cli"), { recursive: true });
    const entrypoint = resolve(packagesRoot, "aster-cli", "dist", "shell", "aster.js");
    const execute = () => spawnSync(process.execPath, [entrypoint, "version"], {
      cwd: root,
      encoding: "utf8",
    });

    const withoutCore = execute();
    assert.equal(withoutCore.status, 1);
    assert.equal(withoutCore.stdout, "");
    assert.match(withoutCore.stderr, /ERR_MODULE_NOT_FOUND/u);
    assert.match(withoutCore.stderr, /@luscious-garden\/aster-core/u);
    assert.doesNotMatch(withoutCore.stderr, /ASTER-CLI-999/u);

    await cp(await realpath(resolve(
      consumerRoot,
      "node_modules",
      "@luscious-garden",
      "aster-core",
    )), resolve(packagesRoot, "aster-core"), { recursive: true });

    const withoutSvg = execute();
    assert.equal(withoutSvg.status, 1);
    assert.equal(withoutSvg.stdout, "");
    assert.match(withoutSvg.stderr, /ERR_MODULE_NOT_FOUND/u);
    assert.match(withoutSvg.stderr, /@luscious-garden\/aster-svg/u);
    assert.doesNotMatch(withoutSvg.stderr, /ASTER-CLI-999/u);
  } finally {
    assert.match(relative(resolve(tmpdir()), resolve(root)), /^aster-cli-native-[^\\/]+$/u);
    await rm(root, { recursive: true, force: true });
  }
});

test("keeps packed version requests free of icon and network imports", async () => {
  const guardPath = resolve(consumerRoot, "version-import-guard.mjs");
  await writeFile(guardPath, [
    'import { registerHooks } from "node:module";',
    "const blocked = /^(?:@luscious-garden\\/aster-icons(?:\\/|$)|node:(?:http|https|net|tls|dns|dgram)(?:\\/|$))/u;",
    "registerHooks({",
    "  resolve(specifier, context, nextResolve) {",
    "    if (blocked.test(specifier)) throw new Error(`Unexpected version dependency ${specifier}`);",
    "    return nextResolve(specifier, context);",
    "  },",
    "});",
    'globalThis.fetch = () => { throw new Error("Unexpected version fetch"); };',
    "",
  ].join("\n"), "utf8");

  for (const arguments_ of [
    ["version"],
    ["version", "icons"],
    ["version", "--all"],
    ["version", "--all", "--json"],
  ]) {
    const result = spawnSync(process.execPath, [
      "--import",
      pathToFileURL(guardPath).href,
      resolve(consumerRoot, "node_modules", "@luscious-garden", "aster-cli", "dist", "shell", "aster.js"),
      ...arguments_,
    ], { cwd: consumerRoot, encoding: "utf8" });

    assertSuccessfulProcess(result, `execute guarded ${arguments_.join(" ")}`);
    assert.equal(result.stderr, "");
  }
});

test("returns the same result through the executable and an independent plugin host", () => {
  const executable = runExecutable([
    "list",
    "icons",
    "--tag",
    representativeTag,
    "--json",
  ]);
  const programmatic = runModule([
    'import { AsterCatalogue, AsterCommands } from "@luscious-garden/aster-cli";',
    "const plugins = new Map([[AsterCommands.identity, AsterCommands]]);",
    'const plugin = plugins.get("aster");',
    "if (plugin === undefined) throw new TypeError(\"Missing Aster plugin\");",
    "const result = await plugin.execute(",
    `  { command: "list", subject: "icons", tags: [${representativeTagLiteral}] },`,
    "  {",
    "    catalogues: [AsterCatalogue],",
    '    productName: "Aster",',
    '    productVersion: "0.0.0",',
    "  },",
    ");",
    "process.stdout.write(`${JSON.stringify(result)}\\n`);",
  ].join("\n"));

  assert.equal(executable.status, 0);
  assert.equal(executable.stderr, "");
  assert.equal(programmatic.status, 0);
  assert.equal(programmatic.stderr, "");
  assert.equal(programmatic.stdout, executable.stdout);
  assert.ok(JSON.parse(executable.stdout).payload.icons.length > 0);
});

test("returns the same complete export through standalone and programmatic hosts", () => {
  const executable = runExecutable([
    "export",
    "collection",
    representativeCollectionIdentity,
    "--size",
    "32",
    "--colour",
    "#123456",
    "--direction",
    "rtl",
    "--json",
  ]);
  const programmatic = runModule([
    'import { AsterCatalogue, AsterCommands } from "@luscious-garden/aster-cli";',
    "const plugins = new Map([[AsterCommands.identity, AsterCommands]]);",
    'const plugin = plugins.get("aster");',
    'if (plugin === undefined) throw new TypeError("Missing Aster plugin");',
    "const result = await plugin.execute(",
    "  {",
    '    command: "export",',
    '    subject: "collection",',
    `    identity: ${representativeCollectionLiteral},`,
    "    options: {",
    "      size: 32,",
    '      colour: "#123456",',
    '      direction: "rtl",',
    "    },",
    "  },",
    "  {",
    "    catalogues: [AsterCatalogue],",
    '    productName: "Aster",',
    '    productVersion: "0.0.0",',
    "  },",
    ");",
    "process.stdout.write(`${JSON.stringify(result)}\\n`);",
  ].join("\n"));

  assert.equal(executable.status, 0);
  assert.equal(executable.stderr, "");
  assert.equal(programmatic.status, 0);
  assert.equal(programmatic.stderr, "");
  assert.equal(programmatic.stdout, executable.stdout);

  const result = JSON.parse(executable.stdout);

  assert.equal(
    result.payload.plan.artefacts.length,
    expectedCollectionPaths.length,
  );
  assert.deepEqual(
    result.payload.plan.artefacts.map((artefact) => artefact.path),
    expectedCollectionPaths,
  );
  assert.ok(result.payload.plan.artefacts.every((artefact) =>
    artefact.content.match(/data-rendered-by="Aster"/gu)?.length === 1
  ));
});

test("returns and publishes a complete review from the clean consumer", async () => {
  const executable = runExecutable([
    "review",
    "collection",
    representativeCollectionIdentity,
    "--json",
  ]);
  const programmatic = runModule([
    'import { AsterCatalogue, AsterCommands } from "@luscious-garden/aster-cli";',
    "const result = await AsterCommands.execute(",
    "  {",
    '    command: "review",',
    '    subject: "collection",',
    `    identity: ${representativeCollectionLiteral},`,
    "  },",
    "  {",
    "    catalogues: [AsterCatalogue],",
    '    productName: "Aster",',
    '    productVersion: "0.0.0",',
    "  },",
    ");",
    "process.stdout.write(`${JSON.stringify(result)}\n`);",
  ].join("\n"));

  assert.equal(executable.status, 0);
  assert.equal(executable.stderr, "");
  assert.equal(programmatic.status, 0);
  assert.equal(programmatic.stderr, "");
  assert.equal(programmatic.stdout, executable.stdout);

  const published = runExecutable([
    "review",
    "collection",
    representativeCollectionIdentity,
    "--output",
    "review",
  ]);

  assert.equal(published.status, 0);
  assert.equal(published.stderr, "");

  const document = await readFile(
    resolve(consumerRoot, "review", "index.html"),
    "utf8",
  );
  const plan = JSON.parse(executable.stdout).payload.plan;

  assert.match(
    document,
    /<meta name="aster-review-document" content="1">/u,
  );
  assert.doesNotMatch(document, /<script|https?:\/\/(?!www\.w3\.org\/2000\/svg)/u);

  assert.equal(plan.document.icons.length, expectedCollectionPaths.length);
  assert.ok(plan.document.icons.every((icon) =>
    icon.markup.match(/data-rendered-by="Aster"/gu)?.length === 1
  ));

  for (const path of expectedCollectionPaths) {
    assert.ok(document.includes(path.slice(0, -4)));
  }
});

test("publishes the complete planned collection from the clean consumer", async () => {
  const planned = runExecutable([
    "export",
    "collection",
    representativeCollectionIdentity,
    "--size",
    "20",
    "--json",
  ]);
  const published = runExecutable([
    "export",
    "collection",
    representativeCollectionIdentity,
    "--size",
    "20",
    "--output",
    "published",
  ]);

  assert.equal(planned.status, 0);
  assert.equal(planned.stderr, "");
  assert.equal(published.status, 0);
  assert.equal(published.stderr, "");

  const artefacts = JSON.parse(planned.stdout).payload.plan.artefacts;
  const publishedRoot = resolve(consumerRoot, "published");
  const publishedPaths = (await readdir(publishedRoot, { recursive: true }))
    .filter((entry) => entry.endsWith(".svg"))
    .map((entry) => entry.replaceAll("\\", "/"))
    .sort((left, right) => left.localeCompare(right));

  assert.deepEqual(
    publishedPaths,
    artefacts.map((artefact) => artefact.path),
  );

  for (const artefact of artefacts) {
    assert.equal(
      await readFile(resolve(publishedRoot, artefact.path), "utf8"),
      artefact.content,
    );
  }
});

test("requires explicit catalogues and canonicalises provider registration order", () => {
  const execution = runModule([
    'import { AsterCommands } from "@luscious-garden/aster-cli";',
    "const counts = { alpha: 0, beta: 0 };",
    "const provider = (identity) => ({",
    "  identity,",
    "  async discover() {",
    "    counts[identity] += 1;",
    "    return { icons: [], collections: [] };",
    "  },",
    "  async loadIcon() { return undefined; },",
    "  async loadCollection() { return undefined; },",
    "});",
    "const alpha = provider(\"alpha\");",
    "const beta = provider(\"beta\");",
    "const invoke = (catalogues) => AsterCommands.execute(",
    '  { command: "list", subject: "catalogues" },',
    "  {",
    "    catalogues,",
    '    productName: "Aster",',
    '    productVersion: "0.0.0",',
    "  },",
    ");",
    "const empty = await invoke([]);",
    "const first = await invoke([beta, alpha]);",
    "const second = await invoke([alpha, beta]);",
    "process.stdout.write(JSON.stringify({ counts, empty, first, second }));",
  ].join("\n"));

  assert.equal(execution.status, 0);
  assert.equal(execution.stderr, "");

  const { counts, empty, first, second } = JSON.parse(execution.stdout);

  assert.deepEqual(counts, { alpha: 2, beta: 2 });
  assert.deepEqual(empty.payload.catalogues, []);
  assert.deepEqual(first, second);
  assert.deepEqual(
    first.payload.catalogues.map((catalogue) => catalogue.identity),
    ["alpha", "beta"],
  );
});
