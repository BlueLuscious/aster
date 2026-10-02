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
| `CollectionIconMap` | Constrains collection-local string aliases to portable icon definitions. | Supplies the generic constraint for authored and complete collections. |
| `CollectionDefinitionInput<TIconMap>` | Carries identity, the authored alias dictionary, and metadata. | Composes `CollectionIdentity`, `CollectionMetadata`, and a concrete map extending `CollectionIconMap`. |
| `CollectionDefinition<TIconMap>` | Carries the immutable alias dictionary and its derived ordered `members` list. | Extends `CollectionDefinitionInput<TIconMap>`, makes its concrete aliases readonly, and adds `readonly IconDefinition[]`. |

An empty `icons` dictionary is valid and produces an empty `members` list. A release or catalogue
policy may require a populated collection without weakening the portable domain contract.

`TIconMap` preserves the concrete keys supplied to `Collection.define()`. A collection defined with
`icons: { camera: Camera }` exposes `collection.icons.camera` with autocompletion and rejects an
unknown alias at compile time. Annotating the result with the broad default `CollectionDefinition`
deliberately discards that concrete key information. The generic introduces no runtime state.

## Aliases and ordered members

`icons` is the sole authored membership authority. Each key is a collection-local lower camel-case
alias matching `^[a-z][A-Za-z0-9]*$`; examples include `camera`, `arrowLeft`, and `cameraStippled`.
An alias may refer to a separate glyph, a rendition, or a namespaced icon, but never changes that
icon's canonical identity. Two collections may choose different aliases for the same icon.

Core preserves the dictionary's own property order when deriving `members`. Aliases cannot be
integer-index keys, so JavaScript's numeric-key enumeration cannot reorder them. Renaming or
removing a published alias changes public property access; changing dictionary order changes
ordered iteration. Both require compatibility review.

The dictionary and list are frozen once at construction and contain the same accepted canonical
icon references. Reading `members` performs no conversion or allocation. Consumers use
`collection.icons.camera` for a known alias and `collection.members` for iteration, counting, or
ordinary array queries. Definitions remain plain data without lookup or mutation methods.

Authored dictionaries may have an ordinary or null prototype. Core accepts only own enumerable
string-keyed data properties and rejects symbols, hidden fields, getters, setters, custom
prototypes, and invalid aliases. Valid own aliases such as `constructor` and `toString` may shadow
inherited properties; dynamic dictionary consumers must check `Object.hasOwn()` before treating a
property as authored membership. Accessor descriptors are rejected without invoking their getters;
proxy execution remains outside the [Core trust boundary](../workflow.md#security-and-trust-boundary).

## Runtime

| Class | Responsibility | Relations |
| --- | --- | --- |
| `CollectionDefinitionFactory` | Validates the collection root and composes membership, identity, and metadata into one frozen result. | Delegates keyed and ordered membership to `CollectionMembershipNormaliser`. |
| `CollectionMembershipNormaliser` | Validates aliases, reconstructs or retains icons, rejects duplicate identities, derives frozen views, and verifies any submitted `members`. | Composes `IconValueValidator`, `IconDefinitionFactory`, and `CanonicalIconMatcher`. |
| `CanonicalIconMatcher` | Compares a frozen authored graph with its isolated canonical reconstruction before identity retention. | Used only after successful icon reconstruction. |
| `CollectionIdentityNormaliser` | Validates optional namespace and required canonical collection name. | Uses the shared canonical slug authority. |
| `CollectionMetadataNormaliser` | Validates descriptive metadata, unique tags, and licensing relationships. | Produces frozen `CollectionMetadata`. |

Canonical deeply frozen icons are retained by object identity only when their complete graph has
canonical data-property semantics, canonical key order and values, matching prototypes, and no
cycles or repeated aliases. Every other valid icon input uses the isolated canonical
reconstruction. This permits the same canonical icon to belong to multiple collections without
cloning or shared mutable state.

Duplicate logical icon identity within one collection is rejected. Core does not require
collection identities to be globally unique because it owns no registry.

`collectionIconAliasPatternSource` is the internal immutable grammar authority used by membership
validation. The internal type `TCollectionMembershipResult<TIconMap>` is
`Pick<CollectionDefinition<TIconMap>, "icons" | "members">`, so the normaliser returns both views
without redeclaring their public fields. Neither symbol is exported from the package root.

Authored input supplies `identity`, `icons`, and `metadata`; it never needs to supply `members`.
A complete definition may also cross `Collection.define()` for revalidation. Core validates any
submitted `members` as a dense data array and checks its canonical icon values and order against
the dictionary-derived sequence. An inconsistent sequence fails with `IconDefinitionError`.
The result always retains the newly derived list, never the submitted array.

## Membership

```text
IconDefinition <------ CollectionDefinition.icons.<alias>
       ^
       |
       +--------------- CollectionDefinition.members[index]
       |
       +--------------- another CollectionDefinition.icons.<alias>
```

Membership does not alter geometry, presentation, licence, attribution, tags, directionality, or
rendering. A context that needs collection-specific decoration must define a separate explicit
entry contract rather than mutating the icon.
