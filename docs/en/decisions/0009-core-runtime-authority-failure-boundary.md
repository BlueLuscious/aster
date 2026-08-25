# 0009: Core Runtime Authority and Failure Boundary

Status: **Accepted**

Owners: **Technical maintainers**

Date: **2026-08-12**

Affected documents:

- [Portable Icon Core](../packages/core/index.md)
- [Core API](../packages/core/api/index.md)
- [Core Presentation](../packages/core/presentation/index.md)
- [Core Shared Runtime](../packages/core/shared/index.md)

Supersedes: **[0006: Public Portable Runtime Authorities](0006-public-portable-runtime-authorities.md)**

Superseded by: **None**

## Context

Core originally exported every immutable presentation vocabulary considered potentially useful to
renderers. Consumer evidence now distinguishes values that a target requires at runtime from a
closed enumeration used only by Core normalisation and public type derivation.

Core also kept its deterministic definition error private. Build nevertheless needs to distinguish
rejected portable definitions from unrelated programming failures and consequently compared the
private class name. That observable dependency had no supported public authority.

## Decision drivers

- Keep the runtime surface limited to demonstrated portable consumer responsibilities.
- Preserve one immutable authority for every closed internal vocabulary and its derived public
  type.
- Let JavaScript consumers distinguish public construction failures without private imports or
  class-name comparisons.
- Keep factories, normalisers, validators, and their implementation subpaths private.
- Avoid API operations unsupported by an implemented immutable composition workflow.

## Options

### Retain every existing runtime export and the private error

This avoids an ABI change but preserves one unused public value and Build's dependency on an
implementation class name.

### Make every validation authority public

Public validators or factories would expose implementation responsibilities and encourage
consumers to bypass `Icon.define()` and `Collection.define()`.

### Expose only demonstrated values and the terminal failure class

Consumers retain the portable vocabularies they interpret, while the public error provides the
narrow discrimination required at the construction boundary.

## Decision

Keep these deeply immutable portable runtime authorities public:

- `iconDirections`;
- `iconNodeKinds`;
- `iconPaintSchema`;
- `iconPresentationOverrideOrder`;
- `iconRtlPolicies`;
- `iconTechnicalPresentation`.

Keep `iconPresentationEnumerations` internal. `IconFillRuleType`, `IconStrokeLineCapType`, and
`IconStrokeLineJoinType` continue to derive from that immutable Core-owned authority, but no
consumer currently requires its object shape or values at runtime.

Export `IconDefinitionError` from the Core root. The frozen class exposes the stable static and
instance code `ASTER-CORE-001`, the logical `path`, its `TypeError` inheritance, and normal
`instanceof` discrimination. Its constructor remains available for type-consistent consumer tests
and adapters; throwing it does not grant access to Core validators or factories.

Retain `Icon` and `Collection` as frozen, `define()`-only authorities. No implemented consumer
requires incremental immutable composition, and collection membership remains collection-owned.

## Consequences

### Positive

- Every public runtime vocabulary has demonstrated external runtime use.
- Public presentation types retain one internal runtime source of truth.
- Build can distinguish Core construction failures through a supported import.
- Core validation implementation remains private.

### Negative

- Removing `iconPresentationEnumerations` is an incompatible runtime-surface change.
- `IconDefinitionError` and its documented fields become versioned public ABI.
- Consumers may construct the error directly even though Core remains its primary producer.

### Deferred

- Additional immutable operations require an implemented workflow with explicit ownership,
  duplicate, ordering, return, and failure semantics.
- Collection validation and freezing costs require measurement without weakening provenance or
  caller isolation.

## Compatibility and migration

The change occurs before a compatibility-bearing Core release. TypeScript consumers replace
runtime indexing into `iconPresentationEnumerations` with the corresponding public presentation
types. Build replaces its private class-name comparison with `instanceof IconDefinitionError` from
the supported package root.

## Evidence

- [Core Quality](../packages/core/quality.md)
- [Core API](../packages/core/api/index.md)
- [Core Presentation](../packages/core/presentation/index.md)
- [Core Shared Runtime](../packages/core/shared/index.md)
