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
| `CollectionIconMap` | Maps collection-local string aliases to explicit treatment selections. | Uses the portable `IconVariantMap` contract and constrains authored and complete collections. |
| `CollectionDefinitionInput<TIconMap>` | Carries identity, the authored alias dictionary, and metadata. | Composes `CollectionIdentity`, `CollectionMetadata`, and a concrete map extending `CollectionIconMap`. |
| `CollectionDefinition<TIconMap>` | Carries the immutable grouped dictionary and its derived flat `members` list. | Preserves outer and inner keys while mapping each leaf to canonical `IconDefinition`; adds `readonly IconDefinition[]`. |

An empty `icons` dictionary is valid and produces an empty `members` list. A release or catalogue
policy may require a populated collection without weakening the portable domain contract.
An empty treatment group is invalid. There is one grouped mode, no flat compatibility mode,
implicit default, group renderer or second list of definitions.

`TIconMap` preserves the concrete keys supplied to `Collection.define()`. A collection defined with
`icons: { camera: { outline: CameraOutline } }` exposes `collection.icons.camera.outline` with
autocompletion and rejects unknown aliases and treatments at compile time.
Annotating the result with the broad default `CollectionDefinition`
deliberately discards that concrete key information. The generic introduces no runtime state.

The output maps those keys to the readonly `IconDefinition` contract, preserving any optional
aliases and treatments without retaining authored value subtypes. Mutable authoring does not make canonical
members mutable in TypeScript. Narrow authored literals are not output guarantees: for example,
Core may trim an authored display name while reconstructing its canonical metadata. The output
inherits identity and metadata through `Omit<CollectionDefinitionInput<TIconMap>, "icons">`, then
declares its canonical map independently from the input's member types.

## Aliases and ordered members

`icons` is the sole authored membership authority. Each key is a collection-local lower camel-case
alias matching `^[a-z][A-Za-z0-9]*$`; examples include `camera`, `arrowLeft`, and `cameraStippled`.
Each value is a non-empty dictionary selecting explicit treatments of one glyph. All selected
leaves in a group share exactly the same `(namespace, name)`, including namespace absence.
Different aliases may select disjoint treatments of the same glyph, but duplicate concrete
identities anywhere in a collection are rejected. Aliases never change canonical identities.

Each inner key must equal [`Icon.variantPropertyName()`](../api/index.md#usage) for its leaf's
required treatment slug. The transformation is shared with static catalogue inspection.
Selections are explicit subsets: adding another standalone treatment never changes a collection.

Core derives `members` by visiting own outer keys, then each group's own treatment keys, in
native JavaScript enumeration order. Outer aliases cannot be integer-index keys; treatment
properties can. Thus authored `"10"` before `"2"` still enumerates as `"2"`, `"10"`, while
`"01"` remains an ordinary string key. Static generation mirrors this order. Renaming or
removing a published alias changes public property access; changing dictionary order changes
ordered iteration. Both require compatibility review.

Both dictionary levels and the list are frozen once and contain the same accepted canonical
leaf references. Reading `members` performs no conversion or allocation. Consumers use
`collection.icons.camera.outline` for a selected definition and `collection.members` for iteration, counting, or
ordinary array queries. Definitions remain plain data without lookup or mutation methods.

Authored dictionaries at either level may have an ordinary or null prototype. Core accepts only own enumerable
string-keyed data properties and rejects symbols, hidden fields, getters, setters, custom
prototypes, and invalid aliases. Canonical dictionaries at both levels have null prototypes:
absent inherited names remain absent, and valid own `constructor` and `toString` keys remain usable.
Accessor descriptors are rejected without invoking their getters;
proxy execution remains outside the [Core trust boundary](../workflow.md#security-and-trust-boundary).
Accepted aliases are written as own data properties, so inherited setters cannot alter the
canonical dictionary during construction.

## Runtime

| Class | Responsibility | Relations |
| --- | --- | --- |
| `CollectionDefinitionFactory` | Validates the collection root and composes membership, identity, and metadata into one frozen result. | Delegates keyed and ordered membership to `CollectionMembershipNormaliser`. |
| `CollectionMembershipNormaliser` | Validates aliases, non-empty groups, family and property agreement, rejects duplicate identities, derives frozen views and verifies submitted `members`. | Composes `IconValueValidator`, `IconIdentityNormaliser`, `IconDefinitionFactory`, and `CanonicalIconMatcher`. |
| `CanonicalIconMatcher` | Proves canonical graph equivalence when accepted leaf references differ. | Used after Core acceptance; never replaces unknown-input validation. |
| `CollectionIdentityNormaliser` | Validates optional namespace and required canonical collection name. | Uses the shared canonical slug authority. |
| `CollectionMetadataNormaliser` | Validates descriptive metadata, unique tags, and licensing relationships. | Produces frozen `CollectionMetadata`, delegating the shared tag rule to [metadata](../metadata/index.md#runtime). |

Icon outputs [recognised by Core](../definition/runtime/index.md#recognised-outputs) are retained directly.
Unknown icons are fully reconstructed first. They retain their authored reference only when their
complete graph has canonical data-property semantics, canonical key order and values, matching
prototypes, and no cycles or repeated aliases. Every other valid icon input uses the isolated canonical
reconstruction. This permits the same canonical icon to belong to multiple collections without
cloning or shared mutable state.

Retaining a compatible unknown frozen icon does not register its original reference as a locally
constructed output. Complete-definition revalidation still checks the member sequence; identical
accepted references need no graph comparison, while different references require equivalence.

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

Construct and retain a collection once for repeated use. Passing a complete collection back to
`Collection.define()` revalidates its containers; recognising canonical leaves is not a collection
cache. [Construction measurements](../quality-baseline.md#grouped-collection-construction) distinguish
that work from ordinary member access or rendering.

## Membership

```text
IconDefinition <------ CollectionDefinition.icons.<alias>.<variantPropertyName>
       ^
       |
       +--------------- CollectionDefinition.members[index]
       |
       +--------------- another CollectionDefinition.icons.<alias>.<variantPropertyName>
```

Membership does not alter geometry, presentation, licence, attribution, tags, directionality, or
rendering. A context that needs collection-specific decoration must define a separate explicit
entry contract rather than mutating the icon.
