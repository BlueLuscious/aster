import assert from "node:assert/strict";
import test from "node:test";
import {
  AsterCommands,
  type AsterCommandInvocationType,
} from "../../src/index.js";
import { HumanOutputPresenter } from "../../src/shell/presentation/runtime/human-output.presenter.js";
import type {
  CatalogueDiscovery,
  CatalogueDiscoveryIconRecord,
  CatalogueProvider,
} from "../../src/catalogue/contracts/index.js";

function record(
  name: string,
  variant: string,
  namespace?: string,
): CatalogueDiscoveryIconRecord {
  return {
    identity: {
      name,
      variant,
      ...(namespace === undefined ? {} : { namespace }),
    },
    metadata: {
      displayName: `${name} ${variant}`,
      tags: [variant],
      rtl: "preserve",
      deprecated: false,
    },
    memberships: [],
  };
}

function fixture(identity: string, discovery: CatalogueDiscovery) {
  const calls = { discovery: 0, icons: 0, collections: 0 };
  const provider: CatalogueProvider = {
    identity,
    async discover() {
      calls.discovery += 1;
      return discovery;
    },
    async loadIcon() {
      calls.icons += 1;
      throw new Error("Unexpected icon load");
    },
    async loadCollection() {
      calls.collections += 1;
      throw new Error("Unexpected collection load");
    },
  };
  return { provider, calls };
}

function context(providers: readonly CatalogueProvider[]) {
  return {
    catalogues: providers,
    productName: "Aster",
    productVersion: "0.0.0",
  };
}

test("derives ordered provider-scoped glyphs without loading or merging definitions", async () => {
  const first = fixture("zeta", {
    icons: [record("camera", "outline", "aster")],
    collections: [],
  });
  const second = fixture("alpha", {
    icons: [
      record("camera-retro", "outline", "aster"),
      record("camera", "outline", "aster"),
      record("camera", "filled-dotted", "aster"),
      record("camera", "outline", "acme"),
      record("camera", "outline"),
    ],
    collections: [],
  });
  const result = await AsterCommands.execute(
    { command: "list", subject: "glyphs" },
    context([first.provider, second.provider]),
  );
  assert.ok(result.ok && result.payload.kind === "glyph-list");
  assert.deepEqual(
    result.payload.glyphs.map(({ catalogue, identity }) => [
      catalogue,
      identity.namespace,
      identity.name,
    ]),
    [
      ["alpha", "acme", "camera"],
      ["alpha", "aster", "camera"],
      ["alpha", "aster", "camera-retro"],
      ["alpha", undefined, "camera"],
      ["zeta", "aster", "camera"],
    ],
  );
  const camera = result.payload.glyphs[1];
  assert.ok(camera);
  assert.deepEqual(Object.keys(camera), [
    "kind",
    "catalogue",
    "identity",
    "variants",
  ]);
  assert.equal(camera.kind, "glyph");
  assert.deepEqual(
    camera.variants.map(({ identity }) => identity.variant),
    ["filled-dotted", "outline"],
  );
  assert.deepEqual(Object.keys(camera.identity), ["namespace", "name"]);
  assert.ok(Object.isFrozen(result.payload.glyphs));
  assert.ok(
    Object.isFrozen(camera) &&
      Object.isFrozen(camera.identity) &&
      Object.isFrozen(camera.variants),
  );
  assert.ok(
    camera.variants.every(
      (variant) =>
        Object.isFrozen(variant) &&
        Object.isFrozen(variant.metadata) &&
        Object.isFrozen(variant.memberships),
    ),
  );
  assert.deepEqual(first.calls, { discovery: 1, icons: 0, collections: 0 });
  assert.deepEqual(second.calls, { discovery: 1, icons: 0, collections: 0 });
});

