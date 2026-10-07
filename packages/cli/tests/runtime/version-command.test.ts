import assert from "node:assert/strict";
import test from "node:test";

import { AsterCommands } from "../../src/index.js";
import type { AsterCommandContext } from "../../src/index.js";

const versions = [
  { name: "@luscious-garden/aster-svg", version: "0.4.0" },
  { name: "@luscious-garden/aster-core", version: "0.2.0" },
  { name: "@luscious-garden/aster-cli", version: "0.3.0" },
  { name: "@luscious-garden/aster-icons", version: "0.1.0" },
];

function context(
  packageVersions?: unknown,
  packageDependencies?: unknown,
  cliLocation?: unknown,
): AsterCommandContext {
  return {
    catalogues: [],
    productName: "Aster",
    productVersion: "0.3.0",
    ...(packageVersions === undefined ? {} : { packageVersions: packageVersions as never }),
    ...(packageDependencies === undefined ? {} : { packageDependencies: packageDependencies as never }),
    ...(cliLocation === undefined ? {} : { cliLocation: cliLocation as never }),
  };
}

test("retains plain and named CLI versions without package evidence", async () => {
  const plain = await AsterCommands.execute({ command: "version" }, context());
  const cli = await AsterCommands.execute({ command: "version", scope: "cli" }, context());

  assert.deepEqual(plain, {
    ok: true,
    command: "version",
    payload: { kind: "version", productName: "Aster", productVersion: "0.3.0" },
  });
  assert.deepEqual(cli, {
    ok: true,
    command: "version",
    payload: {
      kind: "package-versions",
      source: "cli",
      packages: [{ name: "@luscious-garden/aster-cli", version: "0.3.0" }],
    },
  });
});

test("selects project versions and orders only direct project evidence", async () => {
  const input = versions.map((entry) => ({ ...entry }));
  const supplied = context({ source: "project", packages: input });
  const named = await AsterCommands.execute({ command: "version", scope: "svg" }, supplied);
  const all = await AsterCommands.execute({ command: "version", scope: "all" }, supplied);

  assert.deepEqual(named, {
    ok: true,
    command: "version",
    payload: {
      kind: "package-versions",
      source: "project",
      packages: [{ name: "@luscious-garden/aster-svg", version: "0.4.0" }],
    },
  });
  assert.deepEqual(all, {
    ok: true,
    command: "version",
    payload: {
      kind: "package-versions",
      source: "project",
      aggregate: true,
      packages: [versions[1], versions[3], versions[0], versions[2]],
    },
  });
  assert.ok(all.ok && Object.isFrozen(all.payload));
  assert.ok(all.ok && all.payload.kind === "package-versions" && Object.isFrozen(all.payload.packages));

  input[0]!.version = "changed";
  assert.equal(JSON.stringify(all).includes("changed"), false);
});

test("preserves empty and one-package project aggregates", async () => {
  const empty = await AsterCommands.execute(
    { command: "version", scope: "all" },
    context({ source: "project", packages: [] }),
  );
  const one = await AsterCommands.execute(
    { command: "version", scope: "all" },
    context({ source: "project", packages: [versions[3]] }),
  );

  assert.deepEqual(empty, {
    ok: true,
    command: "version",
    payload: { kind: "package-versions", source: "project", aggregate: true, packages: [] },
  });
  assert.deepEqual(one, {
    ok: true,
    command: "version",
    payload: {
      kind: "package-versions",
      source: "project",
      aggregate: true,
      packages: [versions[3]],
    },
  });
});

test("groups the executed CLI and only its direct dependencies for both aliases", async () => {
  const evidence = { source: "cli", groups: [{
    root: versions[2],
    dependencies: [versions[0], versions[1]],
  }] };
  const plain = await AsterCommands.execute(
    { command: "version", dependencies: true },
    context(undefined, evidence),
  );
  const named = await AsterCommands.execute(
    { command: "version", scope: "cli", dependencies: true },
    context(undefined, evidence),
  );

  assert.deepEqual(plain, named);
  assert.deepEqual(plain, {
    ok: true,
    command: "version",
    payload: {
      kind: "package-dependencies",
      source: "cli",
      groups: [{ root: versions[2], dependencies: [versions[1], versions[0]] }],
    },
  });
});

