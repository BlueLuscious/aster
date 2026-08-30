import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const executeFile = promisify(execFile);
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const workspaceRoot = resolve(packageRoot, "../..");
const distributionRoot = resolve(packageRoot, "dist");

async function collectDistributionFiles(extension) {
  const entries = await readdir(distributionRoot, { recursive: true });

  return entries
    .filter((entry) => entry.endsWith(extension))
    .map((entry) => resolve(distributionRoot, entry))
    .sort((left, right) => left.localeCompare(right));
}

async function collectAllDistributionFiles() {
  const entries = await readdir(distributionRoot, { recursive: true });
  const inspected = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(distributionRoot, entry);

      return (await stat(path)).isFile() ? path : undefined;
    }),
  );

  return inspected.filter((entry) => entry !== undefined).sort();
}

function extractModuleSpecifiers(source) {
  return [...source.matchAll(/\b(?:from|import)\s*(?:\(\s*)?["']([^"']+)["']/gu)]
    .map((match) => match[1])
    .filter((specifier) => specifier !== undefined);
}

function adoptionRequest() {
  return {
    source: {
      format: "svg",
      sourceId: "consumer/check.svg",
      identity: { namespace: "consumer", name: "check" },
      content:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 12h16"/></svg>',
    },
    metadata: {
      displayName: "Check",
      rtl: "preserve",
      presentation: {
        defaults: {
          fill: "none",
          stroke: "currentColor",
        },
        overrides: [],
      },
      deprecated: false,
    },
  };
}

test("imports the exact immutable package root without source files", async () => {
  const packageModule = await import("@aster/import");

  assert.deepEqual(Object.keys(packageModule).sort(), [
    "IconImport",
    "IconImportError",
    "iconImportFormats",
  ]);
  assert.deepEqual(Object.keys(packageModule.IconImport), [
    "inspect",
    "define",
    "emit",
    "adopt",
    "adoptMany",
  ]);
  assert.ok(Object.isFrozen(packageModule.IconImport));
  assert.ok(Object.isFrozen(packageModule.IconImportError));
  assert.ok(Object.isFrozen(packageModule.iconImportFormats));
  assert.equal(packageModule.IconImportError.code, "ASTER-IMPORT-001");
  assert.equal(
    Object.getPrototypeOf(packageModule.IconImportError.prototype),
    TypeError.prototype,
  );
});

test("publishes only the accepted private root and exact dependencies", async () => {
  const manifest = JSON.parse(
    await readFile(resolve(packageRoot, "package.json"), "utf8"),
  );
  const rootDeclaration = await readFile(
    resolve(distributionRoot, "index.d.ts"),
    "utf8",
  );

  assert.equal(manifest.private, true);
  assert.deepEqual(Object.keys(manifest.exports), ["."]);
  assert.equal(manifest.exports["."].import, "./dist/index.js");
  assert.equal(manifest.exports["."].types, "./dist/index.d.ts");
  assert.deepEqual(manifest.dependencies, {
    "@aster/core": "workspace:*",
    "xmlsax-typescript": "1.0.0",
  });
  assert.equal(manifest.sideEffects, false);
  assert.doesNotMatch(rootDeclaration, /xmlsax|node:|runtime|internal/iu);
});

test("rejects implementation and adapter subpaths through package exports", async () => {
  await assert.rejects(
    import("@aster/import/adoption/runtime/icon-adoption.service.js"),
    (error) => error?.code === "ERR_PACKAGE_PATH_NOT_EXPORTED",
  );
  await assert.rejects(
    import("@aster/import/formats/svg/runtime/svg-icon-import.adapter.js"),
    (error) => error?.code === "ERR_PACKAGE_PATH_NOT_EXPORTED",
  );
});

test("emits host-independent declarations and ESM with exact external authorities", async () => {
  const declarations = await collectDistributionFiles(".d.ts");
  const modules = await collectDistributionFiles(".js");

  assert.ok(declarations.length > 0);
  assert.ok(modules.length > 0);

  for (const declaration of declarations) {
    const source = await readFile(declaration, "utf8");
    const externalSpecifiers = extractModuleSpecifiers(source).filter(
      (specifier) => !specifier.startsWith("."),
    );

    assert.deepEqual(
      [...new Set(externalSpecifiers)].sort(),
      [...new Set(externalSpecifiers)].sort().filter(
        (specifier) => specifier === "@aster/core" || specifier === "xmlsax-typescript",
      ),
    );
    assert.doesNotMatch(source, /\/\/\/\s*<reference/iu);
    assert.doesNotMatch(
      source,
      /\b(?:HTMLElement|SVGElement|Document|Window|Buffer|NodeJS)\b/gu,
    );
    assert.doesNotMatch(source, /@aster\/(?:build|cli|icons|svg)|\bnode:/gu);
  }

  for (const module of modules) {
    const source = await readFile(module, "utf8");
    const externalSpecifiers = extractModuleSpecifiers(source).filter(
      (specifier) => !specifier.startsWith("."),
    );

    assert.deepEqual(
      [...new Set(externalSpecifiers)].sort(),
      [...new Set(externalSpecifiers)].sort().filter(
        (specifier) => specifier === "@aster/core" || specifier === "xmlsax-typescript",
      ),
    );
    assert.doesNotMatch(source, /\brequire\s*\(|\bmodule\.exports\b/gu);
    assert.doesNotMatch(source, /@aster\/(?:build|cli|icons|svg)|\bnode:/gu);
  }
});

test("emits only ESM modules and declarations without auxiliary artefacts", async () => {
  const files = await collectAllDistributionFiles();
  const modules = files.filter((file) => file.endsWith(".js"));
  const declarations = files.filter((file) => file.endsWith(".d.ts"));

  assert.ok(files.length > 0);
  assert.equal(files.length, modules.length + declarations.length);
  assert.ok(files.every((file) => file.endsWith(".js") || file.endsWith(".d.ts")));
});

test("compiles and renders an emitted editable module without Import", async (context) => {
  const { IconImport } = await import("@aster/import");
  const adopted = IconImport.adopt(adoptionRequest());
  assert.equal(adopted.successful, true);
  if (!adopted.successful) {
    throw new Error("Expected successful isolated-consumer adoption.");
  }

  const consumerRoot = await mkdtemp(resolve(workspaceRoot, ".aster-import-consumer-"));
  context.after(async () => rm(consumerRoot, { force: true, recursive: true }));

  await writeFile(
    resolve(consumerRoot, "adopted.icon.ts"),
    adopted.value.module.content,
    "utf8",
  );
  await writeFile(
    resolve(consumerRoot, "consumer.ts"),
    [
      'import { Svg } from "@aster/svg";',
      `import { ${adopted.value.module.symbol} } from "./adopted.icon.js";`,
      "",
      `export const definition = ${adopted.value.module.symbol};`,
      `export const markup = Svg.render(${adopted.value.module.symbol});`,
      "",
    ].join("\n"),
    "utf8",
  );
  await writeFile(
    resolve(consumerRoot, "package.json"),
    JSON.stringify({ private: true, type: "module" }, null, 2),
    "utf8",
  );
  await writeFile(
    resolve(consumerRoot, "tsconfig.json"),
    JSON.stringify({
      extends: "../tsconfig.base.json",
      compilerOptions: {
        rootDir: ".",
        outDir: "dist",
      },
      include: ["*.ts"],
    }, null, 2),
    "utf8",
  );

  await executeFile(process.execPath, [
    resolve(workspaceRoot, "node_modules/typescript/bin/tsc"),
    "-p",
    resolve(consumerRoot, "tsconfig.json"),
  ]);

  const compiledIcon = await readFile(
    resolve(consumerRoot, "dist/adopted.icon.js"),
    "utf8",
  );
  assert.doesNotMatch(compiledIcon, /@aster\/import/u);

  const consumer = await import(
    `${pathToFileURL(resolve(consumerRoot, "dist/consumer.js")).href}?abi=1`
  );
  assert.equal(consumer.definition.identity.name, "check");
  assert.match(consumer.markup, /^<svg /u);
  assert.match(consumer.markup, /<path /u);
});
