# Core Definition

Status: **Accepted**

The definition feature composes identity, coordinate space, ordered nodes, and resolved metadata
into one render-neutral icon value.

Its implemented [immutable construction flow](runtime/index.md) validates authored objects without
retaining a catalogue or identity registry.

## Contracts

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `IconIdentity` | Carries an optional canonical namespace, required icon name, and optional variant. | Used by `IconDefinition`, optional metadata replacement relationships, and Import source descriptors. |
| `IconViewBox` | Carries finite minimum coordinates and positive logical dimensions. | Owns the coordinate system used by every node and is reused by Import validation evidence. |
| `IconDefinition` | Carries one complete serialisable icon value. | Composes `IconIdentity`, `IconViewBox`, `IconNodeType`, and `IconMetadata`. |

## Identity rules

Namespace, icon, and variant slugs are ASCII lowercase `kebab-case`. Namespace identifies a
producer or collision domain independently of collection membership and may be omitted. The
optional variant forms part of logical identity; it is not presentation state or a render option.

Collection membership never enters `IconIdentity`. One icon can therefore exist standalone or be
retained by multiple independent collections without changing identity.

The type surface represents slugs as strings because TypeScript cannot express the complete naming
grammar without a runtime boundary. Construction validates those strings before accepting a
definition.

## Definition rules

Nodes are read-only and retain paint order. The contract documents that the sequence is non-empty,
but cardinality, finite numbers, positive dimensions, canonical strings, and deep immutability are
runtime invariants rather than compile-time claims.

`IconIdentity` is the canonical portable identity authority. Display names, filenames, TypeScript
symbols, package subpaths, catalogues, and collection memberships neither replace nor extend it.
Source adapters may map their own identifiers to this shape, but Core alone validates the final
namespace, name, and variant accepted by a definition.
