import assert from "node:assert/strict";
import test from "node:test";

import { ArchitectureIssueCollector } from "../../tooling/architecture/runtime/architecture-issue.collector.mjs";
import { ArchitectureVerifier } from "../../tooling/architecture/runtime/architecture-verifier.mjs";
import { ModuleSpecifierExtractor } from "../../tooling/architecture/runtime/module-specifier.extractor.mjs";
import { PackageArchitectureInspector } from "../../tooling/architecture/runtime/package-architecture.inspector.mjs";
import { WorkspaceDependencyGraph } from "../../tooling/architecture/runtime/workspace-dependency.graph.mjs";
import { RepositoryPathResolver } from "../../tooling/shared/runtime/repository-path.resolver.mjs";
import { RuntimeDependencyReader } from "../../tooling/architecture/runtime/runtime-dependency.reader.mjs";

test("selects JSX syntax from the source filename without inspecting JSX text as imports", () => {
  assert.deepEqual(new ModuleSpecifierExtractor().extract([
    'const View = () => <span>import "not-a-module"</span>;',
    'const actual = import(("./actual.js"));',
  ].join("\n"), "component.tsx"), ["./actual.js"]);
});

test("extracts only literal module references from parsed source", () => {
  const source = [
    '// import "comment-only";',
    'const text = `import "text-only";`;',
    'const pattern = /import "pattern-only"/;',
    'import /* separated */ "side-effect";',
    'export { value } from /* separated */ "./value.js";',
    'const dynamic = import /* separated */ ("node:\\u0066s");',
    'type Definition = import /* separated */ ("@luscious-garden/aster-core").IconDefinition;',
    'const computed = import("not-a-complete-specifier" + suffix);',
    "const template = import(`./literal.js`);",
  ].join("\n");
  assert.deepEqual(new ModuleSpecifierExtractor().extract(source), [
    "side-effect", "./value.js", "node:fs", "@luscious-garden/aster-core", "./literal.js",
  ]);
});

test("retains dependency keys as own data and preserves section precedence", () => {
  const dependencies = new RuntimeDependencyReader().read({
    dependencies: JSON.parse('{"__proto__":"*","constructor":"*","shared":"first"}'),
    peerDependencies: { shared: "second" },
    optionalDependencies: { shared: "third" },
  });
  assert.equal(Object.getPrototypeOf(dependencies), Object.prototype);
  assert.equal(Object.hasOwn(dependencies, "__proto__"), true);
  assert.equal(dependencies.__proto__, "*");
  assert.equal(dependencies.constructor, "*");
  assert.equal(dependencies.shared, "third");
});

test("does not acquire runtime dependency sections from inherited accessors", () => {
  const previous = Object.getOwnPropertyDescriptor(Object.prototype, "dependencies");
  let reads = 0;
  try {
    Object.defineProperty(Object.prototype, "dependencies", {
      configurable: true,
      get() { reads += 1; return { inherited: "*" }; },
    });
    assert.deepEqual(new RuntimeDependencyReader().read({}), {});
    assert.equal(reads, 0);
  } finally {
    if (previous === undefined) {
      Reflect.deleteProperty(Object.prototype, "dependencies");
    } else {
      Object.defineProperty(Object.prototype, "dependencies", previous);
    }
  }
});

test("extracts static module specifiers in source order", () => {
  const extractor = new ModuleSpecifierExtractor();
  const source = [
    'import "side-effect";',
    'import type { Definition } from "@luscious-garden/aster-core";',
    'export { icon } from "./icon.js";',
    'const dynamic = import("node:path");',
    'const ignored = require("legacy");',
  ].join("\n");

  assert.deepEqual(extractor.extract(source), [
    "side-effect",
    "@luscious-garden/aster-core",
    "./icon.js",
    "node:path",
  ]);
});

test("reports dependency cycles in deterministic graph order", () => {
  const graph = new WorkspaceDependencyGraph();
  const issues = new ArchitectureIssueCollector();

  graph.add("@luscious-garden/aster-alpha", new Set(["@luscious-garden/aster-beta"]));
  graph.add("@luscious-garden/aster-beta", new Set(["@luscious-garden/aster-alpha"]));
  graph.add("@luscious-garden/aster-stable", new Set());
  graph.inspectCycles(issues);

  assert.deepEqual(issues.snapshot(), [
    "Workspace production dependency cycle: @luscious-garden/aster-alpha -> @luscious-garden/aster-beta -> @luscious-garden/aster-alpha",
  ]);
});

test("coordinates injected inspectors against one explicit root", async () => {
  const observedRoots = [];
  const verifier = new ArchitectureVerifier([
    {
      async inspect(root, issues) {
        observedRoots.push(root);
        issues.add("first issue");
      },
    },
    {
      async inspect(root, issues) {
        observedRoots.push(root);
        issues.add("second issue");
      },
    },
  ]);

  assert.deepEqual(await verifier.verify("explicit-workspace"), [
    "first issue",
    "second issue",
  ]);
  assert.deepEqual(observedRoots, ["explicit-workspace", "explicit-workspace"]);
});

test("isolates the package policy registry from later map mutations", async () => {
  const inspected = [];
  const policies = new Map([
    ["@luscious-garden/aster-test", {
      async inspect() {
        inspected.push("original");
      },
    }],
  ]);
  const inspector = new PackageArchitectureInspector(
    { async exists() { return true; } },
    { async read() { return { name: "@luscious-garden/aster-test", type: "module" }; } },
    { async read() { return ["test"]; } },
    { read() { return {}; } },
    { async inspect() {} },
    policies,
    new RepositoryPathResolver(),
    () => new WorkspaceDependencyGraph(),
  );

  policies.clear();
  await inspector.inspect("workspace", new ArchitectureIssueCollector());

  assert.deepEqual(inspected, ["original"]);
});
