import assert from "node:assert/strict";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import {
  dirname,
  join,
  resolve,
} from "node:path";
import {
  fileURLToPath,
  pathToFileURL,
} from "node:url";
import test from "node:test";

import {
  Icon,
  type IconDefinition,
} from "@aster/core";
import type { IGenerationPlan } from "../../src/generator/contracts/internal/generation-plan.contract.js";
import type { IGenerationRequest } from "../../src/generator/contracts/internal/generation-request.contract.js";
import { GenerationPlanner } from "../../src/generator/runtime/generation.planner.js";
import * as typescript from "typescript";

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const planner = new GenerationPlanner();

async function generationPlan(): Promise<IGenerationPlan> {
  const definitions = ["frame", "orbit"].map((name) =>
    Icon.define({
      identity: {
        collection: "fixture",
        name,
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
        displayName: name,
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
    }),
  );
  const request: IGenerationRequest = {
    collectionSourceId: "fixtures/metadata/collection.json",
    collection: "fixture",
    package: {
      name: "@aster/fixture",
      version: "0.0.0",
      description: "Portable fixture icon definitions.",
      licence: "ISC",
    },
    entries: definitions.map((definition) => ({
      sourceIds: [
        `fixtures/metadata/icons/${definition.identity.name}.json`,
        `fixtures/svg/${definition.identity.name}.svg`,
      ],
      definition,
    })),
  };
  const result = planner.plan(request);

  assert.equal(result.successful, true);

  if (!result.successful) {
    throw new Error("Expected a successful fixture generation plan.");
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
    "node_modules/@aster/fixture",
  );

  await mkdir(dirname(installedRoot), { recursive: true });
  await cp(packageRoot, installedRoot, { recursive: true });
  return installedRoot;
}

test("compiles and exposes only accepted built-package capabilities", async () => {
  const temporaryRoot = await mkdtemp(
    join(tmpdir(), "aster-generated-package-"),
  );

  try {
    const workspaceRoot = resolve(temporaryRoot, "workspace");
    const packageRoot = resolve(
      workspaceRoot,
      "packages/fixture",
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
    const rootModule = await loader.load("@aster/fixture");
    const frameModule = await loader.load(
      "@aster/fixture/frame",
    );
    const manifestModule = await loader.load(
      "@aster/fixture/manifest",
    );

    assert.deepEqual(Object.keys(rootModule).sort(), [
      "Frame",
      "Orbit",
    ]);
    assert.deepEqual(Object.keys(frameModule), ["Frame"]);
    assert.deepEqual(
      Object.keys(
        manifestModule.IconManifest as Record<string, unknown>,
      ),
      ["frame", "orbit"],
    );
    assert.equal(
      (frameModule.Frame as IconDefinition).identity.name,
      "frame",
    );
    assert.ok(Object.isFrozen(frameModule.Frame));
    await assert.rejects(
      loader.load("@aster/fixture/icons/frame"),
      (error: NodeJS.ErrnoException) =>
        error.code === "ERR_PACKAGE_PATH_NOT_EXPORTED",
    );
    await assert.rejects(
      loader.load("@aster/fixture/src/index.js"),
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
      "packages/fixture",
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
      resolve(packageRoot, "dist/icons/frame.icon.js"),
      "utf8",
    );
    const packageSpecifiers = [
      ...frameModule.matchAll(
        /\b(?:from|import)\s*(?:\(\s*)?["']([^"']+)["']/gu,
      ),
    ].map((match) => match[1]);

    assert.deepEqual(packageSpecifiers, ["@aster/core"]);
    assert.doesNotMatch(frameModule, /manifest|orbit/iu);
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
});
