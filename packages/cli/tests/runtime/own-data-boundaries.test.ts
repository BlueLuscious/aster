import assert from "node:assert/strict";
import test from "node:test";
import { Collection, Icon } from "@luscious-garden/aster-core";
import { AsterCommands } from "../../src/index.js";
import type { CatalogueProvider } from "../../src/catalogue/contracts/index.js";
import { ReviewDocumentSerialiser } from "../../src/review/runtime/review-document.serialiser.js";
import { CommandOutputPresenter } from "../../src/shell/presentation/runtime/command-output.presenter.js";
import type { AsterCommandInvocationType } from "../../src/command/types/index.js";

import { CatalogueIdentityFormatter } from "../../src/catalogue/runtime/catalogue-identity.formatter.js";
import { CatalogueResultFactory } from "../../src/catalogue/runtime/catalogue-result.factory.js";
import { CommandContextNormaliser } from "../../src/command/runtime/command-context.normaliser.js";
import { ExportInvocationNormaliser } from "../../src/command/invocation/runtime/export-invocation.normaliser.js";
import { VersionInvocationNormaliser } from "../../src/command/invocation/runtime/version-invocation.normaliser.js";
import { ExportPathFormatter } from "../../src/export/runtime/export-path.formatter.js";
import { StructuredDataInspector } from "../../src/shared/runtime/structured-data.inspector.js";
import { CommandLineParser } from "../../src/shell/parsing/runtime/command-line.parser.js";
import { ShellIdentityFormatter } from "../../src/shell/presentation/runtime/shell-identity.formatter.js";

function withInheritedField<Value>(key: string, descriptor: PropertyDescriptor, operation: () => Value): Value {
  const previous = Object.getOwnPropertyDescriptor(Object.prototype, key);
  try {
    Object.defineProperty(Object.prototype, key, { configurable: true, ...descriptor });
    return operation();
  } finally {
    if (previous === undefined) {
      Reflect.deleteProperty(Object.prototype, key);
    } else {
      Object.defineProperty(Object.prototype, key, previous);
    }
  }
}

test("rejects accessor descriptors even when they inherit a data value", async () => {
  const inspector = new StructuredDataInspector();
  let reads = 0;
  const accessor = { enumerable: true, get() { reads += 1; return "fixture"; } };
  const record = Object.defineProperty({}, "identity", accessor);
  const array = Object.defineProperty(["fixture"], "0", accessor);
  const provider = Object.defineProperty({
    async discover() { return { icons: [], collections: [] }; },
    async loadIcon() { return undefined; },
    async loadCollection() { return undefined; },
  }, "identity", accessor);
  const actual = withInheritedField("value", { value: "fixture", writable: true }, () => ({
    member: inspector.ownDataMember(record, "identity"),
    record: inspector.record(record, ["identity"], ["identity"]),
    array: inspector.array(array),
    context: new CommandContextNormaliser().normalise({
      catalogues: [provider], productName: "Aster", productVersion: "0.0.0",
    }),
  }));
  assert.equal(actual.member, undefined);
  assert.equal(actual.record, undefined);
  assert.equal(actual.array, undefined);
  assert.equal(actual.context.accepted, false);
  assert.equal(reads, 0);
  const invocation = Object.defineProperty({}, "command", accessor);
  const rejected = await withInheritedField("value", { value: "version", writable: true }, () =>
    AsterCommands.execute(invocation as AsterCommandInvocationType, {
      catalogues: [], productName: "Aster", productVersion: "0.0.0",
    }));
  assert.equal(rejected.ok, false);
  assert.equal(Object.hasOwn(rejected, "command"), false);
  assert.equal(reads, 0);
});

test("keeps absent namespaces out of identity, glyph and artefact projections", () => {
  const identity = { name: "camera", variant: "outline" };
  const collection = { name: "sample" };
  const identities = new CatalogueIdentityFormatter();
  const shell = new ShellIdentityFormatter();
  let reads = 0;
  const actual = withInheritedField("namespace", { get() { reads += 1; return "inherited"; } }, () => {
    const glyphs = new CatalogueResultFactory().glyphs({
      identity: "fixture",
      icons: [{ identity, metadata: { displayName: "Camera", rtl: "preserve", deprecated: false }, memberships: [] }],
      collections: [],
    });
    return [
      identities.icon(identity), identities.glyph(identity), identities.collection(collection),
      new ExportPathFormatter().icon(identity), shell.format(identity), shell.format(collection),
      Object.hasOwn(glyphs[0]!.identity, "namespace"),
    ];
  });
  assert.deepEqual(actual, ["camera@outline", "camera", "sample", "camera@outline.svg", "camera@outline", "sample", false]);
  assert.equal(reads, 0);
});

