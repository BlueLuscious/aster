# Core Metadata

Status: **Accepted**

The metadata feature retains only values required by runtime, redistribution, or target consumers.
Search indexes, tags, aliases, source provenance, review notes, generated technical facts without
a runtime consumer, and repository state remain outside a definition.

## Contracts

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `IconMetadata` | Carries display name, RTL policy, resolved presentation policy, effective licensing, deprecation, and optional replacement identity. | Composes `IconRtlPolicyType`, `CollectionPresentationPolicy`, and optional `IconIdentity`. |

`licence` and `attribution` are optional at the general construction boundary because experimental
values may not be distributable. A distribution boundary must reject unresolved effective
licensing when publishing artwork.

## Types

| Type | Values | Responsibility |
| --- | --- | --- |
| `IconRtlPolicyType` | `mirror`, `preserve`, `manual` | Declares target-independent geometry behaviour for right-to-left output. |

The immutable `iconRtlPolicies` sequence is the feature-owned runtime authority for those values.
`IconRtlPolicyType` derives its union from that sequence so compile-time narrowing and runtime
validation cannot drift independently. The authority remains internal and does not add a public
runtime export.

Core stores direction policy but never observes ambient direction, transforms geometry, or infers
semantics from an icon name.

## Runtime

| Class | Responsibility | Relations |
| --- | --- | --- |
| `IconMetadataNormaliser` | Validates resolved display, direction, licensing, deprecation, and replacement data before cloning and freezing it. | Composes `IconIdentityNormaliser` and `CollectionPresentationPolicyNormaliser`. |

Attribution requires an effective licence. A replacement requires deprecated metadata and must
not equal the complete identity of the definition being constructed. Core can compare the owning
definition with its replacement, but collection-wide replacement availability and cycle checks
remain generation-boundary responsibilities.

Metadata composition and replacement rules are defined by
[Metadata and Identity Boundary](../../../architecture/metadata-and-identity-boundary.md).
