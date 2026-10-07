import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
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
  await install(fixture.cliRoot, "cli", "0.1.0-rc.2", {
    dependencies: { [names.icons]: "^0.1.0" },
  });

  const project = new ProjectPackageVersionReader(fixture.project);
  const cli = new CliPackageVersionReader(fixture.entrypoint);

  assert.deepEqual(await project.read("icons"), [
    { name: names.icons, version: "0.1.0-rc.1" },
  ]);
  assert.deepEqual(await cli.readDependencies(), {
    root: { name: names.cli, version: "0.1.0-rc.2" },
    dependencies: [{ name: names.icons, version: "0.1.0-rc.2" }],
  });
  assert.deepEqual(await project.read("all"), [
    { name: names.icons, version: "0.1.0-rc.1" },
  ]);
});

test("routes each shell version form to the agreed project or CLI source", async (context) => {
  const fixture = await createFixture(context);
  await writeProject(fixture.project, { dependencies: { [names.icons]: "0.1.0-rc.1" } });
  await install(fixture.project, "icons", "0.1.0-rc.1");
  for (const selector of ["core", "icons", "svg"]) {
    await install(fixture.cliRoot, selector, "0.1.0-rc.2");
  }
  await install(fixture.cliRoot, "cli", "0.1.0-rc.2", {
    dependencies: { [names.core]: "^0.1.0", [names.icons]: "^0.1.0", [names.svg]: "^0.1.0" },
  });

  const shell = new NodeShell("Aster", "0.1.0-rc.2", fixture.project, fixture.entrypoint);
  const named = await shell.execute(["version", "icons", "--json"]);
  const all = await shell.execute(["version", "--all"]);
  const allJson = await shell.execute(["version", "--all", "--json"]);
  const cli = await shell.execute(["version", "cli", "--json"]);
  const dependencies = await shell.execute(["version", "cli", "--deps", "--json"]);

  assert.deepEqual(JSON.parse(named.stdout).payload, {
    kind: "package-versions",
    source: "project",
    packages: [{ name: names.icons, version: "0.1.0-rc.1" }],
  });
  assert.deepEqual(all, {
    stdout: `Project Aster packages:\n  ${names.icons} 0.1.0-rc.1\n`,
    stderr: "",
    exitCode: 0,
  });
  assert.deepEqual(JSON.parse(allJson.stdout).payload, {
    kind: "package-versions",
    source: "project",
    aggregate: true,
    packages: [{ name: names.icons, version: "0.1.0-rc.1" }],
  });
  assert.deepEqual(JSON.parse(cli.stdout).payload, {
    kind: "package-versions",
    source: "cli",
    packages: [{ name: names.cli, version: "0.1.0-rc.2" }],
  });
  assert.deepEqual(JSON.parse(dependencies.stdout).payload, {
    kind: "package-dependencies",
    source: "cli",
    groups: [{
      root: { name: names.cli, version: "0.1.0-rc.2" },
      dependencies: ["core", "icons", "svg"].map((selector) => ({
        name: names[selector], version: "0.1.0-rc.2",
      })),
    }],
  });
  assert.ok([named, allJson, cli, dependencies].every(({ exitCode }) => exitCode === 0));
});

