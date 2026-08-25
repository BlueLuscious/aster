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
  exportTargets,
} from "../../src/index.js";
import type {
  CatalogueProvider,
  CatalogueSnapshot,
} from "../../src/catalogue/contracts/index.js";
import type { AsterCommandContext } from "../../src/command/contracts/index.js";
import { asterCommandSubjects } from "../../src/command/constants/aster-command-subjects.constant.js";
import { SvgExportArtefactFactory } from "../../src/export/runtime/svg-export-artefact.factory.js";
import type { TExportSelection } from "../../src/export/types/internal/export-selection.type.js";

const context: AsterCommandContext = {
  catalogues: [AsterCatalogue],
  productName: "Aster",
  productVersion: "0.0.0",
};

const presentation = Object.freeze({
  defaults: Object.freeze({
    fill: "none" as const,
    stroke: "currentColor" as const,
    strokeWidth: 1.5,
  }),
  overrides: Object.freeze([]),
});

function createIcon(
  name: string,
  options: Readonly<{
    namespace?: string;
    variant?: string;
    data?: string;
  }> = {},
): IconDefinition {
  return Icon.define({
    identity: {
      ...(options.namespace === undefined
        ? {}
        : { namespace: options.namespace }),
      name,
      ...(options.variant === undefined ? {} : { variant: options.variant }),
    },
    viewBox: { minX: 0, minY: 0, width: 24, height: 24 },
    nodes: [{ kind: "path", data: options.data ?? "M1 1L23 23" }],
    metadata: {
      displayName: name,
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
    metadata: { displayName: name },
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

function createSnapshot(
  icons: readonly IconDefinition[],
  collections: readonly CollectionDefinition[],
): CatalogueSnapshot {
  return {
    icons: icons.map((definition) => ({
      definition,
      memberships: collections
        .filter((collection) => collection.icons.some((icon) =>
          JSON.stringify(icon.identity) === JSON.stringify(definition.identity),
        ))
        .map((collection) => collection.identity),
    })),
    collections: collections.map((definition) => ({ definition })),
  };
}

test("plans one deterministic immutable icon SVG export", async () => {
  const first = await AsterCommands.execute({
    command: "export",
    subject: "icon",
    identity: "aster/camera",
    options: { size: 32, colour: "#123456", label: " Camera " },
  }, context);
  const second = await AsterCommands.execute({
    command: "export",
    subject: "icon",
    identity: "aster/camera",
    options: { size: 32, colour: "#123456", label: "Camera" },
  }, context);

  assert.deepEqual(first, second);
  assert.equal(first.ok, true);

  if (first.ok && first.payload.kind === "export") {
    assert.equal(first.payload.plan.target, exportTargets.svg);
    assert.equal(first.payload.plan.subject, "icon");
    assert.equal(first.payload.plan.catalogue, "aster");
    assert.equal(first.payload.plan.identity, "aster/camera");
    assert.equal(first.payload.plan.artefacts.length, 1);
    assert.equal(first.payload.plan.artefacts[0]?.path, "aster/camera.svg");
    assert.equal(first.payload.plan.artefacts[0]?.mediaType, "image/svg+xml");
    assert.match(first.payload.plan.artefacts[0]?.content ?? "", /^<svg /u);
    assert.match(first.payload.plan.artefacts[0]?.content ?? "", /width="32"/u);
    assert.match(first.payload.plan.artefacts[0]?.content ?? "", /aria-label="Camera"/u);
    assert.ok(Object.isFrozen(first.payload));
    assert.ok(Object.isFrozen(first.payload.plan));
    assert.ok(Object.isFrozen(first.payload.plan.artefacts));
    assert.ok(Object.isFrozen(first.payload.plan.artefacts[0]));
  }
});

test("plans collection members in canonical path order", async () => {
  const result = await AsterCommands.execute({
    command: "export",
    subject: "collection",
    identity: "aster",
  }, context);

  assert.equal(result.ok, true);

  if (result.ok && result.payload.kind === "export") {
    const paths = result.payload.plan.artefacts.map((artefact) => artefact.path);
    assert.equal(result.payload.plan.subject, "collection");
    assert.equal(paths.length, 16);
    assert.deepEqual(paths, [...paths].sort());
    assert.equal(new Set(paths).size, paths.length);
  }
});

test("preserves existing exact lookup failures for export", async () => {
  const result = await AsterCommands.execute({
    command: "export",
    subject: "icon",
    identity: "aster/missing",
  }, context);

  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(result.diagnostic.category, "not-found");
    assert.equal(result.diagnostic.code, "ASTER-CLI-004");
  }
});

test("exports empty collections and canonical namespace and variant paths", async () => {
  const variant = createIcon("arrow", {
    namespace: "testing",
    variant: "filled",
  });
  const standalone = createIcon("standalone");
  const empty = createCollection("empty", []);
  const populated = createCollection("navigation", [variant, standalone]);
  const provider = createProvider(
    "testing",
    createSnapshot([standalone, variant], [populated, empty]),
  );
  const acceptedContext = createContext([provider]);
  const emptyResult = await AsterCommands.execute({
    command: "export",
    subject: "collection",
    identity: "testing/empty",
  }, acceptedContext);
  const populatedResult = await AsterCommands.execute({
    command: "export",
    subject: "collection",
    identity: "testing/navigation",
  }, acceptedContext);

  assert.equal(emptyResult.ok, true);
  assert.equal(populatedResult.ok, true);

  if (emptyResult.ok && emptyResult.payload.kind === "export") {
    assert.deepEqual(emptyResult.payload.plan.artefacts, []);
    assert.ok(Object.isFrozen(emptyResult.payload.plan.artefacts));
  }

  if (populatedResult.ok && populatedResult.payload.kind === "export") {
    assert.deepEqual(
      populatedResult.payload.plan.artefacts.map((artefact) => artefact.path),
      ["standalone.svg", "testing/arrow@filled.svg"],
    );
  }
});

test("produces byte-equivalent plans independently from provider record and membership order", async () => {
  const alpha = createIcon("alpha", { namespace: "testing" });
  const zeta = createIcon("zeta", { namespace: "testing" });
  const forward = createCollection("ordered", [alpha, zeta]);
  const reverse = createCollection("ordered", [zeta, alpha]);
  const firstProvider = createProvider(
    "testing",
    createSnapshot([zeta, alpha], [reverse]),
  );
  const secondProvider = createProvider(
    "testing",
    createSnapshot([alpha, zeta], [forward]),
  );
  const invocation = {
    command: "export",
    subject: "collection",
    identity: "testing/ordered",
    options: { size: 32 },
  } as const;
  const first = await AsterCommands.execute(invocation, createContext([firstProvider]));
  const second = await AsterCommands.execute(invocation, createContext([secondProvider]));

  assert.deepEqual(first, second);

  if (first.ok && second.ok && first.payload.kind === "export" && second.payload.kind === "export") {
    assert.equal(JSON.stringify(first.payload.plan), JSON.stringify(second.payload.plan));
    assert.ok(first.payload.plan.artefacts.every((artefact) =>
      artefact.content.includes(' width="32" height="32"'),
    ));
  }
});

test("keeps export ambiguity independent from provider registration order", async () => {
  const shared = createIcon("shared", { namespace: "testing" });
  const snapshot = createSnapshot([shared], []);
  const alpha = createProvider("alpha", snapshot);
  const beta = createProvider("beta", snapshot);
  const invocation = {
    command: "export",
    subject: "icon",
    identity: "testing/shared",
  } as const;
  const first = await AsterCommands.execute(invocation, createContext([beta, alpha]));
  const second = await AsterCommands.execute(invocation, createContext([alpha, beta]));
  const exactFirst = await AsterCommands.execute(
    { ...invocation, catalogue: "beta" },
    createContext([alpha, beta]),
  );
  const exactSecond = await AsterCommands.execute(
    { ...invocation, catalogue: "beta" },
    createContext([beta, alpha]),
  );

  assert.deepEqual(first, second);
  assert.deepEqual(exactFirst, exactSecond);
  assert.equal(first.ok, false);
  assert.equal(exactFirst.ok, true);

  if (!first.ok) {
    assert.equal(first.diagnostic.code, "ASTER-CLI-005");
    assert.deepEqual(first.diagnostic.related, ["alpha", "beta"]);
  }

  if (exactFirst.ok && exactFirst.payload.kind === "export") {
    assert.equal(exactFirst.payload.plan.catalogue, "beta");
  }
});

test("rejects unavailable collection members without exposing a partial plan", async () => {
  const missing = createIcon("missing", { namespace: "testing" });
  const collection = createCollection("inconsistent", [missing]);
  const provider = createProvider("testing", {
    icons: [],
    collections: [{ definition: collection }],
  });
  const result = await AsterCommands.execute({
    command: "export",
    subject: "collection",
    identity: "testing/inconsistent",
  }, createContext([provider]));
  const malformedProvider: CatalogueProvider = {
    identity: "malformed",
    async load() {
      return { icons: [] } as unknown as CatalogueSnapshot;
    },
  };
  const malformed = await AsterCommands.execute({
    command: "export",
    subject: "icon",
    identity: "testing/missing",
  }, createContext([malformedProvider]));

  assert.equal(result.ok, false);
  assert.equal(malformed.ok, false);

  if (!result.ok) {
    assert.equal(result.diagnostic.code, "ASTER-CLI-006");
    assert.equal(result.diagnostic.category, "catalogue-unavailable");
    assert.equal("payload" in result, false);
  }

  if (!malformed.ok) {
    assert.equal(malformed.diagnostic.code, "ASTER-CLI-006");
    assert.equal(malformed.diagnostic.category, "catalogue-unavailable");
  }
});

test("translates SVG failures without exposing target messages or partial artefacts", async () => {
  const valid = createIcon("alpha-valid", { namespace: "testing" });
  const invalid = createIcon("zeta-invalid-xml", {
    namespace: "testing",
    data: "M0 0\u0000",
  });
  const collection = createCollection("render-failure", [valid, invalid]);
  const provider = createProvider(
    "testing",
    createSnapshot([invalid, valid], [collection]),
  );
  const result = await AsterCommands.execute({
    command: "export",
    subject: "collection",
    identity: "testing/render-failure",
  }, createContext([provider]));

  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(result.diagnostic.code, "ASTER-CLI-007");
    assert.equal(result.diagnostic.category, "render-failure");
    assert.deepEqual(result.diagnostic.related, ["testing/zeta-invalid-xml.svg"]);
    assert.doesNotMatch(result.diagnostic.message, /XML 1\.0|definition\.nodes/u);
    assert.equal("payload" in result, false);
  }
});

test("preflights path collisions before attempting SVG rendering", () => {
  const invalid = createIcon("collision", {
    namespace: "testing",
    data: "M0 0\u0000",
  });
  const selection: TExportSelection = Object.freeze({
    catalogue: "testing",
    subject: asterCommandSubjects.export.collection,
    identity: "testing/colliding",
    definitions: Object.freeze([invalid, invalid]),
  });
  const result = new SvgExportArtefactFactory().create(selection, undefined);

  assert.equal(result.accepted, false);

  if (!result.accepted) {
    assert.equal(result.diagnostic.code, "ASTER-CLI-008");
    assert.equal(result.diagnostic.category, "export-conflict");
    assert.deepEqual(result.diagnostic.related, ["testing/collision.svg"]);
  }
});

test("preserves unrelated target exceptions and sanitises caller invocation failures", async () => {
  const failure = new Error("caller-owned-export-failure");
  const definition = new Proxy(createIcon("proxy", { namespace: "testing" }), {
    ownKeys() {
      throw failure;
    },
  });
  const selection: TExportSelection = Object.freeze({
    catalogue: "testing",
    subject: asterCommandSubjects.export.icon,
    identity: "testing/proxy",
    definitions: Object.freeze([definition]),
  });

  assert.throws(
    () => new SvgExportArtefactFactory().create(selection, undefined),
    (error: unknown) => error === failure,
  );

  const optionsFailure = new Error("caller-options-secret");
  const options = new Proxy({}, {
    ownKeys() {
      throw optionsFailure;
    },
  });
  const result = await AsterCommands.execute({
    command: "export",
    subject: "icon",
    identity: "aster/camera",
    options,
  } as never, context);

  assert.equal(result.ok, false);

  if (!result.ok) {
    assert.equal(result.diagnostic.code, "ASTER-CLI-999");
    assert.equal(result.diagnostic.category, "execution-failure");
    assert.doesNotMatch(result.diagnostic.message, /caller-options-secret/u);
  }
});
