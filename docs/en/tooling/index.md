# Repository Tooling

Status: **Accepted**

`tooling/` contains private contributor infrastructure for maintaining and verifying the Aster
workspace. It is not a publishable package or product dependency.

## Features

| Feature | Responsibility |
| --- | --- |
| [Architecture](architecture/index.md) | Verifies compiler, workspace, package dependency and production-source boundaries. |
| [Catalogue](catalogue/index.md) | Validates canonical Icons sources and synchronises manifests, loaders and public facades. |
| [Documentation](documentation/index.md) | Verifies canonical hierarchy, package mirroring, local links and contributor-local exclusions. |
| [Performance](performance/index.md) | Supplies development-only package comparison infrastructure and independent scenario runners. |
| [Release](release/index.md) | Prepares and verifies package-specific GitHub drafts from approved npm archives. |
| [Shared](shared/index.md) | Supplies narrow filesystem, path, JSON, directory and traversal capabilities used by multiple features. |
| [Workspace](workspace/index.md) | Guards package distribution cleanup. |

User-facing export and review belong to [CLI](../packages/cli/index.md), not repository tooling.
The [package guide](../packages/index.md) owns production composition and dependencies.

## Runtime and dependencies

[.node-version](../../../.node-version) owns the exact local and CI runtime.
[package.json](../../../package.json) owns the compatible Node engine range, pinned pnpm executable
and shared development versions. [pnpm-lock.yaml](../../../pnpm-lock.yaml) owns dependency resolution;
[pnpm-workspace.yaml](../../../pnpm-workspace.yaml) owns membership, mirrored by
`package.json#workspaces`.

| Development dependency | Responsibility |
| --- | --- |
| TypeScript | Compiles packages and type tests; parses catalogue source during synchronisation. |
| `tsx` | Adapts TypeScript tests to Node's built-in runner. |
| `@types/node` | Types tests and tooling, not portable production compilation. |
| ESLint and `typescript-eslint` | Enforce focused authored-source rules. |
| Prettier | Formats owned workspace configuration. |

No third-party monorepo orchestrator, test framework, cleaner or benchmark framework is selected.
Development dependencies must not enter product contracts or runtime dependencies.

## Shared compiler baseline

[tsconfig.base.json](../../../tsconfig.base.json) owns ES2022 ESM, strict typing, exact optional
properties, unchecked-index protection, unused-local and parameter rejection, native class fields,
declaration generation and the absence of ambient type packages. Production packages extend it
with their own source and output boundaries.

Tests opt into host capabilities independently.
[tsconfig.tooling.json](../../../tsconfig.tooling.json) applies strict `checkJs` analysis to authored
tooling without emitting files. Built modules used by performance probes remain outside that
source boundary and receive package type, ABI and clean-consumer verification.

## Stable root commands

| Command | Contract |
| --- | --- |
| `pnpm build` | Build applicable packages in dependency order. |
| `pnpm check` | Run catalogue drift, type, architecture, documentation, lint and formatting checks. |
| `pnpm check:architecture` | Run the [architecture verifier](architecture/index.md). |
| `pnpm check:catalogue` | Check [catalogue output](catalogue/index.md) without writing. |
| `pnpm check:docs` | Run the [documentation verifier](documentation/index.md). |
| `pnpm check:types` | Build and type-check applicable packages, then type-check tooling. |
| `pnpm check:tooling-types` | Type-check authored tooling independently. |
| `pnpm benchmark:core` | Run the [Core comparison](performance/index.md#package-comparisons). |
| `pnpm benchmark:icons` | Run the [Icons comparison](performance/index.md#package-comparisons). |
| `pnpm benchmark:svg` | Run the [SVG comparison](performance/index.md#package-comparisons). |
| `pnpm benchmark:cli` | Run the [CLI comparison](performance/index.md#package-comparisons). |
| `pnpm benchmark:import` | Run the [Import comparison](performance/index.md#package-comparisons). |
| `pnpm lint` | Check authored package, tooling and test code plus the lint configuration. |
| `pnpm format` | Format owned manifests and quality-tool configuration explicitly. |
| `pnpm format:check` | Check those files without writing. |
| `pnpm release:prepare -- <package> <version>` | Produce a read-only [Release intent](release/index.md). |
| `pnpm test` | Run tooling fixtures, package tests and cross-package workflows. |
| `pnpm test:tooling` | Run tooling fixture conformance. |
| `pnpm test:workflow` | Build packages and test workflows through public roots. |
| `pnpm clean` | Delegate to each package's [guarded cleanup](workspace/index.md). |
| `pnpm verify` | Run checks and the complete test graph. |

Internal implementations may change behind these root commands. Verification never invokes the
mutating `format` command.

## Source quality boundaries

[ESLint configuration](../../../eslint.config.mjs) checks semicolons, double-quoted strings,
braced control flow, strict equality and selected unsafe constructs. It does not repeat type
analysis, dependency inspection or prose review. Generated catalogue sources, distribution output,
dependency installations and parser fixtures are excluded.

Prettier checks root and package manifests plus its own and ESLint's configuration. The Icons
manifest is excluded because catalogue synchronisation owns its export entries and serialisation.
Authored source, documentation, lockfiles, generated artefacts and fixtures remain outside this
formatting boundary. Widening it requires a separately reviewed migration, not a mechanical rewrite.

## Verification orchestration

[Testing policy](../project/testing.md) owns evidence roles and isolation requirements. Commands
that inspect emitted packages retain their own build prerequisites so they work independently.
Architecture inspection evaluates source and manifests; ABI tests evaluate emitted declarations,
modules, exports and loading.

`pnpm verify` does not append another workspace build after testing: its final workflow command
already rebuilds all packages, and no later operation mutates their outputs. Other repeated builds
remain deliberate isolation costs.

[CI](../../../.github/workflows/ci.yaml) runs the complete gate independently on Ubuntu and Windows.
A successful job on one platform does not substitute for the other.

## Implementation boundary

Entrypoints adapt explicit capabilities and results to process state; runtime classes own concrete
state or multi-step behaviour. Feature policies stay with their owners. Shared code requires
multiple real consumers, and filesystem, process, clock and memory authority remains narrow.

Tooling may inspect sources and consume built public roots for evidence. Production packages
cannot import it or require repository paths, root scripts or Node ambient types.
[Extraction](../future-capabilities.md#headless-repository-tooling-extraction) remains conditional
on a second real repository consumer.