test("reports a directly installed project CLI separately from the executed CLI", async (context) => {
  const fixture = await createFixture(context);
  await writeProject(fixture.project, { devDependencies: { [names.cli]: "0.1.0-rc.1" } });
  await install(fixture.project, "core", "0.1.0-rc.1");
  await install(fixture.project, "cli", "0.1.0-rc.1", {
    dependencies: { [names.core]: "^0.1.0" },
  });
  await install(fixture.cliRoot, "icons", "0.1.0-rc.2");
  await install(fixture.cliRoot, "cli", "0.1.0-rc.2", {
    dependencies: { [names.icons]: "^0.1.0" },
  });

  const shell = new NodeShell("Aster", "0.1.0-rc.2", fixture.project, fixture.entrypoint);
  const all = await shell.execute(["version", "--all", "--json"]);
  const namedCli = await shell.execute(["version", "cli", "--json"]);
  const projectDependencies = await shell.execute(["version", "--all", "--deps", "--json"]);
  const executedDependencies = await shell.execute(["version", "cli", "--deps", "--json"]);

  assert.deepEqual(JSON.parse(all.stdout).payload, {
    kind: "package-versions",
    source: "project",
    aggregate: true,
    packages: [{ name: names.cli, version: "0.1.0-rc.1" }],
  });
  assert.deepEqual(JSON.parse(namedCli.stdout).payload, {
    kind: "package-versions",
    source: "cli",
    packages: [{ name: names.cli, version: "0.1.0-rc.2" }],
  });
  assert.deepEqual(JSON.parse(projectDependencies.stdout).payload, {
    kind: "package-dependencies", source: "project", groups: [{
      root: { name: names.cli, version: "0.1.0-rc.1" },
      dependencies: [{ name: names.core, version: "0.1.0-rc.1" }],
    }],
  });
  assert.deepEqual(JSON.parse(executedDependencies.stdout).payload, {
    kind: "package-dependencies", source: "cli", groups: [{
      root: { name: names.cli, version: "0.1.0-rc.2" },
      dependencies: [{ name: names.icons, version: "0.1.0-rc.2" }],
    }],
  });
  assert.equal(all.exitCode, 0);
  assert.equal(namedCli.exitCode, 0);
  assert.equal(projectDependencies.exitCode, 0);
  assert.equal(executedDependencies.exitCode, 0);
});

test("reports the executed CLI module and canonical project comparison only on request", async (context) => {
  const fixture = await createFixture(context);
  const loaded = fileURLToPath(fixture.entrypoint);
  await install(fixture.cliRoot, "cli", "0.1.0-rc.2");
  await writeProject(fixture.project, { devDependencies: { [names.cli]: "^0.1.0" } });
  await install(fixture.project, "cli", "0.1.0-rc.2");
  const shell = new NodeShell("Aster", "0.1.0-rc.2", fixture.project, fixture.entrypoint);

  const plain = await shell.execute(["version", "--location", "--json"]);
  const named = await shell.execute(["version", "cli", "--location", "--json"]);
  assert.deepEqual(JSON.parse(plain.stdout).payload.location, {
    entrypoint: loaded, projectCli: "different",
  });
  assert.deepEqual(JSON.parse(named.stdout).payload.location, {
    entrypoint: loaded, projectCli: "different",
  });
  assert.match((await shell.execute(["version", "--location"])).stdout, /Project CLI: different installation/u);
  assert.equal(JSON.parse((await shell.execute(["version", "--json"])).stdout).payload.location, undefined);

  await writeProject(fixture.cliRoot, { dependencies: { [names.cli]: "^0.1.0" } });
  const same = new NodeShell("Aster", "0.1.0-rc.2", fixture.cliRoot, fixture.entrypoint);
  assert.equal(JSON.parse((await same.execute(["version", "cli", "--location", "--json"])).stdout).payload.location.projectCli, "same");
  assert.equal(JSON.parse((await same.execute(["version", "--location", "--deps", "--json"])).stdout).payload.location.projectCli, "same");
  assert.equal(JSON.parse((await same.execute(["version", "cli", "--deps", "--location", "--json"])).stdout).payload.location.projectCli, "same");

  await writeProject(fixture.project, {});
  assert.equal(JSON.parse((await shell.execute(["version", "--location", "--json"])).stdout).payload.location.projectCli, "absent");
  await writeFile(join(fixture.project, "package.json"), "{broken", "utf8");
  assert.equal(JSON.parse((await shell.execute(["version", "--location", "--json"])).stdout).payload.location.projectCli, "unavailable");

  const outside = join(fixture.root, "without project");
  await mkdir(outside);
  const noProject = new NodeShell("Aster", "0.1.0-rc.2", outside, fixture.entrypoint);
  assert.equal(JSON.parse((await noProject.execute(["version", "--location", "--json"])).stdout).payload.location.projectCli, "no-project");
});

