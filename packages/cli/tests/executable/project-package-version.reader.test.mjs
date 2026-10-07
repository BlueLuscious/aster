import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { NodeShell } from "../../dist/shell/runtime/node-shell.js";
import { asterPublicPackages } from "../../dist/shell/version/constants/aster-public-packages.constant.js";
import { CliPackageVersionReader } from "../../dist/shell/version/runtime/cli-package-version.reader.js";
import { ProjectPackageVersionError } from "../../dist/shell/version/runtime/project-package-version.error.js";
import { ProjectPackageVersionReader } from "../../dist/shell/version/runtime/project-package-version.reader.js";

const names = Object.freeze(Object.fromEntries(
  asterPublicPackages.map(({ selector, name }) => [selector, name]),
));

async function removeFixture(root) {
  const ownedName = relative(resolve(tmpdir()), resolve(root));
  assert.match(ownedName, /^aster-cli-project-version-[^\\/]+$/u);
  await rm(root, { recursive: true, force: true });
}

async function createFixture(context) {
  const root = await mkdtemp(join(tmpdir(), "aster-cli-project-version-"));
  context.after(() => removeFixture(root));
  const project = join(root, "project with spaces");
  const cliRoot = join(root, "cli runtime");
  const entrypoint = join(cliRoot, "node_modules", "@luscious-garden", "aster-cli", "dist", "shell", "aster.js");

  await mkdir(project, { recursive: true });
  await mkdir(dirname(entrypoint), { recursive: true });
  await writeFile(entrypoint, "export {};\n", "utf8");
  await writeFile(join(project, "package.json"), "{}\n", "utf8");

  return Object.freeze({ root, project, cliRoot, entrypoint: pathToFileURL(entrypoint) });
}

async function writeProject(project, data) {
  await writeFile(join(project, "package.json"), JSON.stringify(data), "utf8");
}

function installedManifestPath(root, selector) {
  return join(root, "node_modules", "@luscious-garden", `aster-${selector}`, "package.json");
}

async function install(root, selector, version, extras = {}) {
  const path = installedManifestPath(root, selector);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify({ name: names[selector], version, ...extras }), "utf8");
  return path;
}

test("keeps project versions distinct from the executed CLI dependencies", async (context) => {
  const fixture = await createFixture(context);
  await writeProject(fixture.project, { dependencies: { [names.icons]: "0.1.0-rc.1" } });
  await install(fixture.project, "icons", "0.1.0-rc.1", { exports: { ".": null } });
  await install(fixture.cliRoot, "icons", "0.1.0-rc.2");

  const project = new ProjectPackageVersionReader(fixture.project);
  const cli = new CliPackageVersionReader(fixture.entrypoint);

  assert.deepEqual(await project.read("icons"), [
    { name: names.icons, version: "0.1.0-rc.1" },
  ]);
  assert.deepEqual(await cli.read("icons"), [
    { name: names.icons, version: "0.1.0-rc.2" },
  ]);
  assert.deepEqual(await project.read("all"), [
    { name: names.icons, version: "0.1.0-rc.1" },
  ]);
});

test("reads direct production and development packages in canonical order", async (context) => {
  const fixture = await createFixture(context);
  await writeProject(fixture.project, {
    dependencies: { [names.svg]: "^0.1.0", [names.core]: "^0.1.0" },
    devDependencies: { [names.icons]: "^0.1.0", [names.cli]: "^0.1.0" },
  });
  await install(fixture.project, "svg", "0.1.4");
  await install(fixture.project, "core", "0.1.1");
  await install(fixture.project, "icons", "0.1.2");
  await install(fixture.project, "cli", "0.1.3");

  const result = await new ProjectPackageVersionReader(fixture.project).read("all");

  assert.deepEqual(result, [
    { name: names.core, version: "0.1.1" },
    { name: names.icons, version: "0.1.2" },
    { name: names.svg, version: "0.1.4" },
    { name: names.cli, version: "0.1.3" },
  ]);
  assert.ok(Object.isFrozen(result));
  assert.ok(result.every((entry) => Object.isFrozen(entry)));
});

test("omits absent optional packages from all but rejects a named absence", async (context) => {
  const fixture = await createFixture(context);
  await writeProject(fixture.project, {
    dependencies: { [names.core]: "^0.1.0", [names.svg]: "^0.1.0" },
    optionalDependencies: { [names.svg]: "^0.1.0", [names.icons]: "^0.1.0" },
  });
  await install(fixture.project, "core", "0.1.1");

  const reader = new ProjectPackageVersionReader(fixture.project);

  assert.deepEqual(await reader.read("all"), [{ name: names.core, version: "0.1.1" }]);
  await assert.rejects(reader.read("icons"), ProjectPackageVersionError);
  await assert.rejects(reader.read("svg"), ProjectPackageVersionError);
});

test("uses the nearest workspace package and excludes hoisted undeclared packages", async (context) => {
  const fixture = await createFixture(context);
  const child = join(fixture.project, "packages", "app");
  const nested = join(child, "src", "nested");
  await mkdir(nested, { recursive: true });
  await writeProject(fixture.project, { dependencies: { [names.core]: "^0.1.0" } });
  await writeProject(child, { dependencies: { [names.icons]: "^0.1.0" } });
  await install(fixture.project, "core", "0.1.4");
  await install(fixture.project, "icons", "0.1.5");

  assert.deepEqual(await new ProjectPackageVersionReader(nested).read("all"), [
    { name: names.icons, version: "0.1.5" },
  ]);
  assert.deepEqual(await new ProjectPackageVersionReader(fixture.project).read("all"), [
    { name: names.core, version: "0.1.4" },
  ]);
  await assert.rejects(
    new ProjectPackageVersionReader(nested).read("core"),
    /not a direct dependency/u,
  );
});

