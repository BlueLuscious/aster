# Repository Tooling

Status: **Accepted**

`tooling/` contains private contributor infrastructure for verifying and maintaining the Aster
workspace. It is not a publishable package, product API, or implementation dependency for
`@aster/*` packages.

## Features

The canonical documentation mirrors the real tooling feature roots:

| Feature | Responsibility |
| --- | --- |
| [Architecture](architecture/index.md) | Verifies compiler, workspace, package dependency, and authored collection boundaries. |
| [Documentation](documentation/index.md) | Verifies canonical hierarchy, package mirroring, links, local exclusions, and decision records. |
| [Performance](performance/index.md) | Provides development-only package comparison infrastructure and independent scenario runners. |
| [Workspace](workspace/index.md) | Owns guarded repository and package maintenance operations such as distribution cleanup. |

User-facing project operations do not belong here. Persistent target export and disposable review
composition are future `aster export` and `aster review` responsibilities. The CLI may compose
public package capabilities, but neither CLI nor any other published package imports repository
tooling.

## Runtime and dependencies

The repository uses Node.js `24.10.0` for local tooling and CI. `.node-version` is the exact runtime
authority. `package.json#engines` accepts compatible Node `24.x` versions at or above that baseline
for package-manager validation.

pnpm `10.28.1` is the only supported workspace package manager. `package.json#packageManager` pins
the executable, `pnpm-lock.yaml` owns immutable dependency resolution, and
`pnpm-workspace.yaml` owns membership. `package.json#workspaces` mirrors that pattern for ecosystem
metadata and must remain equivalent.

The private root owns shared development versions:

| Dependency | Responsibility | Production status |
| --- | --- | --- |
| TypeScript | Compiles production packages and type tests. | Development only. |
| `tsx` | Adapts TypeScript tests to Node's built-in test runner. | Test only. |
| `@types/node` | Types tests and repository tooling. | Excluded from portable production compilation. |

No third-party monorepo orchestrator, formatter, linter, test framework, cleaner, or benchmark
framework is currently selected. A future tool must remain replaceable behind an accepted root
command and cannot leak into product contracts or runtime dependencies.

## Shared compiler baseline

`tsconfig.base.json` defines ES2022 ESM, strict typing, exact optional properties, unchecked-index
protection, native class-field semantics, declaration generation, and no ambient type packages by
default. Production packages extend that baseline with their own source and output boundaries.
Tests and repository tooling opt into Node capabilities independently.

## Stable root commands

The private root exposes stable orchestration contracts:

| Command | Contract |
| --- | --- |
| `pnpm build` | Build every real package in dependency order when it defines `build`. |
| `pnpm check` | Run type, architecture, documentation, lint, and non-mutating format checks. |
| `pnpm check:architecture` | Run the [architecture verifier](architecture/index.md). |
| `pnpm check:docs` | Run the [documentation verifier](documentation/index.md). |
| `pnpm check:types` | Build and type-check every applicable package. |
| `pnpm benchmark:core` | Run the development-only [Core comparison](performance/index.md). |
| `pnpm lint` | Delegate to packages that define an accepted lint contract. |
| `pnpm format` | Delegate to packages that define a mutating format contract. |
| `pnpm format:check` | Delegate to packages that define a non-mutating format contract. |
| `pnpm test` | Run tooling fixtures, package tests, and cross-package workflows. |
| `pnpm test:tooling` | Run fixture-based conformance for repository tools. |
| `pnpm test:workflow` | Run implemented cross-package workflows through public roots. |
| `pnpm clean` | Delegate to each package's guarded cleanup contract. |
| `pnpm verify` | Run checks, tests, and builds as the complete repository gate. |

Root commands remain stable while internal implementations can be replaced. Empty delegated lint
or format matches are not evidence that source has been inspected; objective linting and formatting
remain deferred until an accepted implementation exists.

## Structural rules

New and hardened tooling uses package-like boundaries only where responsibilities justify them:

- entrypoints compose capabilities, invoke one runtime authority, and adapt results to process
  output or exit state;
- runtime classes own stateful or multi-step behaviour;
- constants own closed stable configuration rather than incidental literals;
- internal contracts describe useful injected or replaceable capabilities;
- shared code requires multiple real tooling consumers;
- one primary concept remains in each file;
- composition is preferred over inheritance;
- filesystem, process, terminal, clock, and memory authority remains explicit and narrow.

Architecture, documentation, and cleanup implementations predate the complete target structure and
are being reorganised behind unchanged commands. Their current fixture behaviour remains
authoritative during that internal work.

## Package isolation

Tooling may inspect source structure and consume built public package roots for integration
evidence. It cannot establish hidden package behaviour. Production packages compile and function
without `tooling/`, Node ambient types, repository paths, or root scripts.

The project-level dependency direction is defined by
[Product and Package Boundaries](../architecture/product-and-package-boundaries.md). Toolchain
selection rationale is recorded by
[0001: pnpm and TypeScript Workspace Toolchain](../decisions/0001-pnpm-typescript-workspace-toolchain.md).
