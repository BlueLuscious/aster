import assert from "node:assert/strict";
import test from "node:test";

import { ArchitectureIssueCollector } from "../../tooling/architecture/runtime/architecture-issue.collector.mjs";
import { ArchitectureVerifier } from "../../tooling/architecture/runtime/architecture-verifier.mjs";
import { ModuleSpecifierExtractor } from "../../tooling/architecture/runtime/module-specifier.extractor.mjs";
import { WorkspaceDependencyGraph } from "../../tooling/architecture/runtime/workspace-dependency.graph.mjs";

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
