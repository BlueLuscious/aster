import assert from "node:assert/strict";
import test from "node:test";

import {
  Collection,
  type CollectionDefinition,
  Icon,
  type IconDefinition,
} from "@aster/core";
import {
  AsterCommands,
  reviewTargets,
} from "../../src/index.js";
import type {
  CatalogueProvider,
  CatalogueSnapshot,
} from "../../src/catalogue/contracts/index.js";
import type { AsterCommandContext } from "../../src/command/contracts/index.js";
import { CommandLineError } from "../../src/shell/parsing/runtime/command-line.error.js";
import { CommandLineParser } from "../../src/shell/parsing/runtime/command-line.parser.js";
import { ReviewDocumentFactory } from "../../src/review/runtime/review-document.factory.js";
import type { TCatalogueSelection } from "../../src/catalogue/types/internal/catalogue-selection.type.js";

const presentation = Object.freeze({
  defaults: Object.freeze({
    fill: "none" as const,
    stroke: "currentColor" as const,
    strokeWidth: 1.5,
  }),
  overrides: Object.freeze([]),
});

function createIcon(name: string, displayName = name): IconDefinition {
  return Icon.define({
    identity: { namespace: "testing", name },
    viewBox: { minX: 0, minY: 0, width: 24, height: 24 },
    nodes: [
      {
        kind: "path",
        commands: [
          { kind: "move", x: 1, y: 1 },
          { kind: "line", x: 23, y: 23 },
        ],
      },
      { kind: "circle", cx: 12, cy: 12, radius: 2 },
      {
        kind: "path",
        commands: [
          { kind: "move", x: 4, y: 4 },
          { kind: "line", x: 20, y: 20 },
        ],
      },
    ],
    metadata: {
      displayName,
      tags: ["testing", name],
      rtl: "preserve",
      presentation,
      deprecated: false,
    },
  });
}

function createMalformedIcon(name: string): IconDefinition {
  const accepted = createIcon(name);

  return {
    ...accepted,
    nodes: [{
      kind: "path",
      commands: [
        { kind: "move", x: 0, y: 0 },
        { kind: "line", x: Number.NaN, y: 1 },
      ],
    }],
  } as IconDefinition;
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
      description: `Review ${name}`,
      tags: ["testing-collection"],
    },
  });
}

