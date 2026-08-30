import assert from "node:assert/strict";
import test from "node:test";

import type { IconMetadata } from "@aster/core";
import {
  IconImport,
  IconImportError,
  iconImportFormats,
  type DiagnosticResultType,
  type IconAdoptionRequest,
  type SvgIconImportSource,
} from "../../src/index.js";

const acceptedContent =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 12h16"/></svg>';

function source(name = "public-contract"): SvgIconImportSource {
  return {
    format: iconImportFormats.svg,
    sourceId: `contracts/${name}.svg`,
    identity: { namespace: "contracts", name },
    content: acceptedContent,
  };
}

function metadata(displayName = "Public Contract"): IconMetadata {
  return {
    displayName,
    tags: ["contract", "public"],
    rtl: "preserve",
    presentation: {
      defaults: {},
      overrides: [],
    },
    deprecated: false,
  };
}

function request(name = "public-contract"): IconAdoptionRequest {
  return {
    source: source(name),
    metadata: metadata(name),
  };
}

function assertDeepFrozen(
  value: unknown,
  path = "result",
  visited = new Set<object>(),
): void {
  if ((typeof value !== "object" && typeof value !== "function") || value === null) {
    return;
  }

  assert.equal(Object.isFrozen(value), true, `Expected ${path} to be frozen.`);

  if (visited.has(value)) {
    return;
  }

  visited.add(value);

  for (const [field, descriptor] of Object.entries(
    Object.getOwnPropertyDescriptors(value),
  )) {
    if ("value" in descriptor) {
      assertDeepFrozen(descriptor.value, `${path}.${field}`, visited);
    }
  }
}

function assertFailure(result: DiagnosticResultType<unknown>): void {
  assert.equal(result.successful, false);
  assert.equal("value" in result, false);
  assertDeepFrozen(result);
}

test("keeps every public operation independently composable", () => {
  const inspected = IconImport.inspect(source());
  assert.equal(inspected.successful, true);
  if (!inspected.successful) {
    throw new Error("Expected accepted public source inspection.");
  }

  const defined = IconImport.define({
    draft: inspected.value,
    metadata: metadata(),
  });
  assert.equal(defined.successful, true);
  if (!defined.successful) {
    throw new Error("Expected accepted public definition construction.");
  }

  const emitted = IconImport.emit({
    definition: defined.value,
    sourceIds: [inspected.value.provenance.sourceId],
  });
  assert.equal(emitted.successful, true);
  if (!emitted.successful) {
    throw new Error("Expected accepted public module emission.");
  }

  const adopted = IconImport.adopt({
    source: source(),
    metadata: metadata(),
  });
  assert.equal(adopted.successful, true);
  if (!adopted.successful) {
    throw new Error("Expected accepted public adoption.");
  }

  const batch = IconImport.adoptMany([{
    source: source(),
    metadata: metadata(),
  }]);
  assert.equal(batch.successful, true);
  if (!batch.successful) {
    throw new Error("Expected accepted public batch adoption.");
  }

  assert.deepEqual(adopted.value.draft, inspected.value);
  assert.deepEqual(adopted.value.definition, defined.value);
  assert.deepEqual(adopted.value.module, emitted.value);
  assert.deepEqual(batch.value.entries, [adopted.value]);

  const repeated = IconImport.inspect(source());
  assert.equal(repeated.successful, true);
  if (!repeated.successful) {
    throw new Error("Expected repeated public source inspection.");
  }
  assert.notEqual(repeated, inspected);
  assert.notEqual(repeated.value, inspected.value);
  assert.notEqual(repeated.value.nodes, inspected.value.nodes);
  assert.notEqual(repeated.value.nodes[0], inspected.value.nodes[0]);
  assert.deepEqual(repeated, inspected);
});

