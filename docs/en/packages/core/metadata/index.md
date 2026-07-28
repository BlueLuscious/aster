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

Core stores direction policy but never observes ambient direction, transforms geometry, or infers
semantics from an icon name.

Metadata composition and replacement rules are defined by
[Metadata and Identity Boundary](../../../architecture/metadata-and-identity-boundary.md).
