# Testing Policy

Status: **Accepted**

Aster tests protect observable product, package, tooling and workflow guarantees. Test volume is
not a quality target: every retained test must identify the boundary it owns, use the narrowest
representative evidence that can prove it, and fail when that guarantee changes.

## Evidence roles

Every test has one primary role:

| Role | Evidence owned |
| --- | --- |
| Contract | Accepted public or internal behaviour and exact invariants. |
| Regression | A previously observed failure represented by minimal reproducible input. |
| Boundary | Architecture, ownership, validation, security or effect containment. |
| Conformance | Emitted packages, declarations, public subpaths, executables or clean consumers. |
| Workflow | One meaningful composition across independently owned boundaries. |
| Measurement | Fixture and runner semantics without accidental product performance promises. |

A test is removed when it has no current role, protects retired behaviour, asserts an unsupported
implementation arrangement, cannot fail when its claimed behaviour breaks, or is strictly weaker
than evidence owned by another retained test. Consolidation must preserve failure localisation and
must not collapse source and distribution, unit and conformance, or synthetic and real-catalogue
boundaries unless they are demonstrably equivalent.

## Evidence ownership

Package runtime and type suites own package behaviour at source level. ABI, executable and
clean-consumer suites independently own emitted distribution behaviour. Repository-tooling suites
own private maintenance and verification policies. Global workflows prove only compositions that
cannot be established by one package in isolation.

Package tests use package-owned synthetic definitions when any valid value can prove the contract.
Exact production artwork is retained only when that artwork is itself the subject. Security,
validation, diagnostics, export maps, serialised markup, ordering rules and deliberately fixed
measurement fixtures remain exact because changing their values changes the tested guarantee.

## Catalogue independence

Tests that exercise the real catalogue derive representatives, identities, membership and counts
from the canonical `AsterIcons` and `AsterCollections` indexes. A suite that requires catalogue
evidence rejects an empty required family explicitly rather than silently passing or selecting a
named product value.

Exact icon identities remain valid in tests of identity-specific semantics, including declared RTL
relationships, stable public subpaths and deliberately selected semantic pairs. Synthetic fixtures
may use descriptive names freely when they do not imply dependence on the production catalogue.

## Isolation and effects

Tests cannot depend on execution order, network access, stale distribution output or ambient
filesystem state. Filesystem suites create owned temporary roots and clean them within the same
test lifecycle. Generated repository sources are verified for drift and must remain reproducible
from their canonical authored inputs.

Subprocess suites are reserved for observable process, executable, package-manager or clean-consumer
boundaries. In-process tests remain preferred for domain behaviour because they provide narrower
failure evidence and avoid unnecessary host cost.

## Verification ownership

The complete repository gate is `pnpm run verify`. Its checks establish generated-source,
TypeScript, architecture and documentation conformance; its test graph establishes tooling,
package, distribution and cross-package workflow evidence.

Individual ABI, conformance and workflow commands build the outputs they inspect so they remain
valid when run independently. The complete gate does not append another workspace build after the
workflow suite because that suite has just rebuilt every package and no subsequent command can
invalidate its output. Frozen dependency installation remains a CI and release prerequisite rather
than a test responsibility.

Package-specific guarantees remain with the corresponding [package documentation](../packages/index.md),
and private repository verification behaviour remains with [Repository Tooling](../tooling/index.md).