test("does not infer a treatment on a glyph or collection from its prototype", () => {
  let reads = 0;
  const actual = withInheritedField("variant", { get() { reads += 1; return "filled"; } }, () =>
    new ShellIdentityFormatter().format({ name: "sample" }));
  assert.equal(actual, "sample");
  assert.equal(reads, 0);
});

test("ignores inherited optional context evidence without reading its accessors", () => {
  const context = { catalogues: [], productName: "Aster", productVersion: "0.0.0" };
  for (const field of ["packageVersions", "packageDependencies", "cliLocation"]) {
    let reads = 0;
    const actual = withInheritedField(field, { get() { reads += 1; return {}; } }, () =>
      new CommandContextNormaliser().normalise(context));
    assert.equal(actual.accepted, true, field);
    assert.equal(reads, 0, field);
  }
});

test("does not read export options when the invocation does not own them", () => {
  let reads = 0;
  const actual = withInheritedField("options", { get() { reads += 1; return { size: 32 }; } }, () =>
    new ExportInvocationNormaliser().normalise({ command: "export", subject: "icon", identity: "camera@outline" }));
  assert.equal(actual.accepted, true);
  if (actual.accepted) {
    assert.equal(Object.hasOwn(actual.value, "options"), false);
  }
  assert.equal(reads, 0);
});

test("does not promote inherited version flags into accepted invocations", () => {
  for (const field of ["dependencies", "location"]) {
    let reads = 0;
    const actual = withInheritedField(field, { get() { reads += 1; return true; } }, () =>
      new VersionInvocationNormaliser().normalise({ command: "version" }));
    assert.equal(actual.accepted, true, field);
    if (actual.accepted) {
      assert.equal(Object.hasOwn(actual.value, field), false);
    }
    assert.equal(reads, 0, field);
  }
});

test("parses explicit filters without treating inherited values as repeated options", () => {
  const parser = new CommandLineParser();
  let reads = 0;
  const actual = withInheritedField("catalogue", { get() { reads += 1; return "inherited"; } }, () =>
    parser.parse(["list", "icons", "--catalogue", "fixture"]));
  assert.deepEqual(actual.invocation, { command: "list", subject: "icons", catalogue: "fixture" });
  assert.equal(reads, 0);
});

test("does not acquire undeclared export options or output paths from a prototype", () => {
  const parser = new CommandLineParser();
  for (const field of ["size", "title", "output"]) {
    let reads = 0;
    const actual = withInheritedField(field, { get() { reads += 1; return field === "size" ? 32 : "inherited"; } }, () =>
      parser.parse(["export", "icon", "camera@outline", "--json"]));
    assert.deepEqual(actual, { invocation: { command: "export", subject: "icon", identity: "camera@outline" }, json: true });
    assert.equal(reads, 0, field);
  }
});

test("preserves explicit own data even when inherited accessors cannot be assigned", () => {
  const inspector = new StructuredDataInspector();
  const parser = new CommandLineParser();
  let reads = 0;
  const record = withInheritedField("namespace", { get() { reads += 1; return "inherited"; } }, () =>
    inspector.record({ namespace: "fixture" }, ["namespace"], ["namespace"]));
  const parsed = withInheritedField("size", { get() { reads += 1; return 16; } }, () =>
    parser.parse(["export", "icon", "camera@outline", "--size", "32", "--json"]));
  assert.ok(record);
  assert.equal(Object.getPrototypeOf(record), null);
  assert.deepEqual({ ...record }, { namespace: "fixture" });
  assert.deepEqual(parsed.invocation, { command: "export", subject: "icon", identity: "camera@outline", options: { size: 32 } });
  assert.equal(reads, 0);
});

