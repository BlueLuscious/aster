# Documentation Tooling

Status: **Accepted**

The documentation feature verifies objective canonical-documentation invariants through
`pnpm check:docs`. It does not score prose, enforce subjective style, or replace technical and
curatorial review.

## Current verification

The verifier requires canonical entry points for architecture, collections, decisions, governance,
packages, and tooling. It also verifies:

- package documentation mirrors real workspace packages;
- local Markdown links resolve within the repository;
- canonical prose contains no local plans, task identifiers, or contributor-machine paths;
- decision records use accepted states, consequence sections, and index membership;
- Markdown files are discovered and reported in deterministic order.

The exported `verifyDocumentation(workspaceRoot)` function returns issues and the inspected Markdown
count without owning terminal or process state. Its command adapter resolves the repository root,
prints the result, and sets failure exit state.

## Tests

Fixture tests create self-contained temporary canonical hierarchies and exercise accepted roots,
package mirroring, collection independence, broken links, local references, and malformed decision
records.

## Internal hardening

Filesystem acquisition, path handling, directory discovery, and deterministic Markdown traversal
use the [Shared Tooling](../shared/index.md) foundations. The current feature module still combines
hierarchy, mirroring, reference, link, and decision policy; its feature-specific hardening
separates those responsibilities behind the same root command and result shape. The stable policy
itself remains defined by
[Documentation Policy](../../governance/documentation-policy.md).
