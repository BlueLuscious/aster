import assert from "node:assert/strict";
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
import {
  dirname,
  join,
  relative,
  resolve,
} from "node:path";
import {
  fileURLToPath,
  pathToFileURL,
} from "node:url";
import test from "node:test";

import type { IconDefinition } from "@aster/core";
import type { IGenerationPlan } from "../../src/generator/contracts/internal/generation-plan.contract.js";
import type { IGenerationRequest } from "../../src/generator/contracts/internal/generation-request.contract.js";
import { GenerationPlanner } from "../../src/generator/runtime/generation.planner.js";
import * as typescript from "typescript";

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const fixtureRoot = resolve(
  repositoryRoot,
  "packages/build/tests/fixtures/generator/experimental-package",
);
const definitionFixturePath = resolve(
  repositoryRoot,
  "tests/fixtures/collections/experimental/expected/definitions.normalised.json",
);
const planner = new GenerationPlanner();

async function generationPlan(): Promise<IGenerationPlan> {
  const definitions = JSON.parse(
    await readFile(definitionFixturePath, "utf8"),
  ) as readonly IconDefinition[];
  const request: IGenerationRequest = {
    collectionSourceId:
      "collections/experimental/metadata/collection.json",
    collection: "experimental",
    package: {
      name: "@aster/experimental",
      version: "0.0.0",
      description:
        "Experimental portable icon definitions for Aster.",
      licence: "CC-BY-4.0",
    },
    entries: definitions.map((definition) => ({
      sourceIds: [
        `collections/experimental/metadata/${definition.identity.name}.json`,
        `collections/experimental/svg/${definition.identity.name}.svg`,
      ],
      definition,
    })),
  };
  const result = planner.plan(request);

  assert.equal(result.successful, true);

  if (!result.successful) {
    throw new Error("Expected a successful experimental generation plan.");
  }

  return result.value;
}

async function materialisePlan(
  packageRoot: string,
  plan: IGenerationPlan,
): Promise<void> {
  for (const file of plan.files) {
    const target = resolve(packageRoot, file.path);

    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, file.content, "utf8");
  }
}

async function collectTextFiles(root: string): Promise<Map<string, string>> {
  const files = new Map<string, string>();

  async function visit(directory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });

    for (const entry of entries.sort((left, right) =>
      left.name < right.name ? -1 : left.name > right.name ? 1 : 0,
    )) {
      const target = resolve(directory, entry.name);

      if (entry.isDirectory()) {
        await visit(target);
      } else if (entry.isFile()) {
        files.set(
          relative(root, target).replaceAll("\\", "/"),
          await readFile(target, "utf8"),
        );
      }
    }
  }

  await visit(root);
  return files;
}

async function installCoreDependency(packageRoot: string): Promise<void> {
  const coreRoot = resolve(repositoryRoot, "packages/core");
  const installedCoreRoot = resolve(
    packageRoot,
    "node_modules/@aster/core",
  );

  await mkdir(installedCoreRoot, { recursive: true });
  await cp(
    resolve(coreRoot, "dist"),
    resolve(installedCoreRoot, "dist"),
    { recursive: true },
  );
  await cp(
    resolve(coreRoot, "package.json"),
    resolve(installedCoreRoot, "package.json"),
  );
}

function compilePackage(configurationPath: string): void {
  const loaded = typescript.readConfigFile(
    configurationPath,
    typescript.sys.readFile,
  );

  assert.equal(loaded.error, undefined);

  const parsed = typescript.parseJsonConfigFileContent(
    loaded.config,
    typescript.sys,
    dirname(configurationPath),
    undefined,
    configurationPath,
  );
  const program = typescript.createProgram(
    parsed.fileNames,
    parsed.options,
  );
  const emitted = program.emit();
  const diagnostics = [
    ...typescript.getPreEmitDiagnostics(program),
    ...emitted.diagnostics,
  ];

  assert.deepEqual(
    diagnostics.map((diagnostic) =>
      typescript.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n",
      ),
    ),
    [],
  );
  assert.equal(parsed.options.target, typescript.ScriptTarget.ES2022);
  assert.doesNotMatch(
    program
      .getSourceFiles()
      .map((source) => source.fileName)
      .join("\n"),
    /lib\.dom(?:\.iterable)?\.d\.ts/iu,
  );
}

async function installGeneratedPackage(
  packageRoot: string,
  consumerRoot: string,
): Promise<string> {
  const installedRoot = resolve(
    consumerRoot,
    "node_modules/@aster/experimental",
  );

  await mkdir(dirname(installedRoot), { recursive: true });
  await cp(packageRoot, installedRoot, { recursive: true });
  return installedRoot;
}

