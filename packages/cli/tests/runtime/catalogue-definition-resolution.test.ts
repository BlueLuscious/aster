import assert from "node:assert/strict";
import test from "node:test";

import {
  Collection,
  type CollectionDefinition,
  Icon,
  type IconDefinition,
  type IconPresentationPolicy,
} from "@luscious-garden/aster-core";
import { AsterCatalogue } from "../../src/index.js";
import type {
  CatalogueDiscovery,
  CatalogueDiscoveryIconRecord,
  CatalogueProvider,
} from "../../src/catalogue/contracts/index.js";
import { CatalogueDefinitionResolver } from "../../src/catalogue/runtime/catalogue-definition.resolver.js";
import { CatalogueDiscoverySelector } from "../../src/catalogue/runtime/catalogue-discovery.selector.js";
import { CatalogueLoader } from "../../src/catalogue/runtime/catalogue.loader.js";
import type { TCatalogueDiscoverySelection } from "../../src/catalogue/types/internal/catalogue-discovery-selection.type.js";
import type { AsterCommandContext } from "../../src/command/contracts/index.js";

const presentation: IconPresentationPolicy = {
  defaults: {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
  },
  overrides: [],
};

function authoredIcon(
  name: string,
  variant?: string,
): IconDefinition {
  return {
    identity: {
      namespace: "testing",
      name,
      ...(variant === undefined ? {} : { variant }),
    },
    viewBox: { minX: 0, minY: 0, width: 24, height: 24 },
    nodes: [{ kind: "circle", cx: 12, cy: 12, radius: 8 }],
    metadata: {
      displayName: variant === undefined ? name : `${name} ${variant}`,
      tags: [name, ...(variant === undefined ? [] : [variant])],
      rtl: "preserve",
      presentation,
      deprecated: false,
    },
  };
}

function discoveryIcon(
  definition: IconDefinition,
  memberships: CatalogueDiscoveryIconRecord["memberships"] = [],
): CatalogueDiscoveryIconRecord {
  return {
    identity: definition.identity,
    metadata: {
      displayName: definition.metadata.displayName,
      ...(definition.metadata.tags === undefined
        ? {}
        : { tags: definition.metadata.tags }),
      rtl: definition.metadata.rtl,
      deprecated: definition.metadata.deprecated,
    },
    memberships,
  };
}

function context(provider: CatalogueProvider): AsterCommandContext {
  return {
    catalogues: [provider],
    productName: "Aster",
    productVersion: "0.0.0",
  };
}

async function select(
  provider: CatalogueProvider,
  subject: "icon" | "collection",
  identity: string,
): Promise<TCatalogueDiscoverySelection> {
  const selected = await new CatalogueDiscoverySelector(
    new CatalogueLoader(),
  ).select(subject, identity, undefined, context(provider));

  if (!selected.accepted) {
    throw new Error(`Unexpected selection failure: ${selected.diagnostic.message}`);
  }

  return selected.value;
}

test("resolves canonical built-in icon and collection definitions", async () => {
  const resolver = new CatalogueDefinitionResolver();
  const iconSelection = await select(AsterCatalogue, "icon", "aster/camera");
  const collectionSelection = await select(
    AsterCatalogue,
    "collection",
    "amellus",
  );
  const icon = await resolver.resolve(iconSelection, context(AsterCatalogue));
  const collection = await resolver.resolve(
    collectionSelection,
    context(AsterCatalogue),
  );

  assert.equal(icon.accepted, true);
  assert.equal(collection.accepted, true);

  if (icon.accepted && collection.accepted) {
    assert.equal(icon.value.icons[0]?.definition.identity.name, "camera");
    assert.equal(collection.value.collection?.identity.name, "amellus");
    assert.equal(
      collection.value.icons.length,
      collection.value.collection?.icons.length,
    );
  }
});

test("resolves and isolates one exact icon without collection loading or caching", async () => {
  const source = authoredIcon("camera", "stippled");
  const discovery: CatalogueDiscovery = {
    icons: [discoveryIcon(source)],
    collections: [],
  };
  let iconLoads = 0;
  let collectionLoads = 0;
  const provider: CatalogueProvider = {
    identity: "testing",
    async discover() {
      return discovery;
    },
    async loadIcon() {
      iconLoads += 1;
      return source;
    },
    async loadCollection() {
      collectionLoads += 1;
      return undefined;
    },
  };
  const selection = await select(
    provider,
    "icon",
    "testing/camera@stippled",
  );
  const resolver = new CatalogueDefinitionResolver();
  const first = await resolver.resolve(selection, context(provider));
  const second = await resolver.resolve(selection, context(provider));

  (source.metadata as unknown as { displayName: string }).displayName = "Changed";
  (source.nodes as unknown as IconDefinition["nodes"][number][])[0] = {
    kind: "circle",
    cx: 4,
    cy: 4,
    radius: 2,
  };

  assert.equal(first.accepted, true);
  assert.equal(second.accepted, true);
  assert.equal(iconLoads, 2);
  assert.equal(collectionLoads, 0);

  if (first.accepted) {
    assert.equal(first.value.icons[0]?.definition.metadata.displayName, "camera stippled");
    assert.deepEqual(first.value.icons[0]?.definition.nodes, [
      { kind: "circle", cx: 12, cy: 12, radius: 8 },
    ]);
    assert.ok(Object.isFrozen(first.value));
    assert.ok(Object.isFrozen(first.value.icons));
    assert.ok(Object.isFrozen(first.value.icons[0]?.definition));
    assert.ok(Object.isFrozen(first.value.icons[0]?.definition.nodes));
  }
});

