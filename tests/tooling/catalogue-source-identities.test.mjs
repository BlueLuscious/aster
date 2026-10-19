import assert from "node:assert/strict";
import test from "node:test";
import ts from "typescript";

import { catalogueSourceGeneration } from "../../tooling/catalogue/constants/catalogue-source-generation.constant.mjs";
import { CatalogueSourceFacadePlanner } from "../../tooling/catalogue/runtime/catalogue-source-facade.planner.mjs";
import { CatalogueSourceFacadeResolver } from "../../tooling/catalogue/runtime/catalogue-source-facade.resolver.mjs";
import { CatalogueSourceKeySerialiser } from "../../tooling/catalogue/runtime/catalogue-source-key.serialiser.mjs";
import { CatalogueSourceLayoutNormaliser } from "../../tooling/catalogue/runtime/catalogue-source-layout.normaliser.mjs";
import { CatalogueSourceRelationshipInspector } from "../../tooling/catalogue/runtime/catalogue-source-relationship.inspector.mjs";
import { CatalogueSourceSerialiser } from "../../tooling/catalogue/runtime/catalogue-source.serialiser.mjs";
import { RepositoryPathResolver } from "../../tooling/shared/runtime/repository-path.resolver.mjs";

function withInheritedIdentity(verify) {
  const previous = new Map(
    ["namespace", "variant"].map((key) => [
      key,
      Object.getOwnPropertyDescriptor(Object.prototype, key),
    ]),
  );
  let reads = 0;
  try {
    Object.defineProperties(Object.prototype, {
      namespace: {
        configurable: true,
        get() {
          reads += 1;
          return "fixture";
        },
      },
      variant: {
        configurable: true,
        get() {
          reads += 1;
          return "filled";
        },
      },
    });
    verify();
    assert.equal(reads, 0);
  } finally {
    for (const [key, descriptor] of previous) {
      if (descriptor === undefined) {
        Reflect.deleteProperty(Object.prototype, key);
      } else {
        Object.defineProperty(Object.prototype, key, descriptor);
      }
    }
  }
}

function moduleFixture(paths, variant, namespace) {
  return {
    name: "camera",
    variant,
    exportName: variant === "outline" ? "CameraOutline" : "CameraFilled",
    sourcePath: paths.resolve(
      "fixture/src/glyphs/c/camera",
      `camera-${variant}.icon.ts`,
    ),
    relativePath: `src/glyphs/c/camera/camera-${variant}.icon.ts`,
    memberReferences: [],
    manifest: {
      identity: {
        ...(namespace === undefined ? {} : { namespace }),
        name: "camera",
        variant,
      },
      displayName: "Camera",
      rtl: "preserve",
      deprecated: false,
    },
  };
}

test("derives distribution keys only from own namespace and required treatment data", () => {
  const keys = new CatalogueSourceKeySerialiser();
  withInheritedIdentity(() => {
    assert.equal(
      keys.serialise("icon", { name: "camera", variant: "outline" }),
      "camera@outline",
    );
    assert.equal(
      keys.serialise("icon", {
        namespace: "own",
        name: "camera",
        variant: "outline",
      }),
      "own/camera@outline",
    );
    assert.equal(keys.serialise("collection", { name: "sample" }), "sample");
    assert.throws(
      () => keys.serialise("icon", { name: "camera" }),
      /requires an explicit variant/u,
    );
  });
});

test("emits only owned identity fields in metadata and replacement projections", async () => {
  const serialiser = new CatalogueSourceSerialiser("fixture");
  const icon = {
    key: "camera@outline",
    exportName: "CameraOutline",
    identity: { name: "camera", variant: "outline" },
    displayName: "Camera",
    rtl: "preserve",
    deprecated: true,
    replacedBy: { name: "camera", variant: "filled" },
  };
  const collection = {
    key: "sample",
    exportName: "Sample",
    identity: { name: "sample" },
    metadata: { displayName: "Sample" },
    members: [icon.key],
  };
  let source;
  withInheritedIdentity(() => {
    source = serialiser.manifest([icon], [collection]);
  });
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
    },
  }).outputText;
  const generated = await import(
    `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
  );
  assert.deepEqual(Object.keys(generated.AsterIconManifest[0].identity), [
    "name",
    "variant",
  ]);
  assert.deepEqual(Object.keys(generated.AsterIconManifest[0].replacedBy), [
    "name",
    "variant",
  ]);
  assert.deepEqual(Object.keys(generated.AsterCollectionManifest[0].identity), [
    "name",
  ]);
});

test("rejects glyph dictionaries that conflate anonymous and namespaced artwork", () => {
  const paths = new RepositoryPathResolver();
  const planner = new CatalogueSourceFacadePlanner(
    new CatalogueSourceSerialiser("fixture"),
    paths,
    new CatalogueSourceFacadeResolver(),
    catalogueSourceGeneration.reservedIconNames,
    new CatalogueSourceLayoutNormaliser(),
  );
  const modules = [
    moduleFixture(paths, "outline"),
    moduleFixture(paths, "filled", "fixture"),
  ];
  const family = catalogueSourceGeneration.families.find(
    ({ kind }) => kind === "icon",
  );
  assert.ok(family);
  withInheritedIdentity(() => {
    assert.throws(
      () => planner.plan(paths.resolve("fixture"), [{ family, modules }]),
      /across namespaces/u,
    );
  });
});

test("rejects collection groups that conflate absent and explicitly owned namespaces", () => {
  const paths = new RepositoryPathResolver();
  const icons = [
    moduleFixture(paths, "outline"),
    moduleFixture(paths, "filled", "fixture"),
  ];
  const collection = {
    sourcePath: paths.resolve(
      "fixture/src/collections/s/sample/sample.collection.ts",
    ),
    memberReferences: icons.map((icon) => ({
      alias: "camera",
      variantPropertyName: icon.variant,
      localSymbol: icon.exportName,
      importedSymbol: icon.exportName,
      moduleSpecifier: `../../../glyphs/c/camera/camera-${icon.variant}.icon.js`,
    })),
  };
  const inspections = catalogueSourceGeneration.families.map((family) => ({
    family,
    modules: family.kind === "icon" ? icons : [collection],
  }));
  withInheritedIdentity(() => {
    assert.throws(
      () =>
        new CatalogueSourceRelationshipInspector(paths).validate(inspections),
      /must contain the same glyph/u,
    );
  });
});