test("matches every planned experimental package file to golden output", async () => {
  const plan = await generationPlan();
  const expected = await collectTextFiles(fixtureRoot);
  const actual = new Map(
    plan.files.map((file) => [file.path, file.content]),
  );
  const manifest = JSON.parse(
    actual.get("package.json") ?? "",
  ) as Record<string, unknown>;
  const generatedModules = [...actual]
    .filter(([path]) => path.startsWith("src/"))
    .map(([, content]) => content)
    .join("\n");

  assert.deepEqual(actual, expected);
  assert.deepEqual(manifest.dependencies, {
    "@aster/core": "workspace:*",
  });
  assert.deepEqual(
    Object.keys(manifest.exports as Record<string, unknown>),
    [".", "./frame", "./manifest", "./orbit", "./spark"],
  );
  assert.doesNotMatch(
    generatedModules,
    /\b(?:node:|xmlsax|filesystem|lilium|lotus|HTMLElement|Document)\b/iu,
  );
  assert.match(
    actual.get("src/icons/frame.ts") ?? "",
    /\/\*\*[\s\S]*@description[\s\S]*\*\/\nexport const Frame/u,
  );
  assert.match(
    actual.get("src/manifest.ts") ?? "",
    /\/\*\*[\s\S]*@description[\s\S]*\*\/\nexport const IconManifest/u,
  );
});

test("compiles and exposes only accepted built-package capabilities", async () => {
  const temporaryRoot = await mkdtemp(
    join(tmpdir(), "aster-generated-package-"),
  );

  try {
    const workspaceRoot = resolve(temporaryRoot, "workspace");
    const packageRoot = resolve(
      workspaceRoot,
      "packages/experimental",
    );
    const consumerRoot = resolve(workspaceRoot, "consumer");
    const plan = await generationPlan();

    await mkdir(workspaceRoot, { recursive: true });
    await cp(
      resolve(repositoryRoot, "tsconfig.base.json"),
      resolve(workspaceRoot, "tsconfig.base.json"),
    );
    await materialisePlan(packageRoot, plan);
    await installCoreDependency(packageRoot);
    compilePackage(resolve(packageRoot, "tsconfig.json"));
    await installGeneratedPackage(packageRoot, consumerRoot);
    await mkdir(consumerRoot, { recursive: true });
    await writeFile(
      resolve(consumerRoot, "loader.mjs"),
      "export const load = (specifier) => import(specifier);\n",
      "utf8",
    );

    const loader = await import(
      `${pathToFileURL(resolve(consumerRoot, "loader.mjs")).href}?generated-package`
    ) as {
      readonly load: (
        specifier: string,
      ) => Promise<Record<string, unknown>>;
    };
    const rootModule = await loader.load("@aster/experimental");
    const frameModule = await loader.load(
      "@aster/experimental/frame",
    );
    const manifestModule = await loader.load(
      "@aster/experimental/manifest",
    );

    assert.deepEqual(Object.keys(rootModule).sort(), [
      "Frame",
      "Orbit",
      "Spark",
    ]);
    assert.deepEqual(Object.keys(frameModule), ["Frame"]);
    assert.deepEqual(
      Object.keys(
        manifestModule.IconManifest as Record<string, unknown>,
      ),
      ["frame", "orbit", "spark"],
    );
    assert.equal(
      (frameModule.Frame as IconDefinition).identity.name,
      "frame",
    );
    assert.ok(Object.isFrozen(frameModule.Frame));
    await assert.rejects(
      loader.load("@aster/experimental/icons/frame"),
      (error: NodeJS.ErrnoException) =>
        error.code === "ERR_PACKAGE_PATH_NOT_EXPORTED",
    );
    await assert.rejects(
      loader.load("@aster/experimental/src/index.js"),
      (error: NodeJS.ErrnoException) =>
        error.code === "ERR_PACKAGE_PATH_NOT_EXPORTED",
    );
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("keeps a built per-icon module isolated from aggregate modules", async () => {
  const temporaryRoot = await mkdtemp(
    join(tmpdir(), "aster-isolated-icon-"),
  );

  try {
    const workspaceRoot = resolve(temporaryRoot, "workspace");
    const packageRoot = resolve(
      workspaceRoot,
      "packages/experimental",
    );
    const plan = await generationPlan();

    await mkdir(workspaceRoot, { recursive: true });
    await cp(
      resolve(repositoryRoot, "tsconfig.base.json"),
      resolve(workspaceRoot, "tsconfig.base.json"),
    );
    await materialisePlan(packageRoot, plan);
    await installCoreDependency(packageRoot);
    compilePackage(resolve(packageRoot, "tsconfig.json"));

    const frameModule = await readFile(
      resolve(packageRoot, "dist/icons/frame.js"),
      "utf8",
    );
    const packageSpecifiers = [
      ...frameModule.matchAll(
        /\b(?:from|import)\s*(?:\(\s*)?["']([^"']+)["']/gu,
      ),
    ].map((match) => match[1]);

    assert.deepEqual(packageSpecifiers, ["@aster/core"]);
    assert.doesNotMatch(frameModule, /manifest|orbit|spark/iu);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});

test("recreates byte-identical source after deleting generated output", async () => {
  const temporaryRoot = await mkdtemp(
    join(tmpdir(), "aster-clean-rebuild-"),
  );

  try {
    const packageRoot = resolve(temporaryRoot, "experimental");
    const firstPlan = await generationPlan();

    await materialisePlan(packageRoot, firstPlan);
    const first = await collectTextFiles(packageRoot);
    await rm(packageRoot, { recursive: true, force: true });

    const secondPlan = await generationPlan();

    await materialisePlan(packageRoot, secondPlan);
    const second = await collectTextFiles(packageRoot);

    assert.deepEqual(second, first);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