test("resolves exact glyphs with provider disambiguation and no namespace fallback", async () => {
  const discovery = {
    icons: [
      record("camera", "outline", "aster"),
      record("camera", "filled", "aster"),
    ],
    collections: [],
  };
  const first = fixture("alpha", discovery);
  const second = fixture("beta", discovery);
  const host = context([second.provider, first.provider]);
  const ambiguous = await AsterCommands.execute(
    { command: "show", subject: "glyph", identity: "aster/camera" },
    host,
  );
  assert.ok(!ambiguous.ok);
  assert.equal(ambiguous.diagnostic.code, "ASTER-CLI-005");
  assert.deepEqual(ambiguous.diagnostic.details, {
    kind: "ambiguity",
    subject: "glyph",
    identity: "aster/camera",
    catalogues: ["alpha", "beta"],
  });
  const selected = await AsterCommands.execute(
    {
      command: "show",
      subject: "glyph",
      identity: "aster/camera",
      catalogue: "beta",
    },
    host,
  );
  assert.ok(selected.ok && selected.payload.kind === "glyph-show");
  assert.equal(selected.payload.glyph.catalogue, "beta");
  assert.deepEqual(
    selected.payload.glyph.variants.map(({ identity }) => identity.variant),
    ["filled", "outline"],
  );
  for (const identity of ["camera", "acme/camera", "aster/absent"]) {
    const absent = await AsterCommands.execute(
      { command: "show", subject: "glyph", identity },
      host,
    );
    assert.ok(!absent.ok);
    assert.equal(absent.diagnostic.code, "ASTER-CLI-004");
  }
  assert.equal(
    first.calls.icons +
      second.calls.icons +
      first.calls.collections +
      second.calls.collections,
    0,
  );
});

test("combines glyph, collection and tag predicates without hiding unknown glyphs", async () => {
  const outline = {
    ...record("camera", "outline", "aster"),
    memberships: [{ name: "selected" }],
  };
  const filled = record("camera", "filled", "aster");
  const sample = fixture("sample", {
    icons: [filled, outline, record("camera", "outline", "acme")],
    collections: [
      {
        identity: { name: "selected" },
        metadata: { displayName: "Selected" },
        memberIdentities: [outline.identity],
      },
    ],
  });
  const host = context([sample.provider]);
  for (const [filters, variants] of [
    [{}, ["filled", "outline"]],
    [{ collection: "selected" }, ["outline"]],
    [{ tags: ["filled"] }, ["filled"]],
    [{ collection: "selected", tags: ["filled"] }, []],
    [{ tags: ["filled", "outline"] }, []],
  ] as const) {
    const result = await AsterCommands.execute(
      { command: "list", subject: "icons", glyph: "aster/camera", ...filters },
      host,
    );
    assert.ok(result.ok && result.payload.kind === "icon-list");
    assert.deepEqual(
      result.payload.icons.map(({ identity }) => identity.variant),
      variants,
    );
  }
  for (const request of [
    { glyph: "absent", tags: ["nothing"] },
    { glyph: "absent", collection: "absent" },
    { glyph: "aster/camera", collection: "absent" },
    { glyph: "aster/camera", catalogue: "absent" },
  ]) {
    const result = await AsterCommands.execute(
      { command: "list", subject: "icons", ...request },
      host,
    );
    assert.ok(!result.ok);
    assert.equal(result.diagnostic.code, "ASTER-CLI-004");
    if (request.glyph === "absent") {
      assert.match(result.diagnostic.message, /glyph absent/u);
    }
  }
  assert.equal(sample.calls.icons + sample.calls.collections, 0);
});

test("preserves independent icon-list results when several providers offer the same glyph", async () => {
  const discovery = {
    icons: [record("camera", "outline", "aster")],
    collections: [],
  };
  const providers = [
    fixture("beta", discovery).provider,
    fixture("alpha", discovery).provider,
  ];
  const result = await AsterCommands.execute(
    { command: "list", subject: "icons", glyph: "aster/camera" },
    context(providers),
  );
  assert.ok(result.ok && result.payload.kind === "icon-list");
  assert.deepEqual(
    result.payload.icons.map(({ catalogue }) => catalogue),
    ["alpha", "beta"],
  );
});

test("supports empty glyph discovery and reports missing selected providers", async () => {
  const sample = fixture("empty", { icons: [], collections: [] });
  for (const providers of [[], [sample.provider]]) {
    const result = await AsterCommands.execute(
      { command: "list", subject: "glyphs" },
      context(providers),
    );
    assert.ok(result.ok && result.payload.kind === "glyph-list");
    assert.deepEqual(result.payload.glyphs, []);
  }
  const result = await AsterCommands.execute(
    { command: "list", subject: "glyphs", catalogue: "missing" },
    context([sample.provider]),
  );
  assert.ok(!result.ok);
  assert.equal(result.diagnostic.code, "ASTER-CLI-004");
});

