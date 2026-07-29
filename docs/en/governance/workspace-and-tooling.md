# Workspace and Tooling

Status: **Accepted**

This document defines Aster's repository runtime, package manager, shared compiler baseline,
development-tool classification, and stable root command surface.

The rationale is recorded by
[0001: pnpm and TypeScript Workspace Toolchain](../decisions/0001-pnpm-typescript-workspace-toolchain.md).

## Repository runtime

The repository uses Node.js `24.10.0` for local development and CI. `.node-version` is the exact
version authority. `package.json#engines` accepts compatible Node `24.x` versions at or above that
baseline for package-manager validation, but CI remains pinned to the exact authority.

Published portable packages target ES2022 ESM. Their production compilation does not include Node,
DOM, browser, Lilium, or Lotus ambient types.

## Package manager and workspace

pnpm `10.28.1` is the only supported repository package manager. `package.json#packageManager`
pins the executable version and `pnpm-lock.yaml` is the immutable dependency-resolution authority.

`pnpm-workspace.yaml` defines pnpm workspace membership. `package.json#workspaces` mirrors the same
pattern for ecosystem metadata and must remain equivalent.

The root project is private and owns shared development infrastructure. It is not a publishable
runtime package. A clean checkout installs through:

```sh
pnpm install --frozen-lockfile
```

CI and ordinary verification cannot rewrite the lockfile.

## Tool classification

| Tool | Classification | Production status |
| --- | --- | --- |
| pnpm | Repository package manager and workspace orchestrator. | Never a runtime dependency. |
| Node.js | Repository runtime, built-in test host, and tooling host. | Not ambient authority for portable production code. |
| TypeScript | Production compiler and type-test compiler. | Development dependency only. |
| `tsx` | TypeScript execution adapter for Node's built-in test runner. | Test dependency only. |
| `@types/node` | Types for tests and repository tooling. | Excluded from portable production compilation. |
| GitHub Actions | CI adapter for stable root commands. | Repository infrastructure only. |

No third-party formatter, linter, test framework, monorepo orchestrator, or cleaner is selected.
Such a tool may be introduced behind the stable commands when concrete code provides evidence for
it. It remains replaceable development infrastructure and cannot leak into production contracts.

## Shared TypeScript baseline

`tsconfig.base.json` establishes:

- ES2022 language and library capabilities;
- ESM output with bundler-compatible module resolution;
- forced module detection and native class-field semantics;
- strict typing, exact optional properties, unchecked-index protection, and explicit overrides;
- declaration generation and no output after compilation errors;
- no ambient type packages by default.

Each production package extends the base and declares its own source, output, declaration, and
package-export boundaries. Test and repository-tooling configurations opt into Node types
explicitly and do not alter production compilation.

## Stable root commands

The root exposes:

| Command | Contract |
| --- | --- |
| `pnpm build` | Build every real package in dependency order when it defines `build`. |
| `pnpm check` | Run package type checks, repository architecture and documentation checks, and any delegated linting or non-mutating formatting contracts that packages define. |
| `pnpm check:architecture` | Validate the portable compiler baseline, workspace metadata, package dependency boundaries, and authored collection roots. |
| `pnpm check:docs` | Validate canonical documentation hierarchy, mirroring, links, local-reference exclusions, and decision records. |
| `pnpm check:types` | Run every package `check:types` contract. |
| `pnpm lint` | Delegate to every package that defines a `lint` contract. |
| `pnpm format` | Delegate to every package that defines an explicitly mutating `format` contract. |
| `pnpm format:check` | Delegate to every package that defines a non-mutating `format:check` contract. |
| `pnpm test` | Run repository-tooling fixtures and every package `test` contract. |
| `pnpm test:tooling` | Run fixture-based conformance for repository-owned checkers. |
| `pnpm verify` | Run checks, tests, and builds through public root commands. |
| `pnpm clean` | Delegate cleanup to each real package's guarded `clean` contract. |

These commands are stable orchestration boundaries and do not name internal scripts. The empty
workspace legitimately has no matching package operations. Core and Build do not yet define
linting or formatting scripts, so those reserved root delegators currently succeed without
inspecting source. This is a known tooling gap rather than evidence of linting or formatting
conformance. Automated style enforcement requires either a repository-owned checker or an
explicitly classified external tool behind the existing command boundaries.

The accepted package test path uses TypeScript compile-time tests and Node's built-in test runner
executed through `tsx`. A package may divide those responsibilities into `test:types` and
`test:runtime`, while its public `test` command remains the complete package test contract.

Repository-owned checkers use Node.js directly and expose their behaviour through the stable
`check:architecture` and `check:docs` commands. Their fixture tests invoke verification functions
with explicit temporary workspace roots, while the command-line adapters own terminal output and
process exit status.

## Replacement boundaries

External development infrastructure remains replaceable behind stable repository commands:

- `tsx` adapts TypeScript tests to Node's built-in runner and does not define test semantics;
- GitHub Actions adapts immutable installation and `pnpm verify` to hosted CI;
- action implementations and caches are CI details and do not become local verification steps;
- a future formatter, linter, browser runner, or bundler must receive an explicit classification
  and stable command boundary before adoption.

A replacement may change internal invocation or configuration without changing the documented
command contract. No temporary tool may enter runtime dependencies, portable compiler ambient
types, product contracts, or generated artefacts.

## Cleanup safety

The root `clean` command never discovers or removes output itself. Each package owns its generated
or distribution root and validates that root before recursive deletion.

A package cleaner must:

- resolve the package root and allowed output root to absolute paths;
- refuse a target outside or equal to the package root;
- remove only a statically declared generated or distribution directory;
- tolerate an absent output directory;
- have fixture-based safety tests before generated output is introduced.

Core and Build own direct `dist` distribution roots. Their package commands delegate cleanup to
the guarded workspace cleaner, which accepts only the direct `dist` child of a directory
containing a package manifest and is covered by fixture-based safety tests. Future packages add
cleanup only with their first real output boundary, never as an empty speculative utility.

## Dependency installation

Development dependency specifiers are exact. Lockfile updates use the pinned pnpm version and are
committed with their manifest change. CI uses offline cache only as an optimisation; the frozen
lockfile remains authoritative.

Production, build, test, and temporary development dependencies are declared at the narrowest
workspace level that owns their use. Shared development tools remain at the private root while
their versions and configuration are uniform across packages.
