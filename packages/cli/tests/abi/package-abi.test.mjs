import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const workspaceRoot = resolve(packageRoot, "../..");
const distributionRoot = resolve(packageRoot, "dist");
const executableEntry = resolve(distributionRoot, "shell/aster.js");

async function collectDistributionFiles(extension) {
  const entries = await readdir(distributionRoot, { recursive: true });

  return entries
    .filter((entry) => entry.endsWith(extension))
    .map((entry) => resolve(distributionRoot, entry))
    .sort((left, right) => left.localeCompare(right));
}

function extractModuleSpecifiers(source) {
  return [...source.matchAll(/\b(?:from|import)\s*(?:\(\s*)?["']([^"']+)["']/gu)]
    .map((match) => match[1])
    .filter((specifier) => specifier !== undefined);
}

async function readManifest(root) {
  return JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
}

test("exposes the exact documented immutable root value surface", async () => {
  const packageModule = await import("@aster/cli");

  assert.deepEqual(Object.keys(packageModule).sort(), [
    "AsterCatalogue",
    "AsterCommands",
    "catalogueResultKinds",
    "exportTargets",
  ]);
  assert.deepEqual(Object.keys(packageModule.AsterCommands), [
    "identity",
    "descriptors",
    "execute",
  ]);
  assert.deepEqual(Object.keys(packageModule.AsterCatalogue), [
    "identity",
    "load",
  ]);
  assert.deepEqual(packageModule.catalogueResultKinds, {
    icon: "icon",
    collection: "collection",
  });
  assert.ok(Object.isFrozen(packageModule.AsterCommands));
  assert.ok(Object.isFrozen(packageModule.AsterCommands.descriptors));
  assert.ok(Object.isFrozen(packageModule.AsterCatalogue));
  assert.ok(Object.isFrozen(packageModule.catalogueResultKinds));
  assert.deepEqual(packageModule.exportTargets, { svg: "svg" });
  assert.ok(Object.isFrozen(packageModule.exportTargets));
});

test("publishes the accepted root, executable, dependency, and declaration surface", async () => {
  const manifest = await readManifest(packageRoot);
  const rootDeclaration = await readFile(
    resolve(distributionRoot, "index.d.ts"),
    "utf8",
  );
  const distributionEntries = await readdir(distributionRoot, {
    recursive: true,
  });

  assert.deepEqual(Object.keys(manifest.exports), ["."]);
  assert.deepEqual(manifest.exports["."], {
    types: "./dist/index.d.ts",
    import: "./dist/index.js",
  });
  assert.deepEqual(manifest.bin, {
    aster: "./dist/shell/aster.js",
  });
  assert.equal(manifest.main, "./dist/index.js");
  assert.equal(manifest.types, "./dist/index.d.ts");
  assert.equal(manifest.sideEffects, false);
  assert.deepEqual(manifest.files, ["dist"]);
  assert.deepEqual(manifest.dependencies, {
    "@aster/core": "workspace:*",
    "@aster/icons": "workspace:*",
    "@aster/svg": "workspace:*",
  });
  assert.equal(manifest.peerDependencies, undefined);
  assert.equal(manifest.optionalDependencies, undefined);
  assert.equal(
    rootDeclaration,
    [
      'export * from "./api/index.js";',
      'export type * from "./catalogue/index.js";',
      'export { AsterCatalogue, catalogueResultKinds, } from "./catalogue/index.js";',
      'export type * from "./command/index.js";',
      'export { exportTargets } from "./export/index.js";',
      'export type * from "./export/index.js";',
      "",
    ].join("\n"),
  );
  assert.equal(
    distributionEntries.some((entry) => entry.endsWith(".tsbuildinfo")),
    false,
  );
});

test("rejects implementation and executable subpaths through package exports", async () => {
  await assert.rejects(
    import("@aster/cli/command/runtime/command.kernel.js"),
    (error) => error?.code === "ERR_PACKAGE_PATH_NOT_EXPORTED",
  );
  await assert.rejects(
    import("@aster/cli/catalogue/runtime/catalogue.loader.js"),
    (error) => error?.code === "ERR_PACKAGE_PATH_NOT_EXPORTED",
  );
  await assert.rejects(
    import("@aster/cli/shell/aster.js"),
    (error) => error?.code === "ERR_PACKAGE_PATH_NOT_EXPORTED",
  );
});

test("emits host-neutral declarations with only accepted public package imports", async () => {
  const declarations = await collectDistributionFiles(".d.ts");

  assert.ok(declarations.length > 0);

  for (const declaration of declarations) {
    const source = await readFile(declaration, "utf8");
    const externalSpecifiers = extractModuleSpecifiers(source).filter(
      (specifier) => !specifier.startsWith("."),
    );

    assert.deepEqual(
      [...new Set(externalSpecifiers)].sort(),
      [...new Set(externalSpecifiers)]
        .filter((specifier) =>
          specifier === "@aster/core" || specifier === "@aster/svg"
        )
        .sort(),
    );
    assert.doesNotMatch(source, /\/src\/|\\src\\/gu);
    assert.doesNotMatch(source, /\/\/\/\s*<reference/iu);
    assert.doesNotMatch(
      source,
      /\b(?:HTMLElement|SVGElement|Document|Window|Buffer|NodeJS)\b/gu,
    );
    assert.doesNotMatch(
      source,
      /(?:@aster\/build|\blilium\b|\blotus\b|(?:^|[\\/])tooling[\\/]|(?:^|[\\/])plans[\\/])/gimu,
    );
  }
});

test("limits Node process authority and the manifest bridge to the private entrypoint", async () => {
  const modules = await collectDistributionFiles(".js");
  const nodeOwners = [];
  const requireOwners = [];

  assert.ok(modules.length > 0);

  for (const module of modules) {
    const source = await readFile(module, "utf8");
    const modulePath = relative(distributionRoot, module).replaceAll("\\", "/");
    const specifiers = extractModuleSpecifiers(source);
    const nodeSpecifiers = specifiers.filter((specifier) =>
      specifier.startsWith("node:"),
    );
    const externalSpecifiers = specifiers.filter(
      (specifier) => !specifier.startsWith(".") && !specifier.startsWith("node:"),
    );

    if (nodeSpecifiers.length > 0) {
      nodeOwners.push([modulePath, nodeSpecifiers]);
    }

    if (/\brequire\s*\(/gu.test(source)) {
      requireOwners.push(modulePath);
    }

    assert.deepEqual(
      [...new Set(externalSpecifiers)].sort(),
      [...new Set(externalSpecifiers)]
        .filter((specifier) =>
          specifier === "@aster/core" || specifier === "@aster/icons"
          || specifier === "@aster/svg"
        )
        .sort(),
    );
    assert.doesNotMatch(source, /\bmodule\.exports\b/gu);

    if (module !== executableEntry) {
      assert.doesNotMatch(
        source,
        /\bprocess\.(?:argv|stdout|stderr|exitCode)\b/gu,
      );
    }
  }

  assert.deepEqual(nodeOwners, [
    ["shell/aster.js", ["node:module", "node:process"]],
  ]);
  assert.deepEqual(requireOwners, ["shell/aster.js"]);
});

test("preserves the accepted workspace dependency direction", async () => {
  const manifests = Object.fromEntries(
    await Promise.all(
      ["core", "icons", "svg", "build", "cli"].map(async (name) => [
        name,
        await readManifest(resolve(workspaceRoot, "packages", name)),
      ]),
    ),
  );

  assert.equal(manifests.core.dependencies, undefined);
  assert.deepEqual(manifests.icons.dependencies, {
    "@aster/core": "workspace:*",
  });
  assert.deepEqual(manifests.svg.dependencies, {
    "@aster/core": "workspace:*",
  });
  assert.deepEqual(manifests.build.dependencies, {
    "@aster/core": "workspace:*",
    "xmlsax-typescript": "1.0.0",
  });
  assert.deepEqual(manifests.cli.dependencies, {
    "@aster/core": "workspace:*",
    "@aster/icons": "workspace:*",
    "@aster/svg": "workspace:*",
  });

  for (const [name, manifest] of Object.entries(manifests)) {
    if (name !== "cli") {
      assert.equal(manifest.dependencies?.["@aster/cli"], undefined);
    }
  }
});