test("resolves one collection loader and projects only its required members", async () => {
  const bravo = authoredIcon("bravo");
  const alpha = authoredIcon("alpha");
  const source: CollectionDefinition = {
    identity: { namespace: "testing", name: "essentials" },
    icons: [bravo, alpha],
    metadata: {
      displayName: "Essentials",
      tags: ["testing"],
    },
  };
  const membership = [source.identity];
  const discovery: CatalogueDiscovery = {
    icons: [
      discoveryIcon(bravo, membership),
      discoveryIcon(alpha, membership),
      discoveryIcon(authoredIcon("standalone")),
    ],
    collections: [{
      identity: source.identity,
      metadata: source.metadata,
      icons: source.icons.map((icon) => icon.identity),
    }],
  };
  let iconLoads = 0;
  let collectionLoads = 0;
  const provider: CatalogueProvider = {
    identity: "testing",
    async discover() {
      return discovery;
    },
    async loadIcon() {
      iconLoads += 1;
      return undefined;
    },
    async loadCollection() {
      collectionLoads += 1;
      return source;
    },
  };
  const selection = await select(
    provider,
    "collection",
    "testing/essentials",
  );
  const resolved = await new CatalogueDefinitionResolver().resolve(
    selection,
    context(provider),
  );

  (source.metadata as unknown as { displayName: string }).displayName = "Changed";
  (source.icons as unknown as IconDefinition[])[0] = authoredIcon("changed");

  assert.equal(resolved.accepted, true);
  assert.equal(iconLoads, 0);
  assert.equal(collectionLoads, 1);

  if (resolved.accepted) {
    assert.equal(resolved.value.collection?.metadata.displayName, "Essentials");
    assert.deepEqual(
      resolved.value.icons.map((icon) => icon.definition.identity.name),
      ["alpha", "bravo"],
    );
    assert.ok(Object.isFrozen(resolved.value.collection));
    assert.ok(Object.isFrozen(resolved.value.collection?.icons));
    assert.ok(Object.isFrozen(resolved.value.icons));
  }
});

test("rejects missing, failed, invalid, and inconsistent exact icon definitions", async (contextTest) => {
  const source = Icon.define(authoredIcon("camera"));
  const discovery: CatalogueDiscovery = {
    icons: [discoveryIcon(source)],
    collections: [],
  };
  const cases = [
    {
      name: "missing",
      load: async () => undefined,
      message: "selected icon definition is unavailable",
    },
    {
      name: "failed",
      load: async () => {
        throw new Error("native loader secret");
      },
      message: "selected icon loader failed",
    },
    {
      name: "invalid",
      load: async () => ({ identity: source.identity }) as IconDefinition,
      message: "selected icon definition is invalid",
    },
    {
      name: "identity mismatch",
      load: async () => Icon.define(authoredIcon("other")),
      message: "icon testing/camera loader returned a mismatched identity",
    },
    {
      name: "metadata mismatch",
      load: async () => Icon.define({
        ...authoredIcon("camera"),
        metadata: {
          ...authoredIcon("camera").metadata,
          displayName: "Different",
        },
      }),
      message: "icon testing/camera loader returned metadata inconsistent with discovery",
    },
  ] as const;

  for (const testCase of cases) {
    await contextTest.test(testCase.name, async () => {
      const provider: CatalogueProvider = {
        identity: "testing",
        async discover() {
          return discovery;
        },
        async loadIcon() {
          return testCase.load();
        },
        async loadCollection() {
          throw new Error("unexpected collection load");
        },
      };
      const selection = await select(provider, "icon", "testing/camera");
      const resolved = await new CatalogueDefinitionResolver().resolve(
        selection,
        context(provider),
      );

      assert.equal(resolved.accepted, false);

      if (!resolved.accepted) {
        assert.equal(resolved.diagnostic.code, "ASTER-CLI-006");
        assert.equal(resolved.diagnostic.message, testCase.message);
        assert.deepEqual(resolved.diagnostic.related, ["testing", "testing/camera"]);
        assert.doesNotMatch(resolved.diagnostic.message, /native loader secret/u);
      }
    });
  }
});

