# Icons Dynamic Definition Loaders

Status: **Accepted**

`@luscious-garden/aster-icons/dynamic` exposes immutable asynchronous loader maps for identities known only at
runtime. It complements metadata-only discovery through `@luscious-garden/aster-icons/manifest`; it does not own
search, selection, error diagnostics or a mutable registry.

## Public values

```ts
import {
  AsterCollectionLoaders,
  AsterIconLoaders,
} from "@luscious-garden/aster-icons/dynamic";

const camera = await AsterIconLoaders["aster/camera"]?.();
const amellus = await AsterCollectionLoaders.amellus?.();
```

Icon keys use `[<namespace>/]<name>[@<variant>]`. Collection keys use
`[<namespace>/]<name>`. These are the same canonical keys published by the distribution manifest.
An unknown property resolves to `undefined`; Icons deliberately provides no throwing resolver or
fallback policy.

The maps and every retained loader function are frozen. Invoking a loader returns the exact
canonical immutable definition exported by its ordinary public subpath. Loader failures preserve
the native dynamic-import rejection so the consuming CLI, host or application can apply its own
diagnostic policy.

## Contracts

`IconDefinitionLoader` and `CollectionDefinitionLoader` describe zero-argument asynchronous
functions resolving public Core definitions. `IconDefinitionLoaderMap` and
`CollectionDefinitionLoaderMap` describe read-only string-indexed lookup where absence is explicit
as `undefined`. All four interfaces are public only through `@luscious-garden/aster-icons/dynamic`.

The loader maps do not accept configuration and do not cache additional state. JavaScript module
loading supplies its ordinary per-process module cache after a loader resolves successfully.

## Generation

Catalogue source tooling generates one loader for every accepted icon, rendition and collection.
Keys use the same shared canonical serialiser as the manifest. Targets use generated public
definition facades rather than physical `src/glyphs` or `src/collections` paths, keeping runtime
resolution independent from private source organisation.

The generated module contains only dynamic `import()` expressions and type-only contract imports.
Importing `@luscious-garden/aster-icons/dynamic` therefore evaluates the public entrypoint and generated map but no
definition. Invoking one icon loader evaluates its facade, definition and directly shared
authoring authorities. Invoking one collection loader evaluates its facade, collection and
explicitly retained members.

Additions, removals, namespace changes and renditions update manifests and loader maps in the same
deterministic synchronisation. Their key sets must remain exact; neither generated surface may
retain an identity absent from the other.

## Distribution boundary

Dynamic loading controls runtime evaluation and permits bundlers to retain independent chunks. It
does not provide selective npm acquisition: installing `@luscious-garden/aster-icons` still acquires every file in
the package. Selective remote acquisition remains a separate registry and CLI concern.

Runtime tests invoke every generated loader and compare object identity with canonical exports.
Tooling tests cover base icons, renditions, collections, additions, removals and key changes. ABI,
clean-consumer and fresh-process evidence protect exact exports, native rejection behaviour and
the no-eager-definition boundary.

Metadata discovery is documented by the [Icons Distribution Manifest](../manifest/index.md).
Generation ownership is documented by [Catalogue Source Tooling](../../../tooling/catalogue/index.md).