test("preserves empty and independent project dependency groups", async () => {
  const groups = [
    { root: versions[0], dependencies: [{ name: versions[1]!.name, version: "0.9.0" }] },
    { root: versions[1], dependencies: [] },
    { root: versions[3], dependencies: [versions[1]] },
  ];
  const supplied = context(undefined, { source: "project", groups });
  const all = await AsterCommands.execute({ command: "version", scope: "all", dependencies: true }, supplied);
  const core = await AsterCommands.execute(
    { command: "version", scope: "core", dependencies: true },
    context(undefined, { source: "project", groups: [groups[1]] }),
  );
  const empty = await AsterCommands.execute(
    { command: "version", scope: "all", dependencies: true },
    context(undefined, { source: "project", groups: [] }),
  );

  assert.deepEqual(all, {
    ok: true,
    command: "version",
    payload: {
      kind: "package-dependencies",
      source: "project",
      groups: [groups[1], groups[2], groups[0]],
    },
  });
  assert.deepEqual(core, {
    ok: true,
    command: "version",
    payload: { kind: "package-dependencies", source: "project", groups: [groups[1]] },
  });
  assert.deepEqual(empty, {
    ok: true,
    command: "version",
    payload: { kind: "package-dependencies", source: "project", groups: [] },
  });
  assert.ok(all.ok && Object.isFrozen(all.payload));
  groups[0]!.dependencies[0]!.version = "changed";
  assert.equal(JSON.stringify(all).includes("changed"), false);
});

test("adds executed-CLI location only when requested", async () => {
  const location = { entrypoint: "C:\\tools\\aster.js", projectCli: "different" };
  const plain = await AsterCommands.execute({ command: "version", location: true }, context(undefined, undefined, location));
  const named = await AsterCommands.execute({ command: "version", scope: "cli", location: true }, context(undefined, undefined, location));
  const dependencies = await AsterCommands.execute(
    { command: "version", scope: "cli", dependencies: true, location: true },
    context(undefined, { source: "cli", groups: [{ root: versions[2], dependencies: [] }] }, location),
  );

  assert.ok(plain.ok && plain.payload.kind === "version");
  if (plain.ok && plain.payload.kind === "version") {
    assert.deepEqual(plain.payload.location, location);
  }
  assert.ok(named.ok && named.payload.kind === "package-versions");
  if (named.ok && named.payload.kind === "package-versions") {
    assert.deepEqual(named.payload.location, location);
  }
  assert.ok(dependencies.ok && dependencies.payload.kind === "package-dependencies");
  if (dependencies.ok && dependencies.payload.kind === "package-dependencies") {
    assert.deepEqual(dependencies.payload.location, location);
  }
  assert.equal(JSON.stringify(await AsterCommands.execute({ command: "version" }, context())),
    '{"ok":true,"command":"version","payload":{"kind":"version","productName":"Aster","productVersion":"0.3.0"}}');
});

test("keeps project and CLI evidence isolated", async () => {
  for (const [invocation, evidence] of [
    [{ command: "version", scope: "icons" }, { source: "cli", packages: versions }],
    [{ command: "version", scope: "all" }, { source: "cli", packages: versions }],
  ] as const) {
    const result = await AsterCommands.execute(invocation, context(evidence));
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.diagnostic.code, "ASTER-CLI-002");
    }
  }

  for (const [invocation, evidence] of [
    [{ command: "version", dependencies: true }, { source: "project", groups: [{ root: versions[2], dependencies: [] }] }],
    [{ command: "version", dependencies: true }, { source: "cli", groups: [{ root: versions[1], dependencies: [] }] }],
    [{ command: "version", dependencies: true }, { source: "cli", groups: [{ root: { ...versions[2], version: "0.2.0" }, dependencies: [] }] }],
    [{ command: "version", scope: "icons", dependencies: true }, { source: "cli", groups: [{ root: versions[3], dependencies: [] }] }],
    [{ command: "version", scope: "icons", dependencies: true }, { source: "project", groups: [{ root: versions[1], dependencies: [] }] }],
  ] as const) {
    const result = await AsterCommands.execute(invocation, context(undefined, evidence));
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.diagnostic.code, "ASTER-CLI-002");
    }
  }
});

