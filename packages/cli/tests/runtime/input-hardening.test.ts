import assert from "node:assert/strict";
import test from "node:test";

import { AsterCommands } from "../../src/index.js";
import type {
  CatalogueProvider,
  CatalogueSnapshot,
} from "../../src/catalogue/contracts/index.js";
import type { AsterCommandContext } from "../../src/command/contracts/index.js";
import { CommandKernel } from "../../src/command/runtime/command.kernel.js";
import { StructuredDataInspector } from "../../src/shared/runtime/structured-data.inspector.js";

const emptySnapshot: CatalogueSnapshot = Object.freeze({
  icons: Object.freeze([]),
  collections: Object.freeze([]),
});

function createContext(
  catalogues: readonly CatalogueProvider[] = [],
): AsterCommandContext {
  return {
    catalogues,
    productName: "Aster",
    productVersion: "0.0.0",
  };
}

test("accepts null-prototype data and rejects authored record behaviour", () => {
  const inspector = new StructuredDataInspector();
  const plain = Object.assign(Object.create(null) as Record<string, unknown>, {
    identity: "aster",
  });
  const inherited = Object.create({ inherited: true }) as Record<string, unknown>;
  inherited.identity = "aster";
  let getterCalls = 0;
  const accessor = Object.defineProperty({}, "identity", {
    enumerable: true,
    get() {
      getterCalls += 1;
      return "aster";
    },
  });
  const symbol = Object.assign({ identity: "aster" }, {
    [Symbol("hidden")]: true,
  });

  assert.deepEqual(inspector.record(plain, ["identity"], ["identity"]), {
    identity: "aster",
  });
  assert.equal(inspector.record(inherited, ["identity"]), undefined);
  assert.equal(inspector.record(accessor, ["identity"]), undefined);
  assert.equal(inspector.record(symbol, ["identity"]), undefined);
  assert.equal(getterCalls, 0);
});

test("accepts only ordinary dense arrays without authored side state", () => {
  const inspector = new StructuredDataInspector();
  const sparse = new Array(2);
  sparse[1] = "icon";
  const extended = ["icon"] as string[] & { authority?: string };
  extended.authority = "caller";

  assert.deepEqual(inspector.array(["icon", "collection"]), [
    "icon",
    "collection",
  ]);
  assert.equal(inspector.array(sparse), undefined);
  assert.equal(inspector.array(extended), undefined);
  assert.equal(inspector.array(Object.setPrototypeOf(["icon"], null)), undefined);
});

test("rejects reflective invocation state without executing accessors", async () => {
  const kernel = new CommandKernel([]);
  let getterCalls = 0;
  const accessor = Object.defineProperty({}, "command", {
    enumerable: true,
    get() {
      getterCalls += 1;
      return "version";
    },
  });
  const symbol = Object.assign({ command: "version" }, {
    [Symbol("hidden")]: true,
  });
  const inherited = Object.create({ command: "version" }) as object;
  const sparseTags = ["outline", , "interface"];
  const candidates: readonly unknown[] = [
    accessor,
    symbol,
    inherited,
    { command: "search", query: "icon", tags: sparseTags },
  ];

  for (const candidate of candidates) {
    const result = await kernel.execute(candidate, createContext());
    assert.equal(result.ok, false);

    if (!result.ok) {
      assert.equal(result.diagnostic.category, "usage");
      assert.equal(result.diagnostic.code, "ASTER-CLI-001");
    }
  }

  assert.equal(getterCalls, 0);
});

test("sanitises proxy traps before dispatch", async () => {
  const kernel = new CommandKernel([]);
  const invocation = new Proxy({}, {
    getPrototypeOf() {
      throw new Error("native reflective secret");
    },
  });
  const result = await kernel.execute(invocation, createContext());

  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(result.diagnostic.category, "execution-failure");
    assert.equal(result.diagnostic.code, "ASTER-CLI-999");
    assert.doesNotMatch(result.diagnostic.message, /native reflective secret/u);
  }
});

test("snapshots provider methods while preserving their original receiver", async () => {
  class StatefulProvider implements CatalogueProvider {
    readonly identity = "stateful";
    calls = 0;

    async load(): Promise<CatalogueSnapshot> {
      this.calls += 1;
      return emptySnapshot;
    }
  }

  const provider = new StatefulProvider();
  const result = await AsterCommands.execute(
    { command: "list", subject: "catalogues" },
    createContext([provider]),
  );

  assert.equal(result.ok, true);
  assert.equal(provider.calls, 1);
});

