# Testing Policy

Status: **Accepted**

Tests protect observable product, package, tooling and workflow guarantees. Test volume is not a
quality target: each retained test needs a clear boundary, representative evidence and a failure
when its claimed guarantee changes.

## Evidence roles

| Role | Owned evidence |
| --- | --- |
| Contract | Accepted public or internal behaviour and exact invariants. |
| Regression | A previously observed failure with minimal reproducible input. |
| Boundary | Architecture, validation, security, ownership or effect containment. |
| Conformance | Emitted modules, declarations, subpaths, executables or clean consumers. |
| Workflow | A composition across independently owned boundaries. |
| Measurement | Fixture and runner semantics, not product speed promises. |

| Suite | Primary roles |
| --- | --- |
| Package `tests/types/` | Contract and Boundary for TypeScript acceptance/rejection. |
| Package `tests/runtime/` | Contract, Regression and Boundary for source behaviour. |
| Package `tests/abi/` | Conformance for emitted package surfaces. |
| CLI `tests/executable/` | Boundary and Conformance for the installed process interface. |
| Root `tests/tooling/` | Boundary and Measurement for private repository capabilities. |
| Root `tests/workflow/` | Workflow for compositions that no individual package can prove. |

Remove evidence that has no current role, protects retired behaviour, cannot detect its claimed
failure or is strictly weaker than another retained test. Consolidation must preserve failure
localisation and independent source/distribution, unit/conformance and synthetic/real-catalogue
boundaries unless they are demonstrably equivalent.

## Fixture ownership

Use package-owned synthetic values when any valid value proves a contract. Retain exact artwork
only when that artwork is the subject. Security rules, diagnostics, export maps, markup ordering
and deliberately fixed measurement inputs remain exact because their values define the guarantee.

Real-catalogue tests discover through manifests and acquire definitions through exact loaders.
Required families must reject an empty catalogue instead of silently passing. Exact identities
remain appropriate for identity-specific semantics such as RTL relationships and stable subpaths;
they are not a reason to couple unrelated tests to current artwork.

## Isolation and effects

Tests cannot depend on order, network access, stale build output or ambient filesystem state.
Filesystem tests own temporary roots and their cleanup. Generated sources must be reproducible
from authored inputs and checked for drift.

Use subprocesses for process, installed-executable, package-manager and clean-consumer boundaries;
prefer in-process tests for domain behaviour. Distribution and workflow commands must build the
outputs they inspect when run independently.

## Verification requirements

The complete repository gate is `pnpm run verify`. CI must pass the frozen installation and this
gate on both Ubuntu and Windows; local success does not replace either clean environment.
Frozen installation is a CI/release prerequisite, not a test responsibility.

[Repository tooling](../tooling/index.md) owns command composition, build orchestration and
toolchain configuration. [Package quality guides](../packages/index.md) own their narrower
conformance evidence. [Publication](publication.md) requires separate maintainer approval even
after verification passes.
