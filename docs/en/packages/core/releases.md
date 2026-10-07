# Core Release Notes

## 0.1.0

Status: **Prepared in source; not yet published**.

The first stable Core package retains the public API and behaviour accepted in `0.1.0-rc.2`.
There is no new runtime capability or migration from that candidate. Core has no runtime
dependencies. Consumers coming directly from `0.1.0-rc.1` must apply the collection migration
described below. Registry links, archive hashes and the publication date will be recorded after
the exact stable archive is approved and published.

## 0.1.0-rc.2

Status: **Published on 6 October 2026** under the npm `next` tag.

Registry: [`@luscious-garden/aster-core@0.1.0-rc.2`](https://www.npmjs.com/package/@luscious-garden/aster-core/v/0.1.0-rc.2)

Approved archive SHA-256: `c79b9d5b592980500344057c310c43a67acda30787f5e19c96c5a831a344052e`.

**Breaking change:** Collection authoring replaces the `icons` array with a typed alias dictionary.
`CollectionDefinitionInput<TIconMap>` describes authored fields;
`CollectionDefinition<TIconMap>` adds the frozen ordered `members` list derived once from that
dictionary. The input constraint is `CollectionIconMap`. Known aliases retain exact readonly
TypeScript keys. The earlier `0.1.0-rc.1` tarball uses the previous representation.

Migrate `icons: [Camera, Search]` to `icons: { camera: Camera, search: Search }`. Use
`collection.icons.camera` for known property access and replace array traversal, counting, or
indexing on `collection.icons` with `collection.members`. Preserve the former array order in the
dictionary's property order. Do not author a separate `members` list.

Complete definitions may be revalidated, but any submitted member view must match the dictionary's
canonical values and order. Icon identity, geometry, metadata, and construction semantics remain
unchanged. Icons, SVG and CLI `0.1.0-rc.2` were published with Core `^0.1.0-rc.2` dependencies
under the [project compatibility policy](../../project/versioning.md).
The [Collection contract](collection/index.md) and [Workflow](workflow.md) describe the current
implementation.

## 0.1.0-rc.1

Status: **Published on 22 September 2026**. This is the formal release candidate for the first
public `0.1.0`, not a previously supported release. No consumer migration is required.

Registry: [`@luscious-garden/aster-core@0.1.0-rc.1`](https://www.npmjs.com/package/@luscious-garden/aster-core/v/0.1.0-rc.1)

Approved archive SHA-256: `FA4C247160BB9556ABE2F78EFD7DFAED2FBE33B72471A1710FA0608144DDB59B`.

**Compatible capability:** `@luscious-garden/aster-core` provides the dependency-free ES2022 ESM root with
`Icon.define()`, `Collection.define()`, portable contracts and types, immutable runtime
vocabularies, and `IconDefinitionError`. Definitions are validated, isolated and frozen at
construction. The approved import is `@luscious-garden/aster-core`; implementation subpaths are not public.

**Accepted limits:** Core does not render, parse source files, own a catalogue, or mutate
definitions after construction. Cross-definition uniqueness and collection-wide licence
completion belong to their respective aggregate boundaries. There is no CommonJS or legacy
build. See [Core](index.md), [Workflow](workflow.md), and [Quality](quality.md) for the contract
and evidence.

There are no prior public corrections or breaking changes to classify. Future releases follow
the [project compatibility policy](../../project/versioning.md).
