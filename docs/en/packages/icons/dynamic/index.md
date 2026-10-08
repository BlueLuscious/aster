# Icons Dynamic Definition Loaders

Status: **Accepted**

`@luscious-garden/aster-icons/dynamic` exposes frozen asynchronous loader maps for runtime-selected
identities. It complements [metadata discovery](../manifest/index.md), without owning search,
fallback, diagnostic adaptation or a registry.

## Public values

```ts
import {
  AsterCollectionLoaders,
  AsterIconLoaders,
} from "@luscious-garden/aster-icons/dynamic";

const camera = await AsterIconLoaders["aster/camera"]?.();
const amellus = await AsterCollectionLoaders.amellus?.();
```

Icon keys use `[<namespace>/]<name>[@<variant>]`; collection keys use
`[<namespace>/]<name>`. Own keys match their manifest family exactly.

## Contracts

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `IconDefinitionLoader` | Zero-argument function returning `Promise<IconDefinition>`. | Resolves the canonical object from one direct icon subpath. |
| `CollectionDefinitionLoader` | Zero-argument function returning `Promise<CollectionDefinition>`. | Resolves one collection and its declared member graph. |
| `IconDefinitionLoaderMap` | Readonly string-indexed icon entry model with explicit `undefined` absence. | Describes `AsterIconLoaders` using `IconDefinitionLoader`. |
| `CollectionDefinitionLoaderMap` | Readonly string-indexed collection entry model with explicit `undefined` absence. | Describes `AsterCollectionLoaders` using `CollectionDefinitionLoader`. |

All four interfaces are public only through the dynamic subpath. Maps and retained loader
functions are frozen. A successful invocation returns the same immutable object as its direct
import; module loading provides its ordinary cache, not additional Icons-owned state.
Import failures preserve their native rejection for the consumer to classify.

## Arbitrary key access

The current generated maps are ordinary-prototype objects. An arbitrary property access can
therefore find inherited properties such as `constructor`, which are not loader entries.
For a string supplied at runtime, check own membership before invoking it:

```ts
const key: string = "aster/camera";
const loader = Object.hasOwn(AsterIconLoaders, key)
  ? AsterIconLoaders[key]
  : undefined;
const definition = await loader?.();
```

An absent own entry produces no selection. Optional chaining alone does not exclude inherited
properties. This is a current runtime limitation; inherited names are not supported fallback
loaders.

## Deferred evaluation

Importing the dynamic subpath evaluates its entrypoint and generated map, not complete
definitions. Invoking one icon loader evaluates its facade, definition and shared authorities;
invoking a collection loader evaluates that collection's complete declared member graph.

[Catalogue Source Tooling](../../../tooling/catalogue/index.md) generates facade targets and
canonical keys together with the manifest. It owns additions, removals and consistency checks;
physical source paths remain private.

Dynamic imports can support separate bundler chunks, but do not change npm acquisition.
[Distribution Costs](../index.md#distribution-costs) owns that distinction.
[Quality](../quality.md) owns conformance, including native import failures;
[Quality Baseline](../quality-baseline.md) owns measured evaluation sets.
