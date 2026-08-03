import assert from "node:assert/strict";
import test from "node:test";

import type { CatalogueProvider } from "../../src/catalogue/contracts/index.js";
import type { ICommandDefinition } from "../../src/command/contracts/internal/command-definition.contract.js";
import type {
  AsterCommandContext,
  AsterCommandDescriptor,
} from "../../src/command/contracts/index.js";
import { CommandKernel } from "../../src/command/runtime/command.kernel.js";
import type {
  AsterCommandInvocationType,
  AsterCommandResultType,
} from "../../src/command/types/index.js";

const emptyProvider: CatalogueProvider = {
  identity: "testing",
  async load() {
    return Object.freeze({
      icons: Object.freeze([]),
      collections: Object.freeze([]),
    });
  },
};

function createContext(
  catalogues: readonly CatalogueProvider[] = [emptyProvider],
): AsterCommandContext {
  return {
    catalogues,
    productName: "Aster",
    productVersion: "0.0.0",
  };
}

class FixtureCommand implements ICommandDefinition {
  readonly descriptor: AsterCommandDescriptor;
  readonly #handler: (
    invocation: AsterCommandInvocationType,
    context: AsterCommandContext,
  ) => Promise<AsterCommandResultType>;

  constructor(
    descriptor: AsterCommandDescriptor,
    handler: (
      invocation: AsterCommandInvocationType,
      context: AsterCommandContext,
    ) => Promise<AsterCommandResultType>,
  ) {
    this.descriptor = descriptor;
    this.#handler = handler;
  }

  async execute(
    invocation: AsterCommandInvocationType,
    context: AsterCommandContext,
  ): Promise<AsterCommandResultType> {
    return this.#handler(invocation, context);
  }
}

class IndependentProgrammaticHost {
  readonly #kernel: CommandKernel;
  readonly #context: AsterCommandContext;

  constructor(kernel: CommandKernel, context: AsterCommandContext) {
    this.#kernel = kernel;
    this.#context = context;
  }

  async invoke(
    invocation: AsterCommandInvocationType,
  ): Promise<AsterCommandResultType> {
    return this.#kernel.execute(invocation, this.#context);
  }
}

test("isolates descriptors and exposes deterministic help metadata", () => {
  const mutableUsage = ["version"];
  const kernel = new CommandKernel([
    new FixtureCommand(
      {
        name: "version",
        summary: "Show version metadata.",
        usage: mutableUsage,
      },
      async () => Object.freeze({
        ok: true,
        command: "version",
        payload: Object.freeze({
          kind: "version",
          productName: "Aster",
          productVersion: "0.0.0",
        }),
      }),
    ),
    new FixtureCommand(
      {
        name: "help",
        summary: "Show command help.",
        usage: ["help"],
      },
      async () => Object.freeze({
        ok: true,
        command: "help",
        payload: Object.freeze({
          kind: "help",
          descriptors: Object.freeze([]),
        }),
      }),
    ),
  ]);

  mutableUsage.push("mutated");

  assert.equal(kernel.identity, "aster");
  assert.deepEqual(
    kernel.descriptors.map((descriptor) => descriptor.name),
    ["help", "version"],
  );
  assert.deepEqual(kernel.descriptors[1]?.usage, ["version"]);
  assert.ok(Object.isFrozen(kernel.descriptors));
  assert.ok(Object.isFrozen(kernel.descriptors[0]));
  assert.ok(Object.isFrozen(kernel.descriptors[0]?.usage));
});

test("normalises equivalent invocations through an independent host", async () => {
  const acceptedInvocations: AsterCommandInvocationType[] = [];
  const command = new FixtureCommand(
    {
      name: "search",
      summary: "Search catalogues.",
      usage: ["search <query>"],
    },
    async (invocation, context) => {
      acceptedInvocations.push(invocation);
      assert.equal(context.catalogues.length, 1);
      return Object.freeze({
        ok: true,
        command: "search",
        payload: Object.freeze({
          kind: "search",
          results: Object.freeze([]),
        }),
      });
    },
  );
  const host = new IndependentProgrammaticHost(
    new CommandKernel([command]),
    createContext(),
  );

  const first = await host.invoke({
    command: "search",
    query: "  CAMERA  ",
    tags: ["outline-icons"],
  });
  const second = await host.invoke({
    command: "search",
    query: "camera",
    tags: ["outline-icons"],
  });

  assert.deepEqual(first, second);
  assert.equal(first.ok, true);
  assert.equal(acceptedInvocations.length, 2);
  assert.deepEqual(acceptedInvocations[0], acceptedInvocations[1]);
  assert.ok(Object.isFrozen(acceptedInvocations[0]));
  assert.ok(
    acceptedInvocations[0]?.command !== "search" ||
    acceptedInvocations[0].tags === undefined ||
    Object.isFrozen(acceptedInvocations[0].tags),
  );
});

test("returns usage failures for malformed invocations", async () => {
  const kernel = new CommandKernel([]);
  const candidates: readonly unknown[] = [
    { command: "remove" },
    { command: "search" },
    { command: "search", query: "camera", tags: ["outline", "outline"] },
    { command: "show", subject: "icon", identity: "Camera" },
    { command: "version", extra: true },
  ];

  for (const candidate of candidates) {
    const result = await kernel.execute(candidate, createContext());
    assert.equal(result.ok, false);

    if (!result.ok) {
      assert.equal(result.diagnostic.category, "usage");
      assert.equal(result.diagnostic.code, "ASTER-CLI-001");
      assert.ok(Object.isFrozen(result));
      assert.ok(Object.isFrozen(result.diagnostic));
    }
  }
});

test("rejects malformed and conflicting explicit capabilities", async () => {
  const kernel = new CommandKernel([]);
  const invalid = await kernel.execute(
    { command: "version" },
    {
      catalogues: [{ identity: "Invalid", load: emptyProvider.load }],
      productName: "Aster",
      productVersion: "0.0.0",
    },
  );
  const conflict = await kernel.execute(
    { command: "version" },
    createContext([emptyProvider, emptyProvider]),
  );

  assert.equal(invalid.ok, false);
  assert.equal(conflict.ok, false);

  if (!invalid.ok && !conflict.ok) {
    assert.equal(invalid.diagnostic.code, "ASTER-CLI-002");
    assert.equal(conflict.diagnostic.category, "catalogue-conflict");
    assert.equal(conflict.diagnostic.code, "ASTER-CLI-003");
  }
});

test("sanitises unexpected command failures", async () => {
  const kernel = new CommandKernel([
    new FixtureCommand(
      {
        name: "version",
        summary: "Show version metadata.",
        usage: ["version"],
      },
      async () => {
        throw new Error("native secret");
      },
    ),
  ]);

  const result = await kernel.execute({ command: "version" }, createContext());

  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(result.diagnostic.category, "execution-failure");
    assert.equal(result.diagnostic.code, "ASTER-CLI-999");
    assert.doesNotMatch(result.diagnostic.message, /native secret/u);
  }
});