test("discriminates malformed, unsupported, rejected and adoption failures", () => {
  assert.throws(
    () => IconImport.inspect(null as never),
    (error: unknown) => {
      assert.ok(error instanceof IconImportError);
      assert.equal(error.name, "IconImportError");
      assert.equal(error.code, "ASTER-IMPORT-001");
      assert.equal(error.path, "source");
      assert.equal(
        error.message,
        "ASTER-IMPORT-001 at source: expected a plain object.",
      );
      assert.equal("cause" in error, false);
      return true;
    },
  );

  assert.throws(
    () => IconImport.inspect({ ...source(), format: "png" } as never),
    (error: unknown) =>
      error instanceof IconImportError &&
      error.path === "source.format" &&
      error.message ===
        "ASTER-IMPORT-001 at source.format: unsupported import format.",
  );

  const rejected = IconImport.inspect({
    ...source("rejected"),
    content: '<svg xmlns="http://www.w3.org/2000/svg"><script>run()</script></svg>',
  });
  assertFailure(rejected);
  assert.deepEqual(
    rejected.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-SAFETY-003"],
  );

  const inspected = IconImport.inspect(source("invalid-definition"));
  assert.equal(inspected.successful, true);
  if (!inspected.successful) {
    throw new Error("Expected accepted definition source.");
  }

  const invalidDefinition = IconImport.define({
    draft: inspected.value,
    metadata: metadata(""),
  });
  assertFailure(invalidDefinition);
  assert.deepEqual(
    invalidDefinition.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-ADOPTION-001"],
  );

  const invalidEmission = IconImport.emit({
    definition: {} as never,
    sourceIds: ["contracts/invalid-emission.svg"],
  });
  assertFailure(invalidEmission);
  assert.deepEqual(
    invalidEmission.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-ADOPTION-002"],
  );

  const invalidAdoption = IconImport.adopt({
    source: source("invalid-adoption"),
    metadata: metadata(""),
  });
  assertFailure(invalidAdoption);
  assert.deepEqual(
    invalidAdoption.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-ADOPTION-001"],
  );

  const collision = IconImport.adoptMany([
    request("collision"),
    request("collision"),
  ]);
  assertFailure(collision);
  assert.deepEqual(
    collision.diagnostics.map((diagnostic) => diagnostic.code),
    ["ASTER-ADOPTION-003", "ASTER-ADOPTION-004"],
  );
});

test("deeply freezes every public success and failure result family", () => {
  const inspected = IconImport.inspect(source("frozen"));
  assert.equal(inspected.successful, true);
  if (!inspected.successful) {
    throw new Error("Expected accepted frozen source.");
  }

  const mutableMetadata = metadata("Frozen");
  const defined = IconImport.define({
    draft: inspected.value,
    metadata: mutableMetadata,
  });
  assert.equal(defined.successful, true);
  if (!defined.successful) {
    throw new Error("Expected accepted frozen definition.");
  }

  const sourceIds = [inspected.value.provenance.sourceId];
  const emitted = IconImport.emit({
    definition: defined.value,
    sourceIds,
  });
  const adopted = IconImport.adopt({
    source: source("frozen-adoption"),
    metadata: metadata("Frozen Adoption"),
  });
  const batch = IconImport.adoptMany([
    request("frozen-alpha"),
    request("frozen-beta"),
  ]);
  const rejected = IconImport.inspect({
    ...source("frozen-rejection"),
    content: '<svg xmlns="http://www.w3.org/2000/svg"><script/></svg>',
  });
  const invalidDefinition = IconImport.define({
    draft: inspected.value,
    metadata: metadata(""),
  });
  const invalidEmission = IconImport.emit({
    definition: {} as never,
    sourceIds: ["contracts/frozen-invalid-emission.svg"],
  });
  const collision = IconImport.adoptMany([
    request("frozen-collision"),
    request("frozen-collision"),
  ]);

  for (const [name, result] of Object.entries({
    inspected,
    defined,
    emitted,
    adopted,
    batch,
    rejected,
    invalidDefinition,
    invalidEmission,
    collision,
  })) {
    assertDeepFrozen(result, name);
  }

  (mutableMetadata as { displayName: string }).displayName = "Mutated";
  (mutableMetadata.tags as string[] | undefined)?.push("mutated");
  sourceIds[0] = "contracts/mutated.svg";

  assert.equal(defined.value.metadata.displayName, "Frozen");
  assert.deepEqual(defined.value.metadata.tags, ["contract", "public"]);
  assert.equal(emitted.successful, true);
  if (!emitted.successful) {
    throw new Error("Expected accepted frozen emission.");
  }
  assert.match(emitted.value.content, /contracts\/frozen\.svg/u);
  assert.doesNotMatch(emitted.value.content, /mutated/u);
});
