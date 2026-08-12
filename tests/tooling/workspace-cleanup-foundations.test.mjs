import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";

import { PackageOutputCleanupCommand } from "../../tooling/workspace/runtime/package-output-cleanup.command.mjs";
import { PackageOutputCleanupPolicy } from "../../tooling/workspace/runtime/package-output-cleanup.policy.mjs";
import { PackageOutputCleaner } from "../../tooling/workspace/runtime/package-output.cleaner.mjs";
import { PackageRootInspector } from "../../tooling/workspace/runtime/package-root.inspector.mjs";
import { RepositoryPathResolver } from "../../tooling/shared/runtime/repository-path.resolver.mjs";

test("accepts only the direct package distribution boundary", () => {
  const paths = new RepositoryPathResolver();
  const packageRoot = paths.resolve("fixture", "package");
  const policy = new PackageOutputCleanupPolicy(paths);

  assert.equal(policy.resolve(packageRoot, "dist"), paths.resolve(packageRoot, "dist"));

  for (const output of [".", "build", "dist/nested", "../outside"]) {
    assert.throws(
      () => policy.resolve(packageRoot, output),
      /Refusing to clean anything except the direct package dist directory/u,
    );
  }
});

test("inspects only the direct package manifest", async () => {
  const paths = new RepositoryPathResolver();
  const observed = [];
  const inspector = new PackageRootInspector(
    {
      async isFile(path) {
        observed.push(path);
        return true;
      },
    },
    paths,
  );
  const packageRoot = resolve("fixture", "package");

  assert.equal(await inspector.inspect(packageRoot), true);
  assert.deepEqual(observed, [resolve(packageRoot, "package.json")]);
});

test("coordinates identity and policy before destructive execution", async () => {
  const paths = new RepositoryPathResolver();
  const removed = [];
  const packageRoot = paths.resolve("fixture", "package");
  let acceptedPackage = false;
  const cleaner = new PackageOutputCleaner(
    {
      async inspect(path) {
        assert.equal(path, packageRoot);
        return acceptedPackage;
      },
    },
    new PackageOutputCleanupPolicy(paths),
    {
      async removeTree(path) {
        removed.push(path);
      },
    },
    paths,
  );

  await assert.rejects(
    cleaner.clean(packageRoot, "dist"),
    /Refusing to clean a directory without package.json/u,
  );
  assert.deepEqual(removed, []);

  acceptedPackage = true;
  await cleaner.clean(packageRoot, "dist");
  assert.deepEqual(removed, [paths.resolve(packageRoot, "dist")]);
});

test("adapts cleanup results to command process state", async () => {
  const invocations = [];
  const diagnostics = [];
  const processCapability = {
    argv: ["node", "clean-package-output.mjs", "dist"],
    cwd() {
      return "fixture-package";
    },
    stderr: {
      write(value) {
        diagnostics.push(value);
      },
    },
  };
  const command = new PackageOutputCleanupCommand(
    {
      async clean(packageRoot, outputDirectory) {
        invocations.push([packageRoot, outputDirectory]);
      },
    },
    processCapability,
  );

  await command.run();

  assert.deepEqual(invocations, [["fixture-package", "dist"]]);
  assert.deepEqual(diagnostics, []);
  assert.equal(processCapability.exitCode, undefined);

  processCapability.argv = ["node", "clean-package-output.mjs"];
  await command.run();

  assert.deepEqual(diagnostics, ["Package cleanup requires an output directory.\n"]);
  assert.equal(processCapability.exitCode, 1);
});
