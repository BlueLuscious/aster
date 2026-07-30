import assert from "node:assert/strict";
import test from "node:test";

import {
  Icon,
  type IconDefinition,
} from "@aster/core";
import type { IGenerationEntry } from "../../src/generator/contracts/internal/generation-entry.contract.js";
import type { IGenerationRequest } from "../../src/generator/contracts/internal/generation-request.contract.js";
import { generatedFileMarker } from "../../src/generator/constants/generated-file-marker.constant.js";
import { GenerationPlanner } from "../../src/generator/runtime/generation.planner.js";

const planner = new GenerationPlanner();

function definition(
  name: string,
  variant?: string,
  displayName = name,
): IconDefinition {
  return Icon.define({
    identity: {
      collection: "experimental",
      name,
      ...(variant === undefined ? {} : { variant }),
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
      displayName,
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
  });
}

function entry(
  name: string,
  variant?: string,
  displayName?: string,
): IGenerationEntry {
  const suffix = variant === undefined ? name : `${name}--${variant}`;

  return {
    sourceIds: [
      `collections/experimental/metadata/${suffix}.json`,
      `collections/experimental/svg/${suffix}.svg`,
    ],
    definition: definition(name, variant, displayName),
  };
}

function request(
  entries: readonly IGenerationEntry[],
  existingFiles: IGenerationRequest["existingFiles"] = [],
): IGenerationRequest {
  return {
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
    entries,
    existingFiles,
  };
}

function successfulPlan(entries: readonly IGenerationEntry[]) {
  const result = planner.plan(request(entries));

  assert.equal(result.successful, true);

  if (!result.successful) {
    throw new Error("Expected successful generation plan.");
  }

  return result.value;
}

test("plans deterministic isolated modules independently from input order", () => {
  const frame = entry("frame");
  const orbit = entry("orbit");
  const first = successfulPlan([orbit, frame]);
  const second = successfulPlan([frame, orbit]);

  assert.deepEqual(first, second);
  assert.deepEqual(
    first.files.map((file) => file.path),
    [
      "package.json",
      "src/icons/frame.ts",
      "src/icons/orbit.ts",
      "src/index.ts",
      "src/manifest.ts",
      "tsconfig.json",
    ],
  );
  assert.deepEqual(
    first.exports.map((planned) => planned.subpath),
    [".", "./frame", "./manifest", "./orbit"],
  );
  assert.ok(first.files.every((file) => file.content.endsWith("\n")));
  assert.ok(
    first.files
      .filter((file) => file.path !== "package.json")
      .every((file) =>
        file.content.startsWith(generatedFileMarker),
      ),
  );
  assert.ok(
    first.files
      .find((file) => file.path === "package.json")
      ?.content.includes('"generatedBy": "@aster/build"'),
  );
  assert.ok(Object.isFrozen(first));
  assert.ok(Object.isFrozen(first.files));
  assert.ok(Object.isFrozen(first.exports));

  const frameModule = first.files.find(
    (file) => file.path === "src/icons/frame.ts",
  )?.content;
  const rootModule = first.files.find(
    (file) => file.path === "src/index.ts",
  )?.content;

  assert.match(frameModule ?? "", /from "@aster\/core"/u);
  assert.doesNotMatch(frameModule ?? "", /manifest|orbit/iu);
  assert.doesNotMatch(rootModule ?? "", /manifest/iu);
  assert.doesNotMatch(JSON.stringify(first), /[A-Za-z]:\\|timestamp/iu);
});

test("plans base, variant, and numeric-leading symbols without path conflicts", () => {
  const plan = successfulPlan([
    entry("camera"),
    entry("camera", "filled"),
    entry("camera", "index"),
    entry("3d-axis"),
  ]);

  assert.deepEqual(
    plan.files.map((file) => file.path),
    [
      "package.json",
      "src/icons/3d-axis.ts",
      "src/icons/camera.ts",
      "src/icons/camera/filled.ts",
      "src/icons/camera/index.ts",
      "src/index.ts",
      "src/manifest.ts",
      "tsconfig.json",
    ],
  );
  assert.match(
    plan.files.find(
      (file) => file.path === "src/icons/3d-axis.ts",
    )?.content ?? "",
    /export const Icon3dAxis/u,
  );
  assert.match(
    plan.files.find(
      (file) => file.path === "src/icons/camera/filled.ts",
    )?.content ?? "",
    /export const CameraFilled/u,
  );
});

test("escapes authored strings and JavaScript line separators deterministically", () => {
  const plan = successfulPlan([
    entry("quoted", undefined, "Quoted \"name\"\nNext\u2028Line"),
  ]);
  const content = plan.files.find(
    (file) => file.path === "src/icons/quoted.ts",
  )?.content;

  assert.match(content ?? "", /Quoted \\"name\\"\\nNext\\u2028Line/u);
  assert.doesNotMatch(content ?? "", /\u2028/u);
});

test("returns stable diagnostics for identity, symbol, and reserved-subpath collisions", () => {
  const duplicate = planner.plan(
    request([
      entry("camera"),
      {
        ...entry("camera"),
        sourceIds: [
          "collections/experimental/metadata/camera-copy.json",
        ],
      },
    ]),
  );
  const symbol = planner.plan(request([entry("x1"), entry("x-1")]));
  const reserved = planner.plan(request([entry("manifest")]));

  assert.equal(duplicate.successful, false);
  assert.equal(symbol.successful, false);
  assert.equal(reserved.successful, false);
  assert.deepEqual(
    duplicate.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-GENERATION-001"],
  );
  assert.deepEqual(
    symbol.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-GENERATION-002"],
  );
  assert.deepEqual(
    reserved.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-GENERATION-003"],
  );
  assert.equal(duplicate.diagnostics[0]?.related?.length, 1);
  assert.equal(symbol.diagnostics[0]?.related?.length, 1);
});

test("finds only stale owned files and protects unowned planned output", () => {
  const plannedPath = "src/icons/frame.ts";
  const successful = planner.plan(
    request(
      [entry("frame")],
      [
        {
          path: "src/obsolete.ts",
          content: `${generatedFileMarker}\n`,
        },
        {
          path: "notes.txt",
          content: "Human-owned notes.\n",
        },
        {
          path: plannedPath,
          content: `${generatedFileMarker}\n`,
        },
      ],
    ),
  );
  const conflicting = planner.plan(
    request(
      [entry("frame")],
      [{ path: plannedPath, content: "Human-owned module.\n" }],
    ),
  );

  assert.equal(successful.successful, true);

  if (!successful.successful) {
    throw new Error("Expected successful stale-file plan.");
  }

  assert.deepEqual(successful.value.stalePaths, ["src/obsolete.ts"]);
  assert.equal(conflicting.successful, false);
  assert.deepEqual(
    conflicting.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-GENERATION-004"],
  );
});

test("does not accept ownership-marker prefixes as generated evidence", () => {
  const plannedPath = "src/icons/frame.ts";
  const result = planner.plan(
    request(
      [entry("frame")],
      [
        {
          path: plannedPath,
          content: `${generatedFileMarker} modified\n`,
        },
      ],
    ),
  );

  assert.equal(result.successful, false);
  assert.deepEqual(
    result.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-GENERATION-004"],
  );
});

test("recognises only canonical package-manifest ownership authority", () => {
  const initial = successfulPlan([entry("frame")]);
  const packageManifest = initial.files.find(
    (file) => file.path === "package.json",
  )?.content;

  assert.notEqual(packageManifest, undefined);

  const accepted = planner.plan(
    request(
      [entry("frame")],
      [{ path: "package.json", content: packageManifest ?? "" }],
    ),
  );
  const rejected = planner.plan(
    request(
      [entry("frame")],
      [
        {
          path: "package.json",
          content: (packageManifest ?? "").replace(
            '"generatedBy": "@aster/build"',
            '"generatedBy": "human"',
          ),
        },
      ],
    ),
  );

  assert.equal(accepted.successful, true);
  assert.equal(rejected.successful, false);
  assert.deepEqual(
    rejected.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-GENERATION-004"],
  );
});

test("isolates generated bindings and source identifiers from authored names", () => {
  const iconEntry = entry("icon");
  const manifestEntry = entry("icon-manifest");
  const separatedSourceEntry = {
    ...entry("separator"),
    sourceIds: [
      "collections/experimental/metadata/separator\u2028source.json",
    ] as const,
  };
  const plan = successfulPlan([
    iconEntry,
    manifestEntry,
    separatedSourceEntry,
  ]);
  const iconModule = plan.files.find(
    (file) => file.path === "src/icons/icon.ts",
  )?.content;
  const manifestModule = plan.files.find(
    (file) => file.path === "src/manifest.ts",
  )?.content;

  assert.match(
    iconModule ?? "",
    /import \{ Icon as \$Icon \} from "@aster\/core";/u,
  );
  assert.match(iconModule ?? "", /export const Icon = \$Icon\.define/u);
  assert.match(
    manifestModule ?? "",
    /import \{ IconManifest as \$IconManifest \}/u,
  );
  assert.doesNotMatch(
    plan.files.map((file) => file.content).join(""),
    /\u2028/u,
  );
  assert.match(manifestModule ?? "", /separator\\u2028source\.json/u);
});

test("rejects malformed package metadata and definition provenance", () => {
  assert.throws(
    () =>
      planner.plan({
        ...request([entry("frame")]),
        package: {
          ...request([entry("frame")]).package,
          version: "01.0.0",
        },
      }),
    {
      name: "BuildContractError",
      path: "generationRequest.package.version",
    },
  );
  assert.throws(
    () =>
      planner.plan(
        request([
          {
            ...entry("frame"),
            sourceIds: [],
          } as unknown as IGenerationEntry,
        ]),
      ),
    {
      name: "BuildContractError",
      path: "generationRequest.entries[0].sourceIds",
    },
  );
  assert.throws(
    () =>
      planner.plan(
        request([
          {
            ...entry("frame"),
            sourceIds: [
              "collections/experimental/svg/frame.svg",
              "collections/experimental/svg/frame.svg",
            ],
          },
        ]),
      ),
    {
      name: "BuildContractError",
      path: "generationRequest.entries[0].sourceIds",
    },
  );
});

test("rejects existing paths outside the generated-root-relative boundary", () => {
  assert.throws(
    () =>
      planner.plan(
        request(
          [entry("frame")],
          [
            {
              path: "../outside.ts",
              content: `${generatedFileMarker}\n`,
            },
          ],
        ),
      ),
    {
      name: "BuildContractError",
      path: "generationRequest.existingFiles[0].path",
    },
  );
});
