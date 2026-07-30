# Distribution and Adapters

Status: **Accepted**

This document defines definition exports, variant representation, generated named integrations,
tree-shaking requirements, and framework-target separation. Package registry names remain
provisional; dependency boundaries and import capabilities are authoritative.

## Distribution boundaries

Aster keeps these independently installable responsibilities:

| Boundary | Contents | Dependencies |
| --- | --- | --- |
| Portable Core | Contracts, immutable construction, portable options, and validation authority. | No collection, renderer, framework, DOM, Lotus, or Lilium dependency. |
| Collection definitions | One generated portable module per icon or variant plus optional manifests. | Portable Core only. |
| Generic target renderer | One target implementation such as SVG markup or Lilium component composition. | Portable Core and its explicit target APIs only. |
| Generated collection-target integration | Named wrappers for one collection and one target, with optional exact definition re-exports. | Corresponding collection definitions and generic target renderer. |
| DOM target mapping | DOM implementations required by a target-independent framework adapter. | Corresponding framework adapter and public DOM renderer APIs. |

Installing portable Core or one collection does not install every renderer or framework.
Installing a generic renderer does not install any collection.

## Variant representation

Every distributable variant is a separate portable definition with its own canonical identity,
generated symbol, module, and per-icon subpath.

A collection may declare a default variant for authoring or documentation, but distribution cannot
silently erase variant identity. Passing a different variant means passing a different immutable
definition; render options never change geometry variant.

Optional collection manifests may group related definitions for search or dynamic interfaces.
Those opt-in manifests do not become dependencies of per-icon modules.

## Export capabilities

Using `minimal` and `camera` as examples, a collection package provides:

```text
@aster/minimal
@aster/minimal/camera
@aster/minimal/camera/filled
@aster/minimal/manifest
```

The package root may expose documented convenience exports. Per-icon and per-variant subpaths are
the authoritative minimal imports. A manifest is an explicit opt-in registry and cannot enter
their transitive module graphs.

A generic target package exposes its generic API from its root, for example:

```text
@aster/svg
@aster/lilium
```

Generated named wrappers use a separate collection-target integration boundary, provisionally:

```text
@aster/minimal-svg
@aster/minimal-svg/camera
@aster/minimal-svg/camera/filled
@aster/minimal-lilium
@aster/minimal-lilium/camera
```

Exact registry names may change after pilot release evidence. The separation of definitions,
generic targets, and generated integrations cannot change silently.

Export maps list every public root and supported subpath and reject implementation paths.
Generated modules import public package subpaths rather than filesystem-relative implementation
files.

Generated collection manifests declare `@aster/core` as their only production dependency and map
each supported subpath independently to its ESM implementation and declaration. The canonical
package shape and ownership model are documented by
[Build Generator](../packages/build/generator/index.md).

## Definition re-exports

A generic renderer or framework adapter does not own a collection and therefore does not re-export
collection definitions.

A generated collection-target integration may re-export the exact portable definition associated
with each named wrapper. It must preserve object identity and cannot copy, decorate, or reconstruct
the definition.

This permits ergonomic imports from one optional integration package without creating a reverse
dependency from Core, a collection, or the generic adapter.

## Named wrapper generation

One generated named wrapper:

- imports exactly one portable definition through its public per-icon subpath;
- imports the corresponding generic target API;
- closes over the definition;
- forwards accepted options unchanged;
- delegates rendering, accessibility, direction, and failures;
- contains no copied geometry or hand-maintained target logic.

For the SVG target:

```ts
CameraIcon.render(options);
```

is semantically equivalent to:

```ts
Icon.render(Camera, options);
```

Framework integrations use their native component invocation while preserving the same delegation
invariant.

## Tree-shaking and module isolation

Public runtime modules are side-effect free. A package may declare `sideEffects: false` only after
built-package evidence proves that claim.

Importing one per-icon definition must not:

- evaluate another icon module;
- load a collection manifest or global registry;
- load a renderer, framework, DOM, build, or filesystem module.

Importing one named integration must evaluate only its wrapper, corresponding definition, generic
target runtime, and their shared portable dependencies. It cannot evaluate other icon wrappers or
an opt-in manifest.

Conformance includes:

- built ESM import tests for roots and supported subpaths;
- rejected tests for internal subpaths;
- module-evaluation evidence for isolated per-icon imports;
- bundle evidence that one root named import removes unrelated definitions;
- generic and named result equivalence;
- clean-install tests proving optional targets are not required by portable packages.

Bundle evidence uses an explicitly selected replaceable development tool. No bundler API becomes a
production dependency or public contract.

## Target-independent Lilium split

The target-independent Lilium adapter depends only on public Lilium Component, Template, Renderer,
and related contracts proven necessary by implementation. It:

- consumes portable Aster definitions and options;
- declares target-independent Lilium component and template composition;
- contains no DOM types, attributes, nodes, globals, or browser lifecycle;
- owns any Aster-specific primitive capability identities that have no canonical Lilium owner.

If DOM implementations are required, an optional DOM mapping depends on the target-independent
adapter and public Lilium DOM renderer contracts. It registers implementations for identities
owned by the adapter; the DOM renderer does not redeclare those external identities.

Exact primitive identities and package count are revalidated against stable Lilium APIs before
adapter implementation. That evidence may combine boundaries when no independent install or
dependency reason exists, but it cannot introduce DOM authority into the target-independent
package.

Lotus may consume public Aster definitions, generic adapters, or generated integrations through
its own icon ports and optional integration packages. Aster never imports Lotus or infers Lotus
component semantics.
