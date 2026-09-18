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

before(async () => {
  consumerRoot = await mkdtemp(resolve(tmpdir(), "aster-icons-consumer-"));
  await writeFile(
    resolve(consumerRoot, "package.json"),
    `${JSON.stringify({ private: true, type: "module" })}\n`,
    "utf8",
  );
  await Promise.all([
    copyPublishedPackage("core"),
    copyPublishedPackage("icons"),
  ]);
});

after(async () => {
  await rm(consumerRoot, { recursive: true, force: true });
});

test("resolves isolated runtime and declaration facades without source files", async () => {
  const source = [
    'import type { CollectionDefinition, IconDefinition } from "@aster/core";',
    'import { Camera } from "@aster/icons/camera";',
    'import { AmellusCollection } from "@aster/icons/collections/amellus";',
    "const icon: IconDefinition = Camera;",
    "const collection: CollectionDefinition = AmellusCollection;",
    "export const result = `${icon.identity.name}:${collection.identity.name}`;",
    "",
  ].join("\n");
  await writeFile(resolve(consumerRoot, "consumer.ts"), source, "utf8");
  await writeFile(
    resolve(consumerRoot, "tsconfig.json"),
    `${JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        module: "NodeNext",
        moduleResolution: "NodeNext",
        strict: true,
        skipLibCheck: true,
        outDir: "dist",
      },
      include: ["consumer.ts"],
    }, null, 2)}\n`,
    "utf8",
  );

  const compiled = spawnSync(
    process.execPath,
    [
      resolve(workspaceRoot, "node_modules/typescript/bin/tsc"),
      "-p",
      resolve(consumerRoot, "tsconfig.json"),
    ],
    { cwd: consumerRoot, encoding: "utf8" },
  );

  assert.equal(compiled.error, undefined, "TypeScript consumer could not start.");
  assert.equal(
    compiled.status,
    0,
    `TypeScript consumer failed: ${compiled.stdout}${compiled.stderr}`,
  );

  const executed = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "--eval",
      'const { result } = await import("./dist/consumer.js"); process.stdout.write(result);',
    ],
    { cwd: consumerRoot, encoding: "utf8" },
  );

  assert.equal(executed.status, 0);
  assert.equal(executed.stderr, "");
  assert.equal(executed.stdout, "camera:amellus");
});