test("does not mistake peer-only or transitive installations for direct packages", async (context) => {
  const fixture = await createFixture(context);
  await writeProject(fixture.project, {
    peerDependencies: { [names.icons]: "^0.1.0" },
  });
  await install(fixture.project, "icons", "0.1.0");
  await install(fixture.cliRoot, "core", "0.1.2");

  const reader = new ProjectPackageVersionReader(fixture.project);
  const result = await reader.read("all");

  assert.deepEqual(result, []);
  assert.ok(Object.isFrozen(result));
  await assert.rejects(reader.read("icons"), /not a direct dependency/u);
  await assert.rejects(reader.read("core"), /not a direct dependency/u);
});

test("fails without falling back to an installed CLI dependency", async (context) => {
  const fixture = await createFixture(context);
  await writeProject(fixture.project, { dependencies: { [names.icons]: "^0.1.0" } });
  await install(fixture.cliRoot, "icons", "0.1.9");

  const reader = new ProjectPackageVersionReader(fixture.project);

  await assert.rejects(reader.read("icons"), ProjectPackageVersionError);
  await assert.rejects(reader.read("all"), ProjectPackageVersionError);
  assert.deepEqual(await new CliPackageVersionReader(fixture.entrypoint).read("icons"), [
    { name: names.icons, version: "0.1.9" },
  ]);
});

test("validates selected installed identities and versions without reading unrelated manifests", async (context) => {
  const fixture = await createFixture(context);
  await writeProject(fixture.project, {
    dependencies: { [names.core]: "^0.1.0", [names.icons]: "^0.1.0" },
  });
  await install(fixture.project, "core", "0.1.1");
  const icons = await install(fixture.project, "icons", "0.1.2");
  const reader = new ProjectPackageVersionReader(fixture.project);

  for (const invalid of [
    "{broken",
    "null",
    "[]",
    JSON.stringify({ name: "@luscious-garden/other", version: "0.1.2" }),
    JSON.stringify({ name: names.icons, version: "" }),
    JSON.stringify({ name: names.icons, version: " 0.1.2 " }),
    JSON.stringify({ name: names.icons, version: 1 }),
  ]) {
    await writeFile(icons, invalid, "utf8");
    assert.deepEqual(await reader.read("core"), [{ name: names.core, version: "0.1.1" }]);
    await assert.rejects(reader.read("icons"), ProjectPackageVersionError);
    await assert.rejects(reader.read("all"), ProjectPackageVersionError);
  }
});

test("rejects invalid project metadata and absent required installations", async (context) => {
  const fixture = await createFixture(context);
  const reader = new ProjectPackageVersionReader(fixture.project);

  for (const invalid of [
    "{broken",
    "null",
    "[]",
    JSON.stringify({ dependencies: [] }),
    JSON.stringify({ dependencies: { [names.core]: 1 } }),
    JSON.stringify({ devDependencies: { [names.icons]: " ^0.1.0 " } }),
  ]) {
    await writeFile(join(fixture.project, "package.json"), invalid, "utf8");
    await assert.rejects(reader.read("all"), ProjectPackageVersionError);
  }

  await writeProject(fixture.project, { dependencies: { [names.core]: "^0.1.0" } });
  await assert.rejects(reader.read("core"), /not installed/u);
  await assert.rejects(reader.read("all"), /not installed/u);
});

test("accepts UTF-8 BOM manifests and native paths containing spaces", async (context) => {
  const fixture = await createFixture(context);
  const projectManifest = join(fixture.project, "package.json");
  const installedManifest = await install(fixture.project, "icons", "0.1.0");
  await writeFile(projectManifest, `\ufeff${JSON.stringify({ dependencies: { [names.icons]: "^0.1.0" } })}`, "utf8");
  await writeFile(installedManifest, `\ufeff${JSON.stringify({ name: names.icons, version: "0.1.0" })}`, "utf8");

  assert.deepEqual(await new ProjectPackageVersionReader(fixture.project).read("icons"), [
    { name: names.icons, version: "0.1.0" },
  ]);
});

test("reports absent projects safely and leaves executed-CLI queries independent", async (context) => {
  const fixture = await createFixture(context);
  const outside = join(fixture.root, "without project");
  await mkdir(outside, { recursive: true });
  await install(fixture.cliRoot, "cli", "0.1.0-rc.2");
  const project = new ProjectPackageVersionReader(outside);

  await assert.rejects(project.read("all"), (error) => {
    assert.ok(error instanceof ProjectPackageVersionError);
    assert.doesNotMatch(error.message, /aster-cli-project-version-|package\.json.*[\\/]/u);
    return true;
  });
  assert.throws(() => new ProjectPackageVersionReader("relative/path"), TypeError);
  await assert.rejects(project.read("import"), TypeError);

  await writeFile(join(fixture.project, "package.json"), "{broken", "utf8");
  const shell = new NodeShell("Aster", "0.1.0-rc.2", fixture.project, fixture.entrypoint);
  assert.deepEqual(await shell.execute(["version"]), {
    stdout: "Aster 0.1.0-rc.2\n",
    stderr: "",
    exitCode: 0,
  });
  assert.deepEqual(await shell.execute(["version", "cli"]), {
    stdout: `${names.cli} 0.1.0-rc.2\n`,
    stderr: "",
    exitCode: 0,
  });
});