test("keeps absent optional fields inert throughout complete command and presentation workflows", async () => {
  const icon = Icon.define({
    identity: { name: "camera", variant: "outline" },
    viewBox: { minX: 0, minY: 0, width: 24, height: 24 },
    nodes: [{ kind: "circle", cx: 12, cy: 12, radius: 5 }],
    metadata: { displayName: "Camera", rtl: "preserve", deprecated: false, presentation: { defaults: {}, overrides: [] } },
  });
  const collection = Collection.define({
    identity: { name: "sample" }, icons: { camera: { outline: icon } }, metadata: { displayName: "Sample" },
  });
  const context = {
    productName: "Aster", productVersion: "0.0.0",
    catalogues: [{
      identity: "fixture",
      async discover() {
        return {
          icons: [{ identity: icon.identity, metadata: { displayName: "Camera", rtl: "preserve" as const, deprecated: false }, memberships: [collection.identity] }],
          collections: [{ identity: collection.identity, metadata: collection.metadata, memberIdentities: [icon.identity] }],
        };
      },
      async loadIcon() { return icon; },
      async loadCollection() { return collection; },
    }],
  };
  const invocations: readonly AsterCommandInvocationType[] = [
    { command: "help" }, { command: "version" },
    { command: "list", subject: "icons" }, { command: "list", subject: "collections" },
    { command: "list", subject: "glyphs" }, { command: "show", subject: "glyph", identity: "camera" },
    { command: "show", subject: "icon", identity: "camera@outline" },
    { command: "show", subject: "collection", identity: "sample" },
    { command: "search", query: "camera" },
    { command: "export", subject: "icon", identity: "camera@outline" },
    { command: "export", subject: "collection", identity: "sample" },
    { command: "review", subject: "collection", identity: "sample" },
  ];
  const presenter = new CommandOutputPresenter();
  const documents = new ReviewDocumentSerialiser();
  const execute = async (invocation: AsterCommandInvocationType) => {
    const result = await AsterCommands.execute(invocation, context);
    assert.equal(result.ok, true);
    return {
      result,
      human: presenter.present(result, false),
      html: result.ok && result.payload.kind === "review" ? documents.serialise(result.payload.plan) : undefined,
    };
  };
  const expected = [];
  for (const invocation of invocations) {
    expected.push(await execute(invocation));
  }
  for (const field of [
    "namespace", "variant", "catalogue", "collection", "glyph", "tags", "searchTerms", "replacedBy",
    "licence", "attribution", "description", "size", "title", "label", "colour", "fill", "stroke",
    "strokeWidth", "direction", "scope", "dependencies", "location", "packageVersions",
    "packageDependencies", "cliLocation", "options", "commandName", "output", "replace", "related",
    "defaultSize", "minimumSize",
  ]) {
    const previous = Object.getOwnPropertyDescriptor(Object.prototype, field);
    let reads = 0;
    const actual = [];
    try {
      Object.defineProperty(Object.prototype, field, {
        configurable: true,
        get() { reads += 1; throw new Error(`Unexpected inherited ${field}`); },
      });
      for (const invocation of invocations) {
        actual.push(await execute(invocation));
      }
    } finally {
      if (previous === undefined) {
        Reflect.deleteProperty(Object.prototype, field);
      } else {
        Object.defineProperty(Object.prototype, field, previous);
      }
    }
    assert.equal(reads, 0, field);
    assert.deepEqual(actual, expected, field);
  }
});

test("exposes member identities and rejects the former collection provider field", async () => {
  const collection = { identity: { name: "empty" }, metadata: { displayName: "Empty" }, memberIdentities: [] };
  const createProvider = (record: unknown) => ({
    identity: "fixture",
    async discover() { return { icons: [], collections: [record] }; },
    async loadIcon() { return undefined; },
    async loadCollection() { return undefined; },
  }) as CatalogueProvider;
  const invocation = { command: "show", subject: "collection", identity: "empty" } as const;
  const context = { productName: "Aster", productVersion: "0.0.0", catalogues: [createProvider(collection)] };
  const result = await AsterCommands.execute(invocation, context);
  assert.equal(result.ok, true);
  if (result.ok && result.payload.kind === "collection-show") {
    assert.deepEqual(result.payload.collection.memberIdentities, []);
    assert.equal(Object.hasOwn(result.payload.collection, "icons"), false);
    assert.equal(Object.isFrozen(result.payload.collection.memberIdentities), true);
  }
  for (const record of [
    { identity: collection.identity, metadata: collection.metadata, icons: [] },
    { ...collection, icons: [] },
  ]) {
    const rejected = await AsterCommands.execute(invocation, { ...context, catalogues: [createProvider(record)] });
    assert.equal(rejected.ok, false);
    if (!rejected.ok) {
      assert.equal(rejected.diagnostic.category, "catalogue-unavailable");
    }
  }
});
