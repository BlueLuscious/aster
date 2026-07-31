# Core Metadata

Status: **Accepted**

The metadata feature retains only values required by runtime, redistribution, discovery, or target
consumers. Optional intrinsic icon tags are portable; aliases, collection-specific taxonomy,
search indexes, source provenance, review notes, generated technical facts, and repository state
remain outside a definition.

## Contracts

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `IconMetadata` | Carries display name, optional intrinsic tags, RTL policy, resolved presentation policy, effective licensing, deprecation, and optional replacement identity. | Composes `IconRtlPolicyType`, `IconPresentationPolicy`, and optional `IconIdentity`. |

`licence` and `attribution` are optional at the general construction boundary because experimental
values may not be distributable. A distribution boundary must reject unresolved effective
licensing when publishing artwork.

## Types

| Type | Values | Responsibility |
| --- | --- | --- |
| `IconRtlPolicyType` | `mirror`, `preserve`, `manual` | Declares target-independent geometry behaviour for right-to-left output. |

The immutable `iconRtlPolicies` sequence is the feature-owned runtime authority for those values.
`IconRtlPolicyType` derives its union from that sequence so compile-time narrowing and runtime
validation cannot drift independently. The frozen sequence is exported from the package root for
target consumers that implement direction behaviour.

Core stores direction policy but never observes ambient direction, transforms geometry, or infers
semantics from an icon name.

## Runtime

| Class | Responsibility | Relations |
| --- | --- | --- |
| `IconMetadataNormaliser` | Validates resolved display, unique canonical tags, direction, licensing, deprecation, and replacement data before cloning and freezing it. | Composes `IconIdentityNormaliser` and `IconPresentationPolicyNormaliser`. |

Attribution requires an effective licence. A replacement requires deprecated metadata and must
not equal the complete identity of the definition being constructed. Core can compare the owning
definition with its replacement, but collection-wide replacement availability and cycle checks
remain generation-boundary responsibilities.

Metadata composition and replacement rules are defined by
[Metadata and Identity Boundary](../../../architecture/metadata-and-identity-boundary.md).