test("renders empty projects and reports missing project versions as expected errors", async (context) => {
  const fixture = await createFixture(context);
  const shell = new NodeShell("Aster", "0.1.0-rc.2", fixture.project, fixture.entrypoint);

  assert.deepEqual(await shell.execute(["version", "--all"]), {
    stdout: "Project Aster packages:\n  (none)\n",
    stderr: "",
    exitCode: 0,
  });
  assert.deepEqual(JSON.parse((await shell.execute(["version", "--all", "--json"])).stdout).payload, {
    kind: "package-versions",
    source: "project",
    aggregate: true,
    packages: [],
  });
  assert.deepEqual(JSON.parse((await shell.execute(["version", "--all", "--deps", "--json"])).stdout).payload, {
    kind: "package-dependencies", source: "project", groups: [],
  });

  const missing = await shell.execute(["version", "icons"]);
  assert.equal(missing.exitCode, 1);
  assert.match(missing.stderr, /^\[ASTER-CLI-011\] .*not a direct dependency/u);

  const outside = join(fixture.root, "outside");
  await mkdir(outside);
  const outsideShell = new NodeShell("Aster", "0.1.0-rc.2", outside, fixture.entrypoint);
  const noProject = await outsideShell.execute(["version", "--all", "--json"]);
  assert.equal(noProject.exitCode, 1);
  assert.equal(JSON.parse(noProject.stdout).diagnostic.code, "ASTER-CLI-011");
  assert.doesNotMatch(noProject.stdout, /aster-cli-project-version-/u);
  assert.equal((await outsideShell.execute(["version", "cli"])).exitCode, 0);
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

test("groups direct project roots without flattening or inheriting development dependencies", async (context) => {
  const fixture = await createFixture(context);
  await writeProject(fixture.project, {
    dependencies: { [names.icons]: "^0.1.0", [names.svg]: "^0.1.0", [names.core]: "^0.1.0" },
  });
  await install(fixture.project, "core", "0.1.1");
  await install(fixture.project, "icons", "0.1.2", {
    dependencies: { [names.core]: "^0.1.0" },
  });
  await install(fixture.project, "svg", "0.1.3", {
    dependencies: { [names.core]: "^0.2.0" },
    devDependencies: { [names.icons]: "^0.1.0" },
  });
  const svgRoot = dirname(installedManifestPath(fixture.project, "svg"));
  await install(svgRoot, "core", "0.2.4");

  const shell = new NodeShell("Aster", "0.1.0-rc.2", fixture.project, fixture.entrypoint);
  const all = await shell.execute(["version", "--all", "--deps", "--json"]);
  assert.equal(all.exitCode, 0);
  assert.deepEqual(JSON.parse(all.stdout).payload, {
    kind: "package-dependencies", source: "project", groups: [
      { root: { name: names.core, version: "0.1.1" }, dependencies: [] },
      { root: { name: names.icons, version: "0.1.2" },
        dependencies: [{ name: names.core, version: "0.1.1" }] },
      { root: { name: names.svg, version: "0.1.3" },
        dependencies: [{ name: names.core, version: "0.2.4" }] },
    ],
  });
  assert.deepEqual(await shell.execute(["version", "core", "--deps"]), {
    stdout: `Project Aster package dependencies:\n${names.core} 0.1.1\n  (no Aster dependencies)\n`,
    stderr: "", exitCode: 0,
  });
  const svg = await shell.execute(["version", "svg", "--deps", "--json"]);
  assert.deepEqual(JSON.parse(svg.stdout).payload.groups[0].dependencies, [
    { name: names.core, version: "0.2.4" },
  ]);
});

test("fails the whole dependency query for a missing direct runtime dependency", async (context) => {
  const fixture = await createFixture(context);
  await writeProject(fixture.project, { dependencies: { [names.icons]: "^0.1.0" } });
  await install(fixture.project, "icons", "0.1.2", {
    dependencies: { [names.core]: "^0.1.0" },
  });
  const shell = new NodeShell("Aster", "0.1.0-rc.2", fixture.project, fixture.entrypoint);
  for (const argv of [["version", "icons", "--deps"], ["version", "--all", "--deps"]]) {
    const result = await shell.execute(argv);
    assert.equal(result.exitCode, 1);
    assert.match(result.stderr, /^\[ASTER-CLI-011\]/u);
    assert.equal(result.stdout, "");
  }
  assert.equal((await shell.execute(["version", "icons"])).exitCode, 0);
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
  await install(fixture.cliRoot, "cli", "0.1.0-rc.2", {
    dependencies: { [names.icons]: "^0.1.0" },
  });

  const reader = new ProjectPackageVersionReader(fixture.project);

  await assert.rejects(reader.read("icons"), ProjectPackageVersionError);
  await assert.rejects(reader.read("all"), ProjectPackageVersionError);
  assert.deepEqual((await new CliPackageVersionReader(fixture.entrypoint).readDependencies()).dependencies, [
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
