import assert from "node:assert/strict";
import test from "node:test";

import {
  Collection,
  type CollectionDefinition,
  Icon,
  type IconDefinition,
} from "@aster/core";
import {
  AsterCatalogue,
  AsterCommands,
  catalogueResultKinds,
} from "../../src/index.js";
import type {
  CatalogueProvider,
  CatalogueSnapshot,
} from "../../src/catalogue/contracts/index.js";
import type { AsterCommandContext } from "../../src/command/contracts/index.js";

const presentation = Object.freeze({
  defaults: Object.freeze({
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
  }),
  overrides: Object.freeze([]),
});

test("exposes immutable catalogue result discriminators", () => {
  assert.deepEqual(catalogueResultKinds, {
    icon: "icon",
    collection: "collection",
  });
  assert.ok(Object.isFrozen(catalogueResultKinds));
});

function createIcon(
  name: string,
  tags: readonly string[] = ["testing"],
): IconDefinition {
  return Icon.define({
    identity: { namespace: "testing", name },
    viewBox: { minX: 0, minY: 0, width: 24, height: 24 },
    nodes: [{ kind: "path", data: "M1 1L23 23" }],
    metadata: {
      displayName: name
        .split("-")
        .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
        .join(" "),
      tags,
      rtl: "preserve",
      presentation,
      deprecated: false,
    },
  });
}

function createCollection(
  name: string,
  icons: readonly IconDefinition[],
): CollectionDefinition {
  return Collection.define({
    identity: { namespace: "testing", name },
    icons,
    metadata: {
      displayName: name,
      tags: ["testing-collection"],
    },
  });
}

function createProvider(
  identity: string,
  snapshot: CatalogueSnapshot,
  onLoad?: () => void,
): CatalogueProvider {
  return {
    identity,
    async load() {
      onLoad?.();
      return snapshot;
    },
  };
}

function createContext(
  catalogues: readonly CatalogueProvider[],
): AsterCommandContext {
  return {
    catalogues,
    productName: "Aster",
    productVersion: "0.0.0",
  };
}

test("discovers the explicit built-in Aster catalogue", async () => {
  const context = createContext([AsterCatalogue]);
  const listed = await AsterCommands.execute(
    { command: "list", subject: "catalogues" },
    context,
  );
  const shown = await AsterCommands.execute(
    { command: "show", subject: "icon", identity: "aster/camera" },
    context,
  );

  assert.equal(listed.ok, true);
  assert.equal(shown.ok, true);

  if (listed.ok && listed.payload.kind === "catalogue-list") {
    assert.deepEqual(listed.payload.catalogues, [
      { identity: "aster", iconCount: 16, collectionCount: 1 },
    ]);
    assert.ok(Object.isFrozen(listed.payload.catalogues));
  }

  if (shown.ok && shown.payload.kind === "icon-show") {
    assert.equal(shown.payload.icon.metadata.displayName, "Camera");
    assert.deepEqual(shown.payload.icon.memberships, [{ name: "aster" }]);
    assert.ok(Object.isFrozen(shown.payload.icon));
  }
});

test("lists providers and standalone icons in canonical order", async () => {
  const alpha = createIcon("alpha");
  const zeta = createIcon("zeta");
  let alphaLoads = 0;
  let zetaLoads = 0;
  const zetaProvider = createProvider("zeta", {
    icons: [{ definition: zeta, memberships: [] }],
    collections: [],
  }, () => zetaLoads += 1);
  const alphaProvider = createProvider("alpha", {
    icons: [{ definition: alpha, memberships: [] }],
    collections: [],
  }, () => alphaLoads += 1);

  const result = await AsterCommands.execute(
    { command: "list", subject: "icons" },
    createContext([zetaProvider, alphaProvider]),
  );

  assert.equal(result.ok, true);
  assert.equal(alphaLoads, 1);
  assert.equal(zetaLoads, 1);

  if (result.ok && result.payload.kind === "icon-list") {
    assert.deepEqual(
      result.payload.icons.map((icon) => [icon.catalogue, icon.identity.name]),
      [["alpha", "alpha"], ["zeta", "zeta"]],
    );
    assert.deepEqual(result.payload.icons[0]?.memberships, []);
  }
});

test("discovers an explicitly provided empty collection", async () => {
  const collection = createCollection("empty", []);
  const provider = createProvider("testing", {
    icons: [],
    collections: [{ definition: collection }],
  });

  const result = await AsterCommands.execute(
    { command: "list", subject: "collections" },
    createContext([provider]),
  );

  assert.equal(result.ok, true);

  if (result.ok && result.payload.kind === "collection-list") {
    assert.equal(result.payload.collections.length, 1);
    assert.deepEqual(result.payload.collections[0]?.icons, []);
  }
});

test("retains one icon identity across multiple collection memberships", async () => {
  const icon = createIcon("shared");
  const first = createCollection("first", [icon]);
  const second = createCollection("second", [icon]);
  const provider = createProvider("testing", {
    icons: [{
      definition: icon,
      memberships: [second.identity, first.identity],
    }],
    collections: [
      { definition: second },
      { definition: first },
    ],
  });
  const context = createContext([provider]);
  const listed = await AsterCommands.execute(
    { command: "list", subject: "icons" },
    context,
  );
  const shown = await AsterCommands.execute(
    { command: "show", subject: "icon", identity: "testing/shared" },
    context,
  );

  assert.equal(listed.ok, true);
  assert.equal(shown.ok, true);

  if (listed.ok && listed.payload.kind === "icon-list") {
    assert.equal(listed.payload.icons.length, 1);
  }

  if (shown.ok && shown.payload.kind === "icon-show") {
    assert.deepEqual(
      shown.payload.icon.memberships.map((identity) => identity.name),
      ["first", "second"],
    );
  }
});

