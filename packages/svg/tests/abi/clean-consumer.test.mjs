import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cp,
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import process from "node:process";
import test, { after, before } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const workspaceRoot = resolve(packageRoot, "../..");
let consumerRoot;

async function copyPublishedPackage(name, installationRoot = consumerRoot) {
  const sourceRoot = resolve(workspaceRoot, "packages", name);
  const targetRoot = resolve(installationRoot, "node_modules", "@luscious-garden", `aster-${name}`);

  await mkdir(targetRoot, { recursive: true });
  await Promise.all([
    copyFile(
      resolve(sourceRoot, "package.json"),
      resolve(targetRoot, "package.json"),
    ),
    cp(resolve(sourceRoot, "dist"), resolve(targetRoot, "dist"), {
      recursive: true,
    }),
  ]);
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

before(async () => {
  consumerRoot = await mkdtemp(resolve(tmpdir(), "aster-svg-consumer-"));
  await writeFile(
    resolve(consumerRoot, "package.json"),
    `${JSON.stringify({ private: true, type: "module" })}\n`,
    "utf8",
  );
  await Promise.all([
    copyPublishedPackage("core"),
    copyPublishedPackage("svg"),
  ]);
});

after(async () => {
  await rm(consumerRoot, { recursive: true, force: true });
});

test("imports and renders through published roots without source files", () => {
  const imported = runModule('await import("@luscious-garden/aster-svg");');
  const rendered = runModule([
    'import { Icon } from "@luscious-garden/aster-core";',
    'import { Svg } from "@luscious-garden/aster-svg";',
    "const definition = Icon.define({",
    '  identity: { namespace: "consumer", name: "circle", variant: "outline" },',
    "  viewBox: { minX: 0, minY: 0, width: 24, height: 24 },",
    '  nodes: [{ kind: "circle", cx: 12, cy: 12, radius: 4 }],',
    "  metadata: {",
    '    displayName: "Circle",',
    '    rtl: "preserve",',
    '    presentation: { defaults: { fill: "none", stroke: "currentColor" }, overrides: [] },',
    "    deprecated: false,",
    "  },",
    "});",
    "process.stdout.write(Svg.render(definition));",
  ].join("\n"));

  assert.equal(imported.status, 0);
  assert.equal(imported.stdout, "");
  assert.equal(imported.stderr, "");
  assert.equal(rendered.status, 0);
  assert.equal(rendered.stderr, "");
  assert.equal(
    rendered.stdout,
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" data-rendered-by="Aster" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4" fill="none" fill-rule="nonzero" stroke="currentColor" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" opacity="1" fill-opacity="1" stroke-opacity="1"/></svg>',
  );
});

test("preserves dense point ordering through source-free native package roots", () => {
  const rendered = runModule([
    'import assert from "node:assert/strict";',
    'import { Icon } from "@luscious-garden/aster-core";',
    'import { Svg } from "@luscious-garden/aster-svg";',
    "const points = Array.from({ length: 1024 }, (_, index) => ({ x: index / 8, y: -(index % 16) / 2 }));",
    'const expected = points.flatMap(({ x, y }) => [String(x), String(y)]).join(" ");',
    'for (const kind of ["polyline", "polygon"]) {',
    "  const definition = Icon.define({",
    '    identity: { namespace: "consumer", name: "points", variant: "outline" },',
    "    viewBox: { minX: 0, minY: 0, width: 24, height: 24 },",
    "    nodes: [{ kind, points }],",
    '    metadata: { displayName: "Points", rtl: "preserve", presentation: { defaults: {}, overrides: [] }, deprecated: false },',
    "  });",
    "  for (const input of [definition, structuredClone(definition)]) {",
    "    const markup = Svg.render(input, Object.create(null));",
    '    assert.ok(markup.includes(`<${kind} points="${expected}"`));',
    "    assert.equal(Svg.render(input), markup);",
    "  }",
    "}",
  ].join("\n"));

  assert.equal(rendered.status, 0, rendered.stderr);
  assert.equal(rendered.stderr, "");
  assert.equal(rendered.stdout, "");
});

test("renders definitions from an independent Core installation without weakening errors", async () => {
  const otherInstallation = resolve(consumerRoot, "foreign");
  await copyPublishedPackage("core", otherInstallation);
  const otherPackage = resolve(otherInstallation, "node_modules/@luscious-garden/aster-core");
  const manifest = JSON.parse(await readFile(resolve(otherPackage, "package.json"), "utf8"));
  const entry = pathToFileURL(resolve(otherPackage, manifest.exports["."].import)).href;
  const rendered = runModule([
    'import assert from "node:assert/strict";',
    'import { Icon, IconDefinitionError } from "@luscious-garden/aster-core";',
    'import { Svg, SvgRenderError } from "@luscious-garden/aster-svg";',
    `const foreign = await import(${JSON.stringify(entry)});`,
    "assert.notEqual(Icon, foreign.Icon);",
    "assert.notEqual(IconDefinitionError, foreign.IconDefinitionError);",
    "const definition = foreign.Icon.define({",
    '  identity: { namespace: "consumer", name: "foreign-circle", variant: "outline" },',
    "  viewBox: { minX: 0, minY: 0, width: 24, height: 24 },",
    '  nodes: [{ kind: "circle", cx: 12, cy: 12, radius: 4 }],',
    "  metadata: {",
    '    displayName: "Foreign Circle", rtl: "preserve", deprecated: false,',
    '    presentation: { defaults: { fill: "none", stroke: "currentColor" }, overrides: [] },',
    "  },",
    "});",
    "const local = Icon.define(definition);",
    "assert.notEqual(local, definition);",
    "assert.equal(Icon.define(local), local);",
    "const expected = Svg.render(local);",
    "for (const candidate of [definition, local, structuredClone(definition)]) {",
    "  assert.equal(Svg.render(candidate), expected);",
    "  assert.equal(Svg.render(candidate), expected);",
    "  assert.throws(() => Svg.render(candidate, { size: 0 }), SvgRenderError);",
    "}",
    "assert.throws(() => Svg.render(Object.freeze({ ...definition, nodes: [] })), SvgRenderError);",
    'const failure = new foreign.IconDefinitionError("foreign.definition", "Foreign reflection failed.");',
    "const wrapped = new Proxy(definition, { ownKeys() { throw failure; } });",
    "assert.throws(() => Svg.render(wrapped), (error) => error === failure);",
  ].join("\n"));

  assert.equal(rendered.error, undefined);
  assert.equal(rendered.status, 0, rendered.stderr);
  assert.equal(rendered.stderr, "");
  assert.equal(rendered.stdout, "");
});

test("isolates inherited optional fields through source-free native package roots", () => {
  const rendered = runModule(`
    import assert from "node:assert/strict";
    import { Icon } from "@luscious-garden/aster-core";
    import { Svg } from "@luscious-garden/aster-svg";
    const definition = Icon.define({
      identity: { namespace: "consumer", name: "isolated", variant: "outline" },
      viewBox: { minX: 0, minY: 0, width: 24, height: 16 },
      nodes: [{ kind: "rect", x: 2, y: 3, width: 12, height: 8 }],
      metadata: {
        displayName: "Isolated", rtl: "mirror", deprecated: false,
        presentation: { defaults: {}, overrides: ["fill", "stroke", "strokeWidth"] },
      },
    });
    const expected = Svg.render(definition);
    for (const [field, value] of [
      ["size", 32], ["colour", "#abc"], ["fill", "#123"], ["stroke", "#456"],
      ["strokeWidth", 3], ["label", "Inherited"], ["title", "Inherited"],
      ["decorative", true], ["direction", "rtl"], ["defaultSize", 64],
      ["minimumSize", 64], ["radiusX", 2], ["radiusY", 2],
    ]) {
      for (const candidate of [definition, structuredClone(definition)]) {
        let reads = 0;
        let actual;
        Object.defineProperty(Object.prototype, field, {
          configurable: true,
          get() { reads += 1; return value; },
        });
        try {
          actual = Svg.render(candidate);
        } finally {
          Reflect.deleteProperty(Object.prototype, field);
        }
        assert.equal(reads, 0, field);
        assert.equal(actual, expected, field);
      }
    }
    const options = { size: 32 };
    let writes = 0;
    let actual;
    Object.defineProperty(Object.prototype, "size", {
      configurable: true,
      set() { writes += 1; },
    });
    try {
      actual = Svg.render(definition, options);
    } finally {
      Reflect.deleteProperty(Object.prototype, "size");
    }
    assert.equal(writes, 0);
    assert.match(actual, / width="32" height="32"/u);
  `);

  assert.equal(rendered.error, undefined);
  assert.equal(rendered.status, 0, rendered.stderr);
  assert.equal(rendered.stdout, "");
  assert.equal(rendered.stderr, "");
});