test("isolates provider identity and method selection from later mutation", async () => {
  let originalCalls = 0;
  let replacementCalls = 0;
  const provider = {
    identity: "mutable",
    async load(): Promise<CatalogueSnapshot> {
      originalCalls += 1;
      await Promise.resolve();
      return emptySnapshot;
    },
  };
  const execution = AsterCommands.execute(
    { command: "list", subject: "catalogues" },
    createContext([provider]),
  );

  provider.identity = "replacement";
  provider.load = async () => {
    replacementCalls += 1;
    return emptySnapshot;
  };

  const result = await execution;

  assert.equal(result.ok, true);
  assert.equal(originalCalls, 1);
  assert.equal(replacementCalls, 0);

  if (result.ok && result.payload.kind === "catalogue-list") {
    assert.deepEqual(result.payload.catalogues, [{
      identity: "mutable",
      iconCount: 0,
      collectionCount: 0,
    }]);
  }
});

test("rejects provider accessors and sparse provider sequences without reading them", async () => {
  let getterCalls = 0;
  const accessorProvider = Object.defineProperties({}, {
    identity: {
      enumerable: true,
      get() {
        getterCalls += 1;
        return "accessor";
      },
    },
    load: {
      enumerable: true,
      value: async () => emptySnapshot,
    },
  }) as CatalogueProvider;
  const sparseProviders = new Array<CatalogueProvider>(1);
  const accessorResult = await AsterCommands.execute(
    { command: "version" },
    createContext([accessorProvider]),
  );
  const sparseResult = await AsterCommands.execute(
    { command: "version" },
    createContext(sparseProviders),
  );

  assert.equal(accessorResult.ok, false);
  assert.equal(sparseResult.ok, false);
  assert.equal(getterCalls, 0);

  if (!accessorResult.ok && !sparseResult.ok) {
    assert.equal(accessorResult.diagnostic.code, "ASTER-CLI-002");
    assert.equal(sparseResult.diagnostic.code, "ASTER-CLI-002");
  }
});

test("rejects cyclic provider prototype traversal without hanging", async () => {
  let cyclicProvider: CatalogueProvider;
  cyclicProvider = new Proxy({}, {
    getOwnPropertyDescriptor(_target, property) {
      return property === "identity"
        ? {
            configurable: true,
            enumerable: true,
            value: "cyclic",
            writable: false,
          }
        : undefined;
    },
    getPrototypeOf() {
      return cyclicProvider;
    },
  }) as CatalogueProvider;
  const result = await AsterCommands.execute(
    { command: "version" },
    createContext([cyclicProvider]),
  );

  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(result.diagnostic.category, "usage");
    assert.equal(result.diagnostic.code, "ASTER-CLI-002");
  }
});

test("rejects reflective provider snapshots without leaking or partially accepting them", async () => {
  let getterCalls = 0;
  const provider: CatalogueProvider = {
    identity: "reflective",
    async load() {
      return Object.defineProperties({}, {
        icons: {
          enumerable: true,
          get() {
            getterCalls += 1;
            return [];
          },
        },
        collections: {
          enumerable: true,
          value: [],
        },
      }) as CatalogueSnapshot;
    },
  };
  const result = await AsterCommands.execute(
    { command: "list", subject: "catalogues" },
    createContext([provider]),
  );

  assert.equal(result.ok, false);
  assert.equal(getterCalls, 0);

  if (!result.ok) {
    assert.equal(result.diagnostic.category, "catalogue-unavailable");
    assert.equal(result.diagnostic.code, "ASTER-CLI-006");
    assert.deepEqual(result.diagnostic.related, ["reflective"]);
  }
});

test("sanitises provider snapshot Proxy failures as catalogue unavailability", async () => {
  const provider: CatalogueProvider = {
    identity: "trapped",
    async load() {
      return new Proxy({}, {
        getPrototypeOf() {
          throw new Error("native provider Proxy secret");
        },
      }) as CatalogueSnapshot;
    },
  };
  const result = await AsterCommands.execute(
    { command: "list", subject: "catalogues" },
    createContext([provider]),
  );

  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(result.diagnostic.category, "catalogue-unavailable");
    assert.equal(result.diagnostic.code, "ASTER-CLI-006");
    assert.doesNotMatch(result.diagnostic.message, /native provider Proxy secret/u);
    assert.deepEqual(result.diagnostic.related, ["trapped"]);
  }
});
