# 0001: pnpm and TypeScript Workspace Toolchain

Status: **Accepted**

Owners: **Technical maintainers**

Date: **2026-07-28**

Affected documents:

- [Repository Tooling](../tooling/index.md)
- [Product and Package Boundaries](../architecture/product-and-package-boundaries.md)

Supersedes: **None**

Superseded by: **None**

## Context

Aster needs a deterministic workspace before its first portable package is implemented. The
toolchain must support strict ES2022 ESM libraries, TypeScript type tests, Node runtime tests,
dependency-ordered package commands, and frozen CI installation without imposing production
dependencies.

The workspace should remain understandable without a third-party monorepo orchestrator. External
development tools must have explicit ownership and remain replaceable.

## Decision drivers

- Deterministic installation and exact tool versions.
- Native workspace dependency ordering.
- Strict host-independent TypeScript production compilation.
- TypeScript execution through Node's built-in test runner.
- Minimal development dependency surface.
- No runtime leakage from repository tooling.

## Options

### npm workspaces

npm would use the Node-distributed package-manager family and avoid a separate executable. Its
workspace filtering and repository conventions would differ from the established ecosystem
workflow and provide no concrete advantage for Aster's package graph.

### pnpm workspace with TypeScript and tsx

pnpm provides an explicit workspace manifest, strict dependency installation, recursive
dependency-ordered commands, and an immutable lockfile. TypeScript owns compilation and type
tests; `tsx` adapts TypeScript runtime tests to Node's built-in runner.

### Third-party monorepo orchestrator

An additional orchestrator could provide caching and execution graphs. Aster has no measured scale or
independent requirement that justifies that dependency and configuration yet.

## Decision

Aster uses:

- pnpm `10.28.1`, pinned by `package.json#packageManager`;
- `pnpm-workspace.yaml` as pnpm workspace-membership authority;
- matching `package.json#workspaces` ecosystem metadata;
- `pnpm-lock.yaml` with frozen CI installation;
- Node.js `24.10.0`, pinned by `.node-version`;
- TypeScript `5.9.3` for ES2022 ESM production and type tests;
- `tsx` `4.23.1` with Node's built-in runtime test runner;
- `@types/node` only in tests and repository tooling.

The private root owns shared development versions and stable recursive command names. No
third-party monorepo orchestrator, formatter, linter, test framework, or cleaner is selected
without concrete evidence.

## Consequences

### Positive

- Installation and compiler behaviour have explicit authorities.
- Portable production compilation remains free from host ambient types.
- Packages share one command surface without importing repository tooling.
- Runtime tests use Node capabilities through one small TypeScript adapter.
- Future development tools can be introduced behind stable commands.

### Negative

- Contributors must use the pinned pnpm and Node versions.
- The repository must keep two matching workspace-pattern declarations.
- Recursive commands require each real package to implement applicable scripts.
- Formatting and linting have no implementation until concrete code justifies one.

### Deferred

- Repository checks will verify script contracts, workspace-pattern equivalence, and tool
  classification.
- The first package output boundary will add and test its guarded cleaner.
- Formatter or linter selection requires implementation evidence and remains development-only.

## Compatibility and migration

This is the first accepted repository toolchain. It changes no published package or collection
contract.

Changing package manager, lockfile authority, production target, module format, or test host
requires a superseding decision record. Compatible patch updates to development tools follow
ordinary dependency review when they preserve this boundary.

## Evidence

- [Root package manifest](../../../package.json)
- [Workspace manifest](../../../pnpm-workspace.yaml)
- [Shared TypeScript configuration](../../../tsconfig.base.json)
- [Continuous Integration workflow](../../../.github/workflows/ci.yaml)
