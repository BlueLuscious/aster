# Core Definition

Status: **Accepted**

The definition feature composes identity, coordinate space, ordered nodes, and resolved metadata
into one render-neutral icon value.

Its implemented [immutable construction flow](runtime/index.md) validates authored objects without
retaining a catalogue or identity registry.

## Contracts

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `IconIdentity` | Carries canonical collection, icon, and optional variant slugs. | Used by `IconDefinition` and optional metadata replacement relationships. |
| `IconViewBox` | Carries finite minimum coordinates and positive logical dimensions. | Owns the coordinate system used by every node in `IconDefinition`. |
| `IconDefinition` | Carries one complete serialisable icon value. | Composes `IconIdentity`, `IconViewBox`, `IconNodeType`, and `IconMetadata`. |

## Identity rules

Collection, icon, and variant slugs are ASCII lowercase `kebab-case`. The optional variant forms
part of logical identity; it is not presentation state or a render option.

The type surface represents slugs as strings because TypeScript cannot express the complete naming
grammar without a runtime boundary. Construction validates those strings before accepting a
definition.

## Definition rules

Nodes are read-only and retain paint order. The contract documents that the sequence is non-empty,
but cardinality, finite numbers, positive dimensions, canonical strings, and deep immutability are
runtime invariants rather than compile-time claims.

Canonical identity and naming authority are defined by
[Metadata and Identity Boundary](../../../architecture/metadata-and-identity-boundary.md).