test("resolves scoped versions without invoking catalogue providers", async () => {
  let calls = 0;
  const provider = {
    identity: "testing",
    discover() {
      calls += 1;
      throw new Error("provider must not be used");
    },
    loadIcon() {
      calls += 1;
      throw new Error("provider must not be used");
    },
    loadCollection() {
      calls += 1;
      throw new Error("provider must not be used");
    },
  };
  const result = await AsterCommands.execute(
    { command: "version", scope: "svg" },
    {
      catalogues: [provider],
      productName: "Aster",
      productVersion: "0.3.0",
      packageVersions: { source: "project", packages: [versions[0]!] },
    } as AsterCommandContext,
  );

  assert.equal(result.ok, true);
  assert.equal(calls, 0);
});

test("rejects invalid invocations and malformed host evidence", async () => {
  for (const invocation of [
    { command: "version", scope: "import" },
    { command: "version", scope: undefined },
    { command: "version", scope: 1 },
    { command: "version", scope: "all", extra: true },
    { command: "version", scope: "cli", dependencies: false },
    { command: "version", scope: "icons", location: true },
    { command: "version", scope: "all", location: true },
    { command: "version", location: false },
  ]) {
    const result = await AsterCommands.execute(invocation as never, context());
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.diagnostic.code, "ASTER-CLI-001");
    }
  }

  for (const candidate of [
    [],
    { source: "unknown", packages: versions },
    { source: "cli", packages: [] },
    { source: "project", packages: [versions[0], versions[0]] },
    { source: "project", packages: [{ name: "@luscious-garden/aster-import", version: "0.1.0" }] },
    { source: "project", packages: [{ name: "@luscious-garden/aster-core", version: " 0.1.0 " }] },
    { source: "project", packages: [{ name: "@luscious-garden/aster-core", version: "0.1.0", extra: true }] },
    { source: "project", packages: Array(1) },
    { source: "project", packages: [], extra: true },
  ]) {
    const result = await AsterCommands.execute(
      { command: "version", scope: "all" },
      context(candidate),
    );
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.diagnostic.code, "ASTER-CLI-002");
    }
  }

  for (const candidate of [
    { source: "cli", groups: [] },
    { source: "project", groups: [{ root: versions[1], dependencies: [versions[1]] }] },
    { source: "project", groups: [{ root: versions[1], dependencies: [versions[0], versions[0]] }] },
    { source: "project", groups: [{ root: versions[1], dependencies: [] }, { root: versions[1], dependencies: [] }] },
    { source: "project", groups: [{ root: versions[1], dependencies: Array(1) }] },
    { source: "project", groups: [{ root: versions[1], dependencies: [], extra: true }] },
  ]) {
    const result = await AsterCommands.execute(
      { command: "version", scope: "all", dependencies: true },
      context(undefined, candidate),
    );
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.diagnostic.code, "ASTER-CLI-002");
    }
  }

  for (const candidate of [
    { entrypoint: "", projectCli: "same" },
    { entrypoint: "C:\\aster.js", projectCli: "global" },
    { entrypoint: "C:\\aster.js", projectCli: "same", extra: true },
  ]) {
    const result = await AsterCommands.execute(
      { command: "version", location: true },
      context(undefined, undefined, candidate),
    );
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.diagnostic.code, "ASTER-CLI-002");
    }
  }
});

test("rejects accessor-backed evidence without executing it", async () => {
  let calls = 0;
  const hostile = {
    catalogues: [],
    productName: "Aster",
    productVersion: "0.3.0",
    get packageVersions() {
      calls += 1;
      return { source: "project", packages: versions };
    },
  };
  const result = await AsterCommands.execute({ command: "version", scope: "all" }, hostile as never);

  assert.equal(result.ok, false);
  assert.equal(calls, 0);
  if (!result.ok) {
    assert.equal(result.diagnostic.code, "ASTER-CLI-002");
  }
});

test("rejects nested evidence accessors without executing them", async () => {
  let calls = 0;

  for (const field of ["source", "packages"]) {
    const evidence = { source: "project", packages: versions };
    Object.defineProperty(evidence, field, {
      enumerable: true,
      get() {
        calls += 1;
        throw new Error("evidence accessor must not execute");
      },
    });
    const result = await AsterCommands.execute(
      { command: "version", scope: "all" },
      context(evidence),
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.diagnostic.code, "ASTER-CLI-002");
    }
  }

  assert.equal(calls, 0);
});
