import assert from "node:assert/strict";
import test from "node:test";

import type { IconMetadata } from "@aster/core";
import {
  IconImport,
  IconImportError,
  iconImportFormats,
  type IconAdoptionRequest,
  type SvgIconImportSource,
} from "../../src/index.js";

const metadata: IconMetadata = {
  displayName: "Hardening",
  tags: ["hardening"],
  rtl: "preserve",
  presentation: {
    defaults: {},
    overrides: [],
  },
  deprecated: false,
};

function source(name = "hardening"): SvgIconImportSource {
  return {
    format: iconImportFormats.svg,
    sourceId: `hardening/${name}.svg`,
    identity: { namespace: "hardening", name },
    content:
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 12h16"/></svg>',
  };
}

function request(name = "hardening"): IconAdoptionRequest {
  return {
    source: source(name),
    metadata: {
      ...metadata,
      displayName: name,
      tags: [...(metadata.tags ?? [])],
    },
  };
}

test("rejects accessor-owned fields across public operations without executing them", () => {
  let reads = 0;
  const accessor = (fields: Record<string, unknown>, field: string) => {
    Object.defineProperty(fields, field, {
      enumerable: true,
      get() {
        reads += 1;
        return undefined;
      },
    });
    return fields;
  };

  const inspected = accessor({ ...source() }, "content");
  assert.throws(
    () => IconImport.inspect(inspected as never),
    (error: unknown) =>
      error instanceof IconImportError && error.path === "source.content",
  );

  const successfulInspection = IconImport.inspect(source());
  assert.equal(successfulInspection.successful, true);
  if (!successfulInspection.successful) {
    throw new Error("Expected accepted hardening source.");
  }

  const defined = accessor({
    draft: successfulInspection.value,
    metadata,
  }, "metadata");
  assert.throws(
    () => IconImport.define(defined as never),
    (error: unknown) =>
      error instanceof IconImportError && error.path === "request.metadata",
  );

  const adopted = IconImport.adopt(request());
  assert.equal(adopted.successful, true);
  if (!adopted.successful) {
    throw new Error("Expected accepted hardening adoption.");
  }

  const emitted = accessor({
    definition: adopted.value.definition,
    sourceIds: ["hardening/hardening.svg"],
  }, "sourceIds");
  assert.throws(
    () => IconImport.emit(emitted as never),
    (error: unknown) =>
      error instanceof IconImportError && error.path === "request.sourceIds",
  );

  const adoptedRequest = accessor({ ...request() }, "metadata");
  assert.throws(
    () => IconImport.adopt(adoptedRequest as never),
    (error: unknown) =>
      error instanceof IconImportError && error.path === "request.metadata",
  );

  const batch = [request()];
  Object.defineProperty(batch, "0", {
    enumerable: true,
    get() {
      reads += 1;
      return request();
    },
  });
  assert.throws(
    () => IconImport.adoptMany(batch),
    (error: unknown) =>
      error instanceof IconImportError && error.path === "requests[0]",
  );
  assert.equal(reads, 0);
});

test("preserves caller-controlled Proxy failures at every public boundary", () => {
  const operations = [
    (value: never) => IconImport.inspect(value),
    (value: never) => IconImport.define(value),
    (value: never) => IconImport.emit(value),
    (value: never) => IconImport.adopt(value),
  ];

  for (const operation of operations) {
    const failure = new Error("caller-owned-prototype-failure");
    const value = new Proxy({}, {
      getPrototypeOf() {
        throw failure;
      },
    });
    assert.throws(() => operation(value as never), (error: unknown) => error === failure);
  }

  const batchFailure = new Error("caller-owned-batch-prototype-failure");
  const batch = new Proxy([request()], {
    getPrototypeOf() {
      throw batchFailure;
    },
  });
  assert.throws(
    () => IconImport.adoptMany(batch),
    (error: unknown) => error === batchFailure,
  );
});

test("rejects sparse and cyclic authored structures deterministically", () => {
  const sparseSourceIds = new Array<string>(1);
  const adopted = IconImport.adopt(request());
  assert.equal(adopted.successful, true);
  if (!adopted.successful) {
    throw new Error("Expected accepted hardening adoption.");
  }

  assert.throws(
    () => IconImport.emit({
      definition: adopted.value.definition,
      sourceIds: sparseSourceIds,
    }),
    (error: unknown) =>
      error instanceof IconImportError && error.path === "request.sourceIds[0]",
  );

  const cyclicMetadata = { ...metadata } as Record<string, unknown>;
  cyclicMetadata.displayName = cyclicMetadata;
  const result = IconImport.adopt({
    source: source("cyclic"),
    metadata: cyclicMetadata as never,
  });
  assert.equal(result.successful, false);
  assert.deepEqual(
    result.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-ADOPTION-001"],
  );
});

test("rejects missing required fields across every public operation", () => {
  const operations = [
    {
      execute: () => IconImport.inspect({
        format: iconImportFormats.svg,
        sourceId: "missing/content.svg",
        identity: { name: "missing-content" },
      } as never),
      path: "source.content",
    },
    {
      execute: () => IconImport.define({ draft: {} } as never),
      path: "request.metadata",
    },
    {
      execute: () => IconImport.emit({ definition: {} } as never),
      path: "request.sourceIds",
    },
    {
      execute: () => IconImport.adopt({ source: source() } as never),
      path: "request.metadata",
    },
    {
      execute: () => IconImport.adoptMany([{
        metadata,
      } as never]),
      path: "request.source",
    },
  ];

  for (const operation of operations) {
    assert.throws(
      operation.execute,
      (error: unknown) =>
        error instanceof IconImportError && error.path === operation.path,
    );
  }
});

test("isolates every successful result from post-call input mutation", () => {
  const mutableSource = source("isolated");
  const inspected = IconImport.inspect(mutableSource);
  assert.equal(inspected.successful, true);
  if (!inspected.successful) {
    throw new Error("Expected accepted isolated source.");
  }

  (mutableSource.identity as { name: string }).name = "mutated";
  (mutableSource as { content: string }).content = "<svg/>";
  assert.equal(inspected.value.identity.name, "isolated");
  assert.equal(inspected.value.nodes.length, 1);

  const mutableRequest = request("batch-isolated");
  const requests = [mutableRequest];
  const batch = IconImport.adoptMany(requests);
  assert.equal(batch.successful, true);
  if (!batch.successful) {
    throw new Error("Expected accepted isolated batch.");
  }

  (mutableRequest.source.identity as { name: string }).name = "changed";
  (mutableRequest.metadata.tags as string[] | undefined)?.push("changed");
  requests.push(request("later"));
  assert.equal(batch.value.entries.length, 1);
  assert.equal(batch.value.entries[0]?.definition.identity.name, "batch-isolated");
  assert.deepEqual(batch.value.entries[0]?.definition.metadata.tags, ["hardening"]);
  assert.equal(Object.isFrozen(batch.value), true);
  assert.equal(Object.isFrozen(batch.value.entries), true);
});
