import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const distributionRoot = resolve(packageRoot, "dist");

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

function createDefinitionInput() {
  return {
    identity: {
      collection: "conformance",
      name: "circle",
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
      displayName: "Circle",
      rtl: "preserve",
      presentation: {
        defaults: {
          fill: "none",
          stroke: "currentColor",
          strokeWidth: 2,
        },
        overrides: ["stroke"],
      },
      deprecated: false,
    },
  };
}

test("exposes the exact documented root value surface", async () => {
  const packageModule = await import("@aster/svg");

  assert.deepEqual(
    Object.keys(packageModule).sort(),
    ["Svg", "SvgRenderError"],
  );
  assert.deepEqual(Object.keys(packageModule.Svg), ["render"]);
  assert.ok(Object.isFrozen(packageModule.Svg));
  assert.equal(
    Object.getPrototypeOf(packageModule.SvgRenderError.prototype),
    TypeError.prototype,
  );
});

test("renders deterministic markup from one explicit built-package definition", async () => {
  const { Icon } = await import("@aster/core");
  const { Svg } = await import("@aster/svg");
  const firstDefinition = Icon.define(createDefinitionInput());
  const secondDefinition = Icon.define(createDefinitionInput());
  const options = {
    size: 32,
    colour: "#123",
    stroke: "#abcdef",
    label: "Circle",
  };

  const first = Svg.render(firstDefinition, options);
  const second = Svg.render(secondDefinition, options);

  assert.equal(first, second);
  assert.equal(
    first,
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" color="#112233" role="img" aria-label="Circle"><circle cx="12" cy="12" r="4" fill="none" fill-rule="nonzero" stroke="#abcdef" stroke-width="2" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" opacity="1" fill-opacity="1" stroke-opacity="1"/></svg>',
  );
});

test("rejects implementation subpaths through package exports", async () => {
  await assert.rejects(
    import("@aster/svg/render/runtime/svg.renderer.js"),
    (error) => error?.code === "ERR_PACKAGE_PATH_NOT_EXPORTED",
  );
  await assert.rejects(
    import("@aster/svg/error/runtime/svg-render.error.js"),
    (error) => error?.code === "ERR_PACKAGE_PATH_NOT_EXPORTED",
  );
});

test("publishes only the accepted root export and declaration snapshot", async () => {
  const manifest = JSON.parse(
    await readFile(resolve(packageRoot, "package.json"), "utf8"),
  );
  const rootDeclaration = await readFile(
    resolve(distributionRoot, "index.d.ts"),
    "utf8",
  );

  assert.deepEqual(Object.keys(manifest.exports), ["."]);
  assert.equal(manifest.exports["."].import, "./dist/index.js");
  assert.equal(manifest.exports["."].types, "./dist/index.d.ts");
  assert.deepEqual(manifest.dependencies, {
    "@aster/core": "workspace:*",
  });
  assert.equal(manifest.sideEffects, false);
  assert.equal(
    rootDeclaration,
    [
      'export * from "./error/index.js";',
      'export { Svg } from "./api/index.js";',
      'export type * from "./api/index.js";',
      'export type * from "./render/index.js";',
      "",
    ].join("\n"),
  );
});

test("emits host-independent declarations with only public Core imports", async () => {
  const declarations = await collectDistributionFiles(".d.ts");

  assert.ok(declarations.length > 0);

  for (const declaration of declarations) {
    const source = await readFile(declaration, "utf8");
    const externalSpecifiers = extractModuleSpecifiers(source).filter(
      (specifier) => !specifier.startsWith("."),
    );

    assert.deepEqual(
      [...new Set(externalSpecifiers)],
      externalSpecifiers.length === 0 ? [] : ["@aster/core"],
    );
    assert.doesNotMatch(source, /\/\/\/\s*<reference/iu);
    assert.doesNotMatch(
      source,
      /\b(?:HTMLElement|SVGElement|Document|Window|Buffer|NodeJS)\b/gu,
    );
    assert.doesNotMatch(
      source,
      /(?:@aster\/build|\blilium\b|\blotus\b|\bnode:|\btooling\b|\brepository\b)/giu,
    );
  }
});

test("emits side-effect-free ESM with only public Core authority", async () => {
  const modules = await collectDistributionFiles(".js");

  assert.ok(modules.length > 0);

  for (const module of modules) {
    const source = await readFile(module, "utf8");
    const externalSpecifiers = extractModuleSpecifiers(source).filter(
      (specifier) => !specifier.startsWith("."),
    );

    assert.deepEqual(
      [...new Set(externalSpecifiers)],
      externalSpecifiers.length === 0 ? [] : ["@aster/core"],
    );
    assert.doesNotMatch(source, /\brequire\s*\(/gu);
    assert.doesNotMatch(source, /\bmodule\.exports\b/gu);
    assert.doesNotMatch(
      source,
      /(?:@aster\/core\/|@aster\/build|\blilium\b|\blotus\b|\bnode:|\btooling\b)/giu,
    );
  }
});