function createProvider(
  identity: string,
  snapshot: CatalogueSnapshot,
): CatalogueProvider {
  return {
    identity,
    async load() {
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

const representativeIcon = createIcon("representative");
const representativeCollection = createCollection(
  "representatives",
  [representativeIcon],
);
const representativeIdentity = "testing/representative";
const representativeContext = createContext([createProvider("testing", {
  icons: [{
    definition: representativeIcon,
    memberships: [representativeCollection.identity],
  }],
  collections: [{ definition: representativeCollection }],
})]);

test("plans immutable technical evidence for one icon", async () => {
  const result = await AsterCommands.execute({
    command: "review",
    subject: "icon",
    identity: representativeIdentity,
  }, representativeContext);

  assert.equal(result.ok, true);

  if (result.ok && result.payload.kind === "review") {
    const { plan } = result.payload;
    assert.equal(plan.target, reviewTargets.html);
    assert.equal(plan.subject, "icon");
    assert.equal(plan.catalogue, "testing");
    assert.equal(plan.identity, representativeIdentity);
    assert.equal(plan.document.kind, "icon");
    assert.ok(Object.isFrozen(plan));
    assert.ok(Object.isFrozen(plan.document));
    assert.equal("output" in plan, false);
    assert.equal("timestamp" in plan, false);

    if (plan.document.kind === "icon") {
      assert.equal(
        plan.document.icon.identity.name,
        representativeIcon.identity.name,
      );
      assert.equal(plan.document.icon.nodeCount, representativeIcon.nodes.length);
      assert.deepEqual(
        plan.document.icon.primitiveKinds,
        [...new Set(representativeIcon.nodes.map((node) => node.kind))].sort(),
      );
      assert.deepEqual(
        plan.document.icon.memberships,
        [representativeCollection.identity],
      );
      assert.match(plan.document.icon.markup, /^<svg /u);
      assert.ok(Object.isFrozen(plan.document.icon));
      assert.ok(Object.isFrozen(plan.document.icon.primitiveKinds));
    }
  }
});

test("plans canonically ordered collection and empty-collection evidence", async () => {
  const zeta = createIcon("zeta");
  const alpha = createIcon("alpha");
  const collection = createCollection("sample", [zeta, alpha]);
  const empty = createCollection("empty", []);
  const provider = createProvider("testing", {
    icons: [
      { definition: zeta, memberships: [collection.identity] },
      { definition: alpha, memberships: [collection.identity] },
    ],
    collections: [
      { definition: collection },
      { definition: empty },
    ],
  });
  const context = createContext([provider]);
  const populated = await AsterCommands.execute({
    command: "review",
    subject: "collection",
    identity: "testing/sample",
  }, context);
  const vacant = await AsterCommands.execute({
    command: "review",
    subject: "collection",
    identity: "testing/empty",
  }, context);

  assert.equal(populated.ok, true);
  assert.equal(vacant.ok, true);

  if (populated.ok && populated.payload.kind === "review") {
    const document = populated.payload.plan.document;
    assert.equal(document.kind, "collection");

    if (document.kind === "collection") {
      assert.deepEqual(
        document.icons.map((icon) => icon.identity.name),
        ["alpha", "zeta"],
      );
      assert.ok(Object.isFrozen(document.icons));
      assert.ok(document.icons.every((icon) => Object.isFrozen(icon)));
    }
  }

  if (vacant.ok && vacant.payload.kind === "review") {
    const document = vacant.payload.plan.document;
    assert.equal(document.kind, "collection");

    if (document.kind === "collection") {
      assert.deepEqual(document.icons, []);
    }
  }
});

test("retains exact missing, ambiguous, and explicit-provider selection semantics", async () => {
  const icon = createIcon("shared");
  const snapshot: CatalogueSnapshot = {
    icons: [{ definition: icon, memberships: [] }],
    collections: [],
  };
  const context = createContext([
    createProvider("alpha", snapshot),
    createProvider("beta", snapshot),
  ]);
  const missing = await AsterCommands.execute({
    command: "review",
    subject: "icon",
    identity: "testing/missing",
  }, context);
  const ambiguous = await AsterCommands.execute({
    command: "review",
    subject: "icon",
    identity: "testing/shared",
  }, context);
  const exact = await AsterCommands.execute({
    command: "review",
    subject: "icon",
    identity: "testing/shared",
    catalogue: "beta",
  }, context);

  assert.equal(missing.ok, false);
  assert.equal(ambiguous.ok, false);
  assert.equal(exact.ok, true);

  if (!missing.ok && !ambiguous.ok) {
    assert.equal(missing.diagnostic.code, "ASTER-CLI-004");
    assert.equal(ambiguous.diagnostic.code, "ASTER-CLI-005");
    assert.deepEqual(ambiguous.diagnostic.related, ["alpha", "beta"]);
  }

  if (exact.ok && exact.payload.kind === "review") {
    assert.equal(exact.payload.plan.catalogue, "beta");
  }
});

test("contains SVG failures and malformed review invocations", async () => {
  const invalid = createMalformedIcon("invalid");
  const selection: TCatalogueSelection = Object.freeze({
    catalogue: "testing",
    subject: "icon",
    identity: "testing/invalid",
    icons: Object.freeze([
      Object.freeze({ definition: invalid, memberships: Object.freeze([]) }),
    ]),
  });
  const failed = new ReviewDocumentFactory().create(selection);
  const malformed = await AsterCommands.execute({
    command: "review",
    subject: "icons",
    identity: "testing/invalid",
  } as never, representativeContext);

  assert.equal(failed.accepted, false);
  assert.equal(malformed.ok, false);

  if (!failed.accepted && !malformed.ok) {
    assert.equal(failed.diagnostic.code, "ASTER-CLI-007");
    assert.deepEqual(failed.diagnostic.related, ["testing/invalid"]);
    assert.doesNotMatch(failed.diagnostic.message, /XML 1\.0|definition\.nodes/u);
    assert.equal(malformed.diagnostic.code, "ASTER-CLI-001");
  }
});

test("parses review output only as shell-owned publication intent", () => {
  const parser = new CommandLineParser();
  const parsed = parser.parse([
    "review",
    "collection",
    "testing/sample",
    "--catalogue",
    "testing",
    "--output",
    "review-site",
    "--replace",
  ]);

  assert.deepEqual(parsed, {
    invocation: {
      command: "review",
      subject: "collection",
      identity: "testing/sample",
      catalogue: "testing",
    },
    json: false,
    output: "review-site",
    replace: true,
  });
  assert.equal("output" in parsed.invocation, false);
  assert.throws(
    () => parser.parse([
      "review",
      "icon",
      "testing/sample",
      "--output",
      "review-site",
      "--json",
    ]),
    CommandLineError,
  );
});
