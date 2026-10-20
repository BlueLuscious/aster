import assert from "node:assert/strict";
import { readFile, rm, symlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import { Icon } from "@luscious-garden/aster-core";
import { AsterCommands } from "@luscious-garden/aster-cli";
import { BenchmarkCatalogueFixtureFactory } from "../../tooling/performance/shared/runtime/benchmark-catalogue-fixture.factory.mjs";
import { BenchmarkModuleFixtureFactory } from "../../tooling/performance/icons/runtime/benchmark-module-fixture.factory.mjs";
import { BenchmarkWorkspace } from "../../tooling/performance/shared/runtime/benchmark-workspace.mjs";

test("prepares the empty through thousand-definition ladder with exact unique cardinalities", () => {
  const factory = new BenchmarkCatalogueFixtureFactory();
  for (const count of [0, 1, 10, 100, 1_000]) {
    const fixture = factory.createScaled({ definitions: count });
    assert.equal(fixture.icons.length, count);
    assert.equal(fixture.counts.definitions, count);
    assert.equal(fixture.counts.glyphs, count);
    assert.equal(fixture.counts.membershipReferences, count);
    assert.equal(fixture.counts.discoveryRecords, count);
    assert.equal(
      new Set(fixture.icons.map((icon) => JSON.stringify(icon.identity))).size,
      count,
    );
    assert.ok(fixture.icons.every((icon) => Icon.define(icon) === icon));
    assert.ok(
      fixture.icons.every(
        (icon, index) => icon !== fixture.mutableIcons[index],
      ),
    );
    assert.ok(fixture.mutableIcons.every((icon) => !Object.isFrozen(icon)));
    assert.equal(fixture.collections[0].members.length, count);
  }
  assert.equal(factory.create().icons.length, 16);
});

test("varies treatment shape, geometry, output width and collection count independently", () => {
  const factory = new BenchmarkCatalogueFixtureFactory();
  const base = factory.createScaled({
    definitions: 30,
    variantsPerGlyph: 3,
    collections: 0,
  });
  const geometry = factory.createScaled({
    definitions: 30,
    variantsPerGlyph: 3,
    collections: 0,
    nodesPerDefinition: 2,
    pointsPerNode: 8,
    labelWidth: 80,
  });
  assert.equal(base.counts.glyphs, 10);
  assert.equal(base.counts.totalNodes, 30);
  assert.equal(geometry.counts.totalNodes, 60);
  assert.equal(geometry.counts.totalPoints, 480);
  assert.equal(geometry.icons[0].metadata.displayName.length, 80);
  assert.deepEqual(
    base.icons.map((icon) => icon.identity),
    geometry.icons.map((icon) => icon.identity),
  );
  assert.equal(base.counts.collections, 0);
  assert.equal(base.counts.membershipReferences, 0);
});

test("derives actual shared versus disjoint references without duplicates inside a selection", () => {
  const factory = new BenchmarkCatalogueFixtureFactory();
  for (const shared of [0, 5, 10]) {
    const fixture = factory.createScaled({
      definitions: 30,
      collections: 3,
      membersPerCollection: 10,
      sharedMembers: shared,
    });
    assert.equal(fixture.counts.membershipReferences, 30);
    assert.equal(
      fixture.counts.selectedDefinitions,
      shared + 3 * (10 - shared),
    );
    assert.ok(
      fixture.collections.every(
        (collection) => new Set(collection.members).size === 10,
      ),
    );
    assert.ok(
      fixture.collections.every((collection) =>
        collection.members.every((icon) => fixture.icons.includes(icon)),
      ),
    );
  }
  assert.throws(
    () => factory.createScaled({ definitions: 10, collections: 3 }),
    /membership/u,
  );
});

test("prepares coherent partitioned and overlapping providers without implicit identity merging", async () => {
  const factory = new BenchmarkCatalogueFixtureFactory();
  for (const overlap of [0, 2]) {
    const fixture = factory.createScaled({
      definitions: 12,
      collections: 0,
      providers: 2,
      overlappingDefinitions: overlap,
    });
    const discoveries = await Promise.all(
      fixture.providers.map((provider) => provider.discover()),
    );
    assert.equal(
      discoveries.reduce((sum, discovery) => sum + discovery.icons.length, 0),
      12 + overlap,
    );
    assert.equal(fixture.counts.discoveryRecords, 12 + overlap);
    const listed = await AsterCommands.execute(
      { command: "list", subject: "icons" },
      {
        catalogues: fixture.providers,
        productName: "Aster",
        productVersion: "0.0.0",
      },
    );
    assert.equal(listed.ok, true);
    assert.equal(listed.payload.icons.length, 12 + overlap);
    const identity = fixture.icons[0].identity;
    assert.equal(
      await fixture.providers[0].loadIcon(identity),
      fixture.icons[0],
    );
    assert.equal(
      await fixture.providers[1].loadIcon(identity),
      overlap ? fixture.icons[0] : undefined,
    );
  }
});

test("closes provider collection membership locally and reports added discovery records", async () => {
  const fixture = new BenchmarkCatalogueFixtureFactory().createScaled({
    definitions: 12,
    collections: 2,
    membersPerCollection: 6,
    providers: 2,
  });
  for (const provider of fixture.providers) {
    const discovered = await provider.discover();
    const keys = new Set(
      discovered.icons.map((icon) => JSON.stringify(icon.identity)),
    );
    assert.ok(
      discovered.collections.every((collection) =>
        collection.memberIdentities.every((identity) =>
          keys.has(JSON.stringify(identity)),
        ),
      ),
    );
    assert.equal(
      await provider.loadCollection(discovered.collections[0].identity),
      fixture.collections.find(
        (collection) =>
          JSON.stringify(collection.identity) ===
          JSON.stringify(discovered.collections[0].identity),
      ),
    );
  }
  const listed = await AsterCommands.execute(
    { command: "list", subject: "collections" },
    {
      catalogues: fixture.providers,
      productName: "Aster",
      productVersion: "0.0.0",
    },
  );
  assert.equal(listed.ok, true);
});

test("prepares explicit input ownership without mistaking frozen copies for local recognition", async () => {
  const factory = new BenchmarkCatalogueFixtureFactory();
  const fixture = factory.createScaled({ definitions: 3 });
  assert.equal(factory.inputs(fixture, "canonical"), fixture.icons);
  assert.equal(factory.inputs(fixture, "mutable"), fixture.mutableIcons);
  for (const ownership of ["shallow", "clone", "json"]) {
    const copies = factory.inputs(fixture, ownership);
    assert.deepEqual(copies, fixture.icons);
    assert.ok(copies.every((icon, index) => icon !== fixture.icons[index]));
    assert.ok(copies.every((icon) => Icon.define(icon) !== icon));
  }
  assert.throws(
    () => factory.inputs(fixture, "foreign", Icon),
    /separate Core/u,
  );
  assert.throws(() => factory.inputs(fixture, "foreign"), /separate Core/u);
  assert.throws(() => factory.inputs(fixture, "invented"), /ownership/u);
  const workspace = await BenchmarkWorkspace.create();
  try {
    const copied = await workspace.copyPackage(
      "foreign-core",
      resolve("packages/core"),
    );
    const foreign = await import(
      pathToFileURL(join(copied, "dist/index.js")).href
    );
    const inputs = factory.inputs(fixture, "foreign", foreign.Icon);
    assert.deepEqual(inputs, fixture.icons);
    assert.ok(
      inputs.every(
        (icon) =>
          Object.isFrozen(icon) &&
          foreign.Icon.define(icon) === icon &&
          Icon.define(icon) !== icon,
      ),
    );
  } finally {
    await workspace.dispose();
  }
});

test("rejects invalid allocation/cardinality controls before generating a large fixture", () => {
  const factory = new BenchmarkCatalogueFixtureFactory();
  for (const options of [
    { definitions: -1 },
    { definitions: 1.5 },
    { definitions: 10_001 },
    { definitions: 10, variantsPerGlyph: 3 },
    { providers: 9 },
    { variantsPerGlyph: 0 },
    { pointsPerNode: 1 },
    { labelWidth: Infinity },
    { nodesPerDefinition: 0 },
    { definitions: 1_000, nodesPerDefinition: 1_000, pointsPerNode: 2 },
    { overlappingDefinitions: 17 },
    { sharedMembers: 17 },
  ]) {
    assert.throws(() => factory.createScaled(options), TypeError);
  }
});

test("publishes bounded distinct leaf and glyph modules through their canonical fixture producer", async () => {
  const workspace = await BenchmarkWorkspace.create();
  try {
    const fixture = new BenchmarkCatalogueFixtureFactory().createScaled({
      definitions: 6,
      variantsPerGlyph: 3,
    });
    const modules = await new BenchmarkModuleFixtureFactory().create(
      workspace,
      fixture.icons,
      pathToFileURL(resolve("packages/core/dist/index.js")).href,
    );
    assert.equal(modules.definitions, 6);
    assert.equal(modules.distinctGlyphs, 2);
    assert.equal(new Set(modules.leaves).size, 6);
    const leaf = await import(modules.leaves[0]);
    const dictionary = await import(modules.glyphs[0]);
    assert.deepEqual(Object.keys(dictionary), ["variants"]);
    assert.deepEqual(Object.keys(dictionary.variants), [
      "treatment0",
      "treatment1",
      "treatment2",
    ]);
    assert.equal(dictionary.variants.treatment0, leaf.definition);
    assert.equal(Icon.define(leaf.definition), leaf.definition);
    assert.match(
      await readFile(new URL(modules.leaves[0]), "utf8"),
      /^\/\/ Generated by tooling\/performance\/icons\/runtime\/benchmark-module-fixture\.factory\.mjs/u,
    );
    await assert.rejects(
      new BenchmarkModuleFixtureFactory().create(
        workspace,
        [fixture.icons[0], fixture.icons[0]],
        pathToFileURL(resolve("packages/core/dist/index.js")).href,
      ),
      /distinct/u,
    );
  } finally {
    await workspace.dispose();
  }
});

test("contains temporary publication and enforces replacement-aware file/byte budgets", async () => {
  const workspace = await BenchmarkWorkspace.create({
    maximumFiles: 1,
    maximumBytes: 4,
  });
  const root = workspace.root;
  try {
    for (const path of [
      "../outside",
      resolve("outside"),
      ".benchmark-owner",
      "child/../../outside",
      "",
    ]) {
      await assert.rejects(workspace.write(path, "x"), /boundary/u);
    }
    await workspace.write("owned.mjs", "1234");
    await workspace.write("owned.mjs", "x");
    await assert.rejects(workspace.write("other.mjs", "x"), /budget/u);
    await assert.rejects(workspace.write("owned.mjs", "12345"), /budget/u);
    assert.equal(await readFile(join(root, "owned.mjs"), "utf8"), "x");
  } finally {
    await workspace.dispose();
  }
  await assert.rejects(readFile(join(root, "owned.mjs")), { code: "ENOENT" });
});

test("refuses junction traversal or recursive cleanup without touching the external target", async () => {
  const workspace = await BenchmarkWorkspace.create();
  const external = await BenchmarkWorkspace.create();
  const link = join(workspace.root, "external");
  try {
    await external.write("keep.txt", "preserve");
    await symlink(
      external.root,
      link,
      process.platform === "win32" ? "junction" : "dir",
    );
    await assert.rejects(
      workspace.write("external/keep.txt", "replace"),
      /symbolic links/u,
    );
    await assert.rejects(workspace.dispose(), /symbolic links/u);
    assert.equal(
      await readFile(join(external.root, "keep.txt"), "utf8"),
      "preserve",
    );
  } finally {
    await rm(link, { force: true });
    await workspace.dispose();
    await external.dispose();
  }
});

test("refuses ownership-marker substitution and forged workspace construction", async () => {
  const workspace = await BenchmarkWorkspace.create();
  const marker = join(workspace.root, ".benchmark-owner");
  const token = await readFile(marker, "utf8");
  try {
    assert.throws(
      () =>
        new BenchmarkWorkspace(
          workspace.root,
          token,
          { maximumFiles: 1, maximumBytes: 1 },
          Symbol("forged"),
        ),
      /acquire/u,
    );
    await writeFile(marker, "changed");
    await assert.rejects(workspace.write("unowned.txt", "x"), /ownership/u);
    await assert.rejects(workspace.dispose(), /ownership/u);
  } finally {
    await writeFile(marker, token);
    await workspace.dispose();
  }
});
