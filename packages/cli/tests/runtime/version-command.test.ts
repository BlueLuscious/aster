import assert from "node:assert/strict";
import test from "node:test";

import { AsterCommands } from "../../src/index.js";

const versions = [
  { name: "@luscious-garden/aster-svg", version: "0.4.0" },
  { name: "@luscious-garden/aster-core", version: "0.2.0" },
  { name: "@luscious-garden/aster-cli", version: "0.3.0" },
  { name: "@luscious-garden/aster-icons", version: "0.1.0" },
];

function context(packageVersions?: unknown): unknown {
  return {
    catalogues: [],
    productName: "Aster",
    productVersion: "0.3.0",
    ...(packageVersions === undefined ? {} : { packageVersions }),
  };
}

test("retains plain version output without package evidence", async () => {
  const result = await AsterCommands.execute({ command: "version" }, context() as never);

  assert.deepEqual(result, {
    ok: true,
    command: "version",
    payload: { kind: "version", productName: "Aster", productVersion: "0.3.0" },
  });
});

test("selects one explicit version and orders the complete family without providers", async () => {
  const input = versions.map((entry) => ({ ...entry }));
  const supplied = context(input);
  const named = await AsterCommands.execute(
    { command: "version", scope: "svg" },
    supplied as never,
  );
  const all = await AsterCommands.execute(
    { command: "version", scope: "all" },
    supplied as never,
  );

  assert.deepEqual(named, {
    ok: true,
    command: "version",
    payload: {
      kind: "package-versions",
      packages: [{ name: "@luscious-garden/aster-svg", version: "0.4.0" }],
    },
  });
  assert.equal(all.ok, true);

  if (all.ok && all.payload.kind === "package-versions") {
    assert.deepEqual(all.payload.packages.map(({ name }) => name), [
      "@luscious-garden/aster-core",
      "@luscious-garden/aster-icons",
      "@luscious-garden/aster-svg",
      "@luscious-garden/aster-cli",
    ]);
    assert.ok(Object.isFrozen(all.payload.packages));
    assert.ok(all.payload.packages.every(Object.isFrozen));
  }

  input[0]!.version = "changed";
  assert.equal(JSON.stringify(all).includes("changed"), false);
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
      packageVersions: [versions[0]],
    } as never,
  );

  assert.equal(result.ok, true);
  assert.equal(calls, 0);
});

test("rejects invalid scopes, missing evidence, and malformed host records", async () => {
  for (const invocation of [
    { command: "version", scope: "import" },
    { command: "version", scope: undefined },
    { command: "version", scope: 1 },
    { command: "version", scope: "all", extra: true },
  ]) {
    const result = await AsterCommands.execute(invocation as never, context(versions) as never);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.diagnostic.code, "ASTER-CLI-001");
    }
  }

  for (const candidate of [
    undefined,
    [],
    [versions[0], versions[0]],
    versions.slice(0, 3),
    [{ name: "@luscious-garden/aster-import", version: "0.1.0" }],
    [{ name: "@luscious-garden/aster-core", version: " 0.1.0 " }],
    [{ name: "@luscious-garden/aster-core", version: "0.1.0", extra: true }],
    Array(1),
  ]) {
    const result = await AsterCommands.execute(
      { command: "version", scope: "all" },
      context(candidate) as never,
    );
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.diagnostic.code, "ASTER-CLI-002");
    }
  }
});

test("rejects accessor-backed package evidence without executing it", async () => {
  let calls = 0;
  const hostile = {
    catalogues: [],
    productName: "Aster",
    productVersion: "0.3.0",
    get packageVersions() {
      calls += 1;
      return versions;
    },
  };
  const result = await AsterCommands.execute(
    { command: "version", scope: "all" },
    hostile,
  );

  assert.equal(result.ok, false);
  assert.equal(calls, 0);
  if (!result.ok) {
    assert.equal(result.diagnostic.code, "ASTER-CLI-002");
  }
});
