import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";

import { CatalogueSourceSerialiser } from "../../tooling/catalogue/runtime/catalogue-source.serialiser.mjs";

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

test("type-checks ten thousand generated manifest records without an inferred union explosion", async () => {
  const root = await mkdtemp(join(tmpdir(), "aster-manifest-scaling-"));
  try {
    const icons = Array.from({ length: 10_000 }, (_, index) => ({
      key: `benchmark/glyph-${index}@outline`,
      identity: { namespace: "benchmark", name: `glyph-${index}`, variant: "outline" },
      exportName: `Glyph${index}Outline`,
      displayName: `Glyph ${index}`,
      tags: ["benchmark"],
      rtl: "preserve",
      deprecated: false,
    }));
    const collections = [{
      key: "benchmark/sample",
      identity: { namespace: "benchmark", name: "sample" },
      exportName: "Sample",
      metadata: { displayName: "Sample" },
      members: icons.map(({ key }) => key),
    }];
    const source = new CatalogueSourceSerialiser("fixture-generator").manifest(icons, collections);
    // Reject unbounded inference before exposing the compiler to this large fixture.
    assert.equal(
      source.match(/Object\.freeze<IconManifestEntry>\(/gu)?.length ?? 0,
      icons.length,
      "Require an explicit public type for every icon manifest record.",
    );
    assert.equal(
      source.match(/Object\.freeze<CollectionManifestEntry>\(/gu)?.length ?? 0,
      collections.length,
      "Require an explicit public type for every collection manifest record.",
    );
    const manifestPath = join(root, "src/generated/manifest/index.ts");
    await mkdir(dirname(manifestPath), { recursive: true });
    await cp(
      join(workspaceRoot, "packages/icons/src/manifest/contracts"),
      join(root, "src/manifest/contracts"),
      { recursive: true },
    );
    await writeFile(manifestPath, source, "utf8");

    const program = ts.createProgram([manifestPath], {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strict: true,
      exactOptionalPropertyTypes: true,
      noEmit: true,
      skipLibCheck: true,
      types: [],
      baseUrl: workspaceRoot,
      paths: { "@luscious-garden/aster-core": ["packages/core/dist/index.d.ts"] },
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    assert.deepEqual(diagnostics.map((diagnostic) => ({
      code: diagnostic.code,
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
    })), []);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