test("searches identity, display name, tags, and provider-owned terms", async () => {
  const icon = createIcon("photo-camera", ["media", "outline"]);
  const collection = createCollection("media", [icon]);
  const provider = createProvider("testing", {
    icons: [{
      definition: icon,
      memberships: [collection.identity],
      searchTerms: ["photography equipment"],
    }],
    collections: [{
      definition: collection,
      searchTerms: ["visual assets"],
    }],
  });
  const context = createContext([provider]);

  for (const query of ["testing/photo", "Photo Camera", "outline", "equipment"]) {
    const result = await AsterCommands.execute(
      { command: "search", query },
      context,
    );

    assert.equal(result.ok, true);

    if (result.ok && result.payload.kind === "search") {
      assert.deepEqual(
        result.payload.results.map((entry) => entry.kind),
        ["icon"],
      );
    }
  }

  const collectionResult = await AsterCommands.execute(
    { command: "search", query: "visual assets" },
    context,
  );

  assert.equal(collectionResult.ok, true);

  if (collectionResult.ok && collectionResult.payload.kind === "search") {
    assert.deepEqual(
      collectionResult.payload.results.map((entry) => entry.kind),
      ["collection"],
    );
  }
});

test("reports cross-provider ambiguity and supports exact provider filtering", async () => {
  const icon = createIcon("shared");
  const snapshot: CatalogueSnapshot = {
    icons: [{ definition: icon, memberships: [] }],
    collections: [],
  };
  const context = createContext([
    createProvider("alpha", snapshot),
    createProvider("beta", snapshot),
  ]);
  const ambiguous = await AsterCommands.execute(
    { command: "show", subject: "icon", identity: "testing/shared" },
    context,
  );
  const exact = await AsterCommands.execute(
    {
      command: "show",
      subject: "icon",
      identity: "testing/shared",
      catalogue: "beta",
    },
    context,
  );

  assert.equal(ambiguous.ok, false);
  assert.equal(exact.ok, true);

  if (!ambiguous.ok) {
    assert.equal(ambiguous.diagnostic.code, "ASTER-CLI-005");
    assert.deepEqual(ambiguous.diagnostic.related, ["alpha", "beta"]);
  }

  if (exact.ok && exact.payload.kind === "icon-show") {
    assert.equal(exact.payload.icon.catalogue, "beta");
  }
});

test("rejects conflicting and inconsistent provider snapshots", async () => {
  const icon = createIcon("duplicate");
  const duplicateProvider = createProvider("duplicate", {
    icons: [
      { definition: icon, memberships: [] },
      { definition: icon, memberships: [] },
    ],
    collections: [],
  });
  const missingCollectionProvider = createProvider("inconsistent", {
    icons: [{
      definition: icon,
      memberships: [{ namespace: "testing", name: "missing" }],
    }],
    collections: [],
  });

  const duplicate = await AsterCommands.execute(
    { command: "list", subject: "icons" },
    createContext([duplicateProvider]),
  );
  const inconsistent = await AsterCommands.execute(
    { command: "list", subject: "icons" },
    createContext([missingCollectionProvider]),
  );

  assert.equal(duplicate.ok, false);
  assert.equal(inconsistent.ok, false);

  if (!duplicate.ok && !inconsistent.ok) {
    assert.equal(duplicate.diagnostic.code, "ASTER-CLI-003");
    assert.equal(inconsistent.diagnostic.code, "ASTER-CLI-006");
  }
});

test("sanitises provider failures and rejects unavailable filters", async () => {
  const failingProvider: CatalogueProvider = {
    identity: "failing",
    async load() {
      throw new Error("native provider secret");
    },
  };
  const failed = await AsterCommands.execute(
    { command: "search", query: "camera" },
    createContext([failingProvider]),
  );
  const unavailable = await AsterCommands.execute(
    { command: "list", subject: "icons", catalogue: "missing" },
    createContext([]),
  );

  assert.equal(failed.ok, false);
  assert.equal(unavailable.ok, false);

  if (!failed.ok && !unavailable.ok) {
    assert.equal(failed.diagnostic.code, "ASTER-CLI-006");
    assert.doesNotMatch(failed.diagnostic.message, /native provider secret/u);
    assert.equal(unavailable.diagnostic.code, "ASTER-CLI-004");
  }
});

test("executes help and version without loading catalogue providers", async () => {
  let loads = 0;
  const provider = createProvider("testing", {
    icons: [],
    collections: [],
  }, () => loads += 1);
  const context = createContext([provider]);
  const help = await AsterCommands.execute({ command: "help" }, context);
  const version = await AsterCommands.execute({ command: "version" }, context);

  assert.equal(help.ok, true);
  assert.equal(version.ok, true);
  assert.equal(loads, 0);

  if (help.ok && help.payload.kind === "help") {
    assert.deepEqual(
      help.payload.descriptors.map((descriptor) => descriptor.name),
      ["help", "list", "search", "show", "version"],
    );
  }
});
