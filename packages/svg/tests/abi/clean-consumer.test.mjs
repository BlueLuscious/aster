import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cp,
  copyFile,
  mkdir,
  mkdtemp,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import process from "node:process";
import test, { after, before } from "node:test";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const workspaceRoot = resolve(packageRoot, "../..");
let consumerRoot;

async function copyPublishedPackage(name) {
  const sourceRoot = resolve(workspaceRoot, "packages", name);
  const targetRoot = resolve(consumerRoot, "node_modules", "@aster", name);

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
  const imported = runModule('await import("@aster/svg");');
  const rendered = runModule([
    'import { Icon } from "@aster/core";',
    'import { Svg } from "@aster/svg";',
    "const definition = Icon.define({",
    '  identity: { namespace: "consumer", name: "circle" },',
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
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4" fill="none" fill-rule="nonzero" stroke="currentColor" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="4" opacity="1" fill-opacity="1" stroke-opacity="1"/></svg>',
  );
});