test("rejects malformed glyph forms, unsupported filters and implicit concrete selections before discovery", async () => {
  const sample = fixture("sample", { icons: [], collections: [] });
  const requests: unknown[] = [
    ...[
      "aster/camera@outline",
      "aster/camera/outline",
      "Camera",
      "aster//camera",
      "",
      "camera@",
    ].flatMap((identity) => [
      { command: "show", subject: "glyph", identity },
      { command: "list", subject: "icons", glyph: identity },
    ]),
    ...["glyph", "collection", "tags"].map((field) => ({
      command: "list",
      subject: "glyphs",
      [field]: field === "tags" ? ["outline"] : "camera",
    })),
    { command: "list", subject: "collections", glyph: "camera" },
    { command: "list", subject: "catalogues", glyph: "camera" },
    { command: "search", query: "camera", glyph: "camera" },
    {
      command: "show",
      subject: "glyph",
      identity: "camera",
      tags: ["outline"],
    },
    { command: "export", subject: "glyph", identity: "camera" },
    { command: "review", subject: "glyph", identity: "camera" },
    ...["show", "export", "review"].map((command) => ({
      command,
      subject: "icon",
      identity: "aster/camera",
    })),
    { command: "list", subject: "icons", glyph: undefined },
    {
      command: "list",
      subject: "icons",
      get glyph() {
        throw new Error("Getter must not run");
      },
    },
  ];
  for (const request of requests) {
    // Deliberately cross the typed API boundary to exercise invalid JavaScript input.
    const result = await AsterCommands.execute(
      request as AsterCommandInvocationType,
      context([sample.provider]),
    );
    assert.ok(!result.ok);
    assert.equal(result.diagnostic.code, "ASTER-CLI-001");
  }
  assert.deepEqual(sample.calls, { discovery: 0, icons: 0, collections: 0 });
});

test("does not deduplicate conflicting discovery or expose provider failure details", async () => {
  const duplicate = fixture("duplicate", {
    icons: [record("camera", "outline"), record("camera", "outline")],
    collections: [],
  });
  const throwing = {
    ...duplicate.provider,
    identity: "broken",
    async discover(): Promise<CatalogueDiscovery> {
      throw new Error("Private provider detail");
    },
  };
  for (const [provider, code] of [
    [duplicate.provider, "ASTER-CLI-003"],
    [throwing, "ASTER-CLI-006"],
  ] as const) {
    const result = await AsterCommands.execute(
      { command: "list", subject: "glyphs" },
      context([provider]),
    );
    assert.ok(!result.ok);
    assert.doesNotMatch(JSON.stringify(result), /Private provider detail/u);
    assert.equal(result.diagnostic.code, code);
  }
});

test("keeps anonymous glyphs literal and isolates retained metadata from mutable provider input", async () => {
  const source = record("camera", "outline");
  const sample = fixture("sample", {
    icons: [
      source,
      record("camera", "2-tone"),
      record("camera", "01"),
      record("camera", "outline", "aster"),
    ],
    collections: [],
  });
  const result = await AsterCommands.execute(
    { command: "show", subject: "glyph", identity: "camera" },
    context([sample.provider]),
  );
  assert.ok(result.ok && result.payload.kind === "glyph-show");
  assert.deepEqual(result.payload.glyph.identity, { name: "camera" });
  assert.deepEqual(
    result.payload.glyph.variants.map(({ identity }) => identity.variant),
    ["01", "2-tone", "outline"],
  );
  const snapshot = JSON.stringify(result);
  Object.assign(source.identity, { name: "changed" });
  Object.assign(source.metadata, { displayName: "Changed", tags: ["changed"] });
  assert.equal(JSON.stringify(result), snapshot);
  assert.equal(sample.calls.icons + sample.calls.collections, 0);
});

test("presents multiple treatments and empty glyph sequences without inventing family metadata", async () => {
  const sample = fixture("sample", {
    icons: [record("camera", "outline"), record("camera", "2-tone")],
    collections: [],
  });
  const host = context([sample.provider]);
  const presenter = new HumanOutputPresenter();
  const listed = await AsterCommands.execute(
    { command: "list", subject: "glyphs" },
    host,
  );
  const shown = await AsterCommands.execute(
    { command: "show", subject: "glyph", identity: "camera" },
    host,
  );
  const empty = await AsterCommands.execute(
    { command: "list", subject: "glyphs" },
    context([]),
  );
  assert.ok(listed.ok && shown.ok && empty.ok);
  assert.equal(
    presenter.success(listed),
    "Glyphs:\n  camera [sample] (2 variants: 2-tone, outline)",
  );
  assert.equal(
    presenter.success(shown),
    [
      "Glyph: camera",
      "Catalogue: sample",
      "Variants:",
      "  camera@2-tone [sample] - camera 2-tone (collections: none)",
      "  camera@outline [sample] - camera outline (collections: none)",
    ].join("\n"),
  );
  assert.equal(presenter.success(empty), "Glyphs:\n  (none)");
});