test("rejects collection identity, metadata, and membership drift without partial state", async (contextTest) => {
  const alpha = Icon.define(authoredIcon("alpha"));
  const bravo = Icon.define(authoredIcon("bravo"));
  const canonical = Collection.define({
    identity: { namespace: "testing", name: "essentials" },
    icons: [alpha, bravo],
    metadata: { displayName: "Essentials" },
  });
  const membership = [canonical.identity];
  const discovery: CatalogueDiscovery = {
    icons: [discoveryIcon(alpha, membership), discoveryIcon(bravo, membership)],
    collections: [{
      identity: canonical.identity,
      metadata: canonical.metadata,
      icons: canonical.icons.map((icon) => icon.identity),
    }],
  };
  const cases = [
    {
      name: "identity mismatch",
      definition: Collection.define({
        ...canonical,
        identity: { namespace: "testing", name: "other" },
      }),
      message: "collection testing/essentials loader returned a mismatched identity",
    },
    {
      name: "metadata mismatch",
      definition: Collection.define({
        ...canonical,
        metadata: { displayName: "Different" },
      }),
      message: "collection testing/essentials loader returned metadata inconsistent with discovery",
    },
    {
      name: "membership mismatch",
      definition: Collection.define({ ...canonical, icons: [bravo, alpha] }),
      message: "collection testing/essentials loader returned members inconsistent with discovery",
    },
  ] as const;

  for (const testCase of cases) {
    await contextTest.test(testCase.name, async () => {
      let iconLoads = 0;
      const provider: CatalogueProvider = {
        identity: "testing",
        async discover() {
          return discovery;
        },
        async loadIcon() {
          iconLoads += 1;
          return undefined;
        },
        async loadCollection() {
          return testCase.definition;
        },
      };
      const selection = await select(
        provider,
        "collection",
        "testing/essentials",
      );
      const resolved = await new CatalogueDefinitionResolver().resolve(
        selection,
        context(provider),
      );

      assert.equal(resolved.accepted, false);
      assert.equal(iconLoads, 0);

      if (!resolved.accepted) {
        assert.equal(resolved.diagnostic.code, "ASTER-CLI-006");
        assert.equal(resolved.diagnostic.message, testCase.message);
        assert.deepEqual(
          resolved.diagnostic.related,
          ["testing", "testing/essentials"],
        );
      }
    });
  }
});

test("sanitises missing, failed, and invalid exact collection definitions", async (contextTest) => {
  const alpha = Icon.define(authoredIcon("alpha"));
  const canonical = Collection.define({
    identity: { namespace: "testing", name: "essentials" },
    icons: [alpha],
    metadata: { displayName: "Essentials" },
  });
  const discovery: CatalogueDiscovery = {
    icons: [discoveryIcon(alpha, [canonical.identity])],
    collections: [{
      identity: canonical.identity,
      metadata: canonical.metadata,
      icons: canonical.icons.map((icon) => icon.identity),
    }],
  };
  const cases = [
    {
      name: "missing",
      load: async () => undefined,
      message: "selected collection definition is unavailable",
    },
    {
      name: "failed",
      load: async () => {
        throw new Error("native collection loader secret");
      },
      message: "selected collection loader failed",
    },
    {
      name: "invalid",
      load: async () => ({ identity: canonical.identity }) as CollectionDefinition,
      message: "selected collection definition is invalid",
    },
  ] as const;

  for (const testCase of cases) {
    await contextTest.test(testCase.name, async () => {
      const provider: CatalogueProvider = {
        identity: "testing",
        async discover() {
          return discovery;
        },
        async loadIcon() {
          throw new Error("unexpected icon load");
        },
        async loadCollection() {
          return testCase.load();
        },
      };
      const selection = await select(
        provider,
        "collection",
        "testing/essentials",
      );
      const resolved = await new CatalogueDefinitionResolver().resolve(
        selection,
        context(provider),
      );

      assert.equal(resolved.accepted, false);

      if (!resolved.accepted) {
        assert.equal(resolved.diagnostic.code, "ASTER-CLI-006");
        assert.equal(resolved.diagnostic.message, testCase.message);
        assert.doesNotMatch(
          resolved.diagnostic.message,
          /native collection loader secret/u,
        );
      }
    });
  }
});

test("rejects a selected provider that becomes unavailable before exact loading", async () => {
  const source = Icon.define(authoredIcon("camera"));
  const provider: CatalogueProvider = {
    identity: "testing",
    async discover() {
      return { icons: [discoveryIcon(source)], collections: [] };
    },
    async loadIcon() {
      return source;
    },
    async loadCollection() {
      return undefined;
    },
  };
  const selection = await select(provider, "icon", "testing/camera");
  const resolved = await new CatalogueDefinitionResolver().resolve(selection, {
    ...context(provider),
    catalogues: [],
  });

  assert.equal(resolved.accepted, false);

  if (!resolved.accepted) {
    assert.equal(resolved.diagnostic.code, "ASTER-CLI-006");
    assert.equal(
      resolved.diagnostic.message,
      "selected catalogue provider became unavailable",
    );
  }
});
