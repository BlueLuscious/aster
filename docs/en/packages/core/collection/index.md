# Core Collection

Status: **Accepted**

The collection feature represents an independently identified immutable grouping of portable icon
definitions. Membership is owned only by the collection: an icon neither requires a collection
nor retains a reverse membership list.

## Contracts

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `CollectionIdentity` | Carries an optional canonical namespace and required collection name. | Identifies `CollectionDefinition` independently of its members. |
| `CollectionMetadata` | Carries display name, optional description, intrinsic discovery tags, licence, and attribution. | Describes the collection itself and never overrides member icon metadata. |
| `CollectionDefinition` | Carries identity, ordered unique direct icon membership, and metadata. | Composes `CollectionIdentity`, `CollectionMetadata`, and `IconDefinition`. |

An empty `icons` sequence is valid. A release or catalogue policy may require a populated
collection without weakening the portable domain contract.

## Runtime

| Class | Responsibility | Relations |
| --- | --- | --- |
| `CollectionDefinitionFactory` | Owns complete collection validation, icon revalidation, isolation, duplicate detection, and deep freezing. | Composes both collection normalisers and `IconDefinitionFactory`. |
| `CollectionIdentityNormaliser` | Validates optional namespace and required canonical collection name. | Uses the shared canonical slug authority. |
| `CollectionMetadataNormaliser` | Validates descriptive metadata, unique tags, and licensing relationships. | Produces frozen `CollectionMetadata`. |

Canonical deeply frozen icons are retained by object identity only when their complete graph has
canonical data-property semantics and contains no cycles or repeated aliases. Every other valid
icon input is isolated through Core before the collection retains it. This permits the same
canonical icon to belong to multiple collections without cloning or shared mutable state.

Duplicate logical icon identity within one collection is rejected. Core does not require
collection identities to be globally unique because it owns no registry.

## Membership

```text
IconDefinition <------ CollectionDefinition.icons
       ^
       |
       +--------------- another CollectionDefinition.icons
```

Membership does not alter geometry, presentation, licence, attribution, tags, directionality, or
rendering. A context that needs collection-specific decoration must define a separate explicit
entry contract rather than mutating the icon.
