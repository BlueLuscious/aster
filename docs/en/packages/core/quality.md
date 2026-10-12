# Core Quality

Status: **Accepted**

This page owns conformance evidence for `@luscious-garden/aster-core`, not a second specification
of its data model. [API](api/index.md) owns the exact public exports; the
[feature map](index.md#documentation) leads to each contract, type and runtime authority.
[Quality Baseline](quality-baseline.md) owns measured comparisons and their acceptance rules.

## Evidence coverage

| Evidence | Guarantees exercised | Behaviour authority |
| --- | --- | --- |
| Runtime definition suites | Numeric and textual boundaries, geometry, metadata relationships, deterministic errors, canonical ordering, isolation and deep freezing. | [Definition Runtime](definition/runtime/index.md), [Node](node/index.md), [Metadata](metadata/index.md) and [Presentation](presentation/index.md). |
| Adversarial input suite | Symbols, hidden fields, accessors, inherited fields, custom and null prototypes, sparse or extended arrays, cyclic values and proxy failures. | [Shared Runtime](shared/index.md) and [Trust Boundary](workflow.md#security-and-trust-boundary). |
| Collection runtime suite | Empty and populated dictionaries, alias order, duplicate identities, many-to-many membership, canonical retention and complete-definition revalidation after structural cloning. | [Collection](collection/index.md). |
| Type suites | Portable narrowing, readonly aliases and members, optional aliases, canonical output types for mutable input, and rejection of unsupported host concepts. | Feature contracts and types. |
| Built-package ABI suite | Exact root exports, unsupported private subpaths, ESM and side-effect metadata, portable declarations and absence of reverse dependencies or host types. | [API](api/index.md#package-exports) and [Package Boundary](index.md#boundary). |

The adversarial suite proves that ordinary accessors are not executed. Proxy failures remain
outside the validation guarantee; a benchmark does not replace either class of correctness test.

## Consumer conformance

- Icons constructs definitions and collections through public Core authorities.
- SVG revalidates definitions and consumes portable vocabularies without importing Core internals.
- Import constructs accepted portable values through the public root while keeping source
  diagnostics and host operations outside Core.
- CLI isolates provider values through Core; its packed-consumer suite also compiles concrete
  collection aliases, rejects mutation and verifies retained icon references and ordered members.
- Repository workflow tests exercise TypeScript-first authoring, Import equivalence, collection
  composition and SVG hand-off through built public package roots.

These tests verify the implemented [package relationships](../index.md), not hypothetical future
adapters. The [project testing policy](../../project/testing.md) defines the role of package,
packed-consumer and cross-package evidence.

## Public authority rationale

Frozen construction objects and exported vocabularies are portable domain authorities, not
catalogue state. Leaf contracts remain deliberate geometry and metadata vocabulary even when a
particular contract has no named external import. Their descriptions belong to the owning
features rather than a duplicate public inventory here.

Complete member reconstruction and identity-safe graph comparison remain required by the
[collection retention contract](collection/index.md#runtime). The
[measured matcher investigation](quality-baseline.md#attributed-investigation-outcome) did not
justify replacing that implementation. Frozen-only shortcuts, branding, registries and mutable
memoisation do not establish equivalent evidence.

No implemented workflow requires incremental membership mutation or definition instances with
behaviour. Any API expansion must establish ownership, immutable return, ordering, duplicate and
failure semantics under the [compatibility policy](../../project/versioning.md). Distribution
counts and machine-specific timings remain comparison evidence, not compatibility guarantees.
