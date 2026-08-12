import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";

import { CanonicalDocumentInspector } from "../../tooling/documentation/runtime/canonical-document.inspector.mjs";
import { DecisionRecordInspector } from "../../tooling/documentation/runtime/decision-record.inspector.mjs";
import { DocumentationHierarchyInspector } from "../../tooling/documentation/runtime/documentation-hierarchy.inspector.mjs";
import { DocumentationIssueCollector } from "../../tooling/documentation/runtime/documentation-issue.collector.mjs";
import { DocumentationVerifier } from "../../tooling/documentation/runtime/documentation-verifier.mjs";
import { LocalLinkPolicy } from "../../tooling/documentation/runtime/local-link.policy.mjs";
import { LocalReferencePolicy } from "../../tooling/documentation/runtime/local-reference.policy.mjs";
import { MarkdownLinkTargetExtractor } from "../../tooling/documentation/runtime/markdown-link-target.extractor.mjs";
import { PackageDocumentationMirroringInspector } from "../../tooling/documentation/runtime/package-documentation-mirroring.inspector.mjs";
import { RepositoryPathResolver } from "../../tooling/shared/runtime/repository-path.resolver.mjs";

test("extracts only repository-local Markdown targets in source order", () => {
  const extractor = new MarkdownLinkTargetExtractor();

  assert.deepEqual(
    extractor.extract(
      [
        "[Local](guide.md)",
        "![Image](images/icon.svg)",
        "[Anchor](#section)",
        "[External](https://example.com)",
      ].join("\n"),
    ),
    ["guide.md", "images/icon.svg"],
  );
});

test("reports required hierarchy entries through an injected filesystem", async () => {
  const paths = new RepositoryPathResolver();
  const issues = new DocumentationIssueCollector();
  const inspector = new DocumentationHierarchyInspector(
    {
      async exists(path) {
        return !path.replaceAll("\\", "/").endsWith("governance/index.md");
      },
    },
    paths,
  );
  const workspaceRoot = resolve("fixture");

  await inspector.inspect(
    {
      workspaceRoot,
      documentationRoot: resolve(workspaceRoot, "docs/en"),
      documents: [],
    },
    issues,
  );

  assert.deepEqual(issues.snapshot(), [
    "Missing canonical documentation entry: docs/en/governance/index.md",
  ]);
});

test("reports missing and stale package documentation membership", async () => {
  const paths = new RepositoryPathResolver();
  const workspaceRoot = resolve("fixture");
  const packagesRoot = resolve(workspaceRoot, "packages");
  const issues = new DocumentationIssueCollector();
  const inspector = new PackageDocumentationMirroringInspector(
    {
      async read(path) {
        return path === packagesRoot ? ["core", "svg"] : ["core", "ghost"];
      },
    },
    paths,
  );

  await inspector.inspect(
    {
      workspaceRoot,
      documentationRoot: resolve(workspaceRoot, "docs/en"),
      documents: [],
    },
    issues,
  );

  assert.deepEqual(issues.snapshot(), [
    "Missing packages documentation for repository member: svg",
    "Documentation describes a missing packages member: ghost",
  ]);
});

test("applies local-reference and link policies in document order", async () => {
  const paths = new RepositoryPathResolver();
  const workspaceRoot = resolve("fixture");
  const document = {
    path: resolve(workspaceRoot, "docs/en/index.md"),
    content: "See plans/private.md. [Missing](missing.md) [Outside](../../../outside.md).",
  };
  const context = {
    workspaceRoot,
    documentationRoot: resolve(workspaceRoot, "docs/en"),
    documents: [document],
  };
  const issues = new DocumentationIssueCollector();
  const inspector = new CanonicalDocumentInspector([
    new LocalReferencePolicy(paths),
    new LocalLinkPolicy(
      {
        async exists() {
          return false;
        },
      },
      new MarkdownLinkTargetExtractor(),
      paths,
    ),
  ]);

  await inspector.inspect(context, issues);

  assert.deepEqual(issues.snapshot(), [
    "docs/en/index.md contains a local planning path",
    "docs/en/index.md contains a broken local link: missing.md",
    "docs/en/index.md links outside the repository: ../../../outside.md",
  ]);
});

test("reports malformed decision records after document-level inspection", async () => {
  const paths = new RepositoryPathResolver();
  const workspaceRoot = resolve("fixture");
  const documentationRoot = resolve(workspaceRoot, "docs/en");
  const issues = new DocumentationIssueCollector();
  const inspector = new DecisionRecordInspector(
    {
      async readText() {
        throw new Error("Decision index should be acquired once");
      },
    },
    paths,
  );

  await inspector.inspect(
    {
      workspaceRoot,
      documentationRoot,
      documents: [
        {
          path: resolve(documentationRoot, "decisions/index.md"),
          content: "# Decisions\n",
        },
        {
          path: resolve(documentationRoot, "decisions/0001-fixture.md"),
          content: "# Wrong\n\nStatus: **Draft**\n",
        },
      ],
    },
    issues,
  );

  assert.deepEqual(issues.snapshot(), [
    "docs/en/decisions/0001-fixture.md has no matching decision heading",
    "docs/en/decisions/0001-fixture.md has no accepted decision status",
    "docs/en/decisions/0001-fixture.md has no consequences section",
    "docs/en/decisions/0001-fixture.md is missing from the decision index",
  ]);
});

test("coordinates explicit roots, acquisition and policy order", async () => {
  const paths = new RepositoryPathResolver();
  const observed = [];
  const verifier = new DocumentationVerifier(
    [
      {
        async inspect(context, issues) {
          observed.push(context.workspaceRoot);
          issues.add("root issue");
        },
      },
    ],
    {
      async read(documentationRoot) {
        observed.push(documentationRoot);
        return [{ path: resolve(documentationRoot, "index.md"), content: "# Docs\n" }];
      },
    },
    {
      async inspect(context, issues) {
        observed.push(context.documents.length);
        issues.add("document issue");
      },
    },
    {
      async inspect(context, issues) {
        observed.push(context.documents.length);
        issues.add("decision issue");
      },
    },
    paths,
  );
  const workspaceRoot = resolve("explicit-workspace");

  assert.deepEqual(await verifier.verify(workspaceRoot), {
    issues: ["root issue", "document issue", "decision issue"],
    markdownFileCount: 1,
  });
  assert.deepEqual(observed, [workspaceRoot, resolve(workspaceRoot, "docs/en"), 1, 1]);
});
