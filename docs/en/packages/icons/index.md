# @aster/icons

Status: **Experimental**

`@aster/icons` owns canonical portable TypeScript icon definitions, independently defined
collections, and explicit immutable indexes for complete package discovery. It exposes an
icon-only convenience root, one isolated short subpath per icon, and a separate collection family.

## Responsibilities

The package:

- authors each icon as one immutable `Icon.define(...)` value;
- applies [shared internal authoring defaults](shared/index.md) without embedding collection
  membership;
- exposes the [representative icon set](icons/index.md) and its `AsterIcons` index;
- exposes the independent [Aster collection](collections/index.md) and `AsterCollections` index;
- preserves canonical namespace, icon, and RTL identity;
- retains effective artwork licence and attribution;
- supports tree-shakable per-icon imports without an ambient catalogue registry.

The package does not render SVG, create framework components, access DOM or filesystem APIs,
import SVG sources, run Import, discover paths, or own repository tooling.

## Authoring authority

Each `.icon.ts` module is the sole canonical editable source for its definition. SVG is a derived
render result, not a second source kept in synchronisation. Optional Import may translate reviewed
external material into an editable module, but that module becomes ordinary human-owned Icons
source and has no runtime or rebuild dependency on Import or the original input.

Icons and collections are independent. An icon remains valid without membership and can belong to
several collections; a collection owns only its explicit member sequence. Canonical collection
modules therefore aggregate existing icon values instead of generating, cloning or decorating
them.

## Dependency Boundary

The only production dependency is public `@aster/core`.

```text
@aster/icons --> @aster/core
```

`@aster/svg`, `@aster/import`, Lilium, Lotus, Aster adapters, DOM libraries, and Node APIs are not
runtime dependencies. Repository-level workflow tests may compose independently installed
packages without changing this boundary.

## Public Exports

The root re-exports named icon definitions and the complete immutable icon index:

```ts
import {
  ArrowLeft,
  AsterIcons,
  Search,
} from "@aster/icons";
```

`AsterIcons` enumerates every canonical icon independently from membership. Collections do not
leak through the icon root; their complete family is explicit:

```ts
import {
  AsterCollection,
  AsterCollections,
} from "@aster/icons/collections";
```

`AsterCollections` enumerates every canonical collection independently from icon discovery. Adding
a source module does not cause runtime filesystem discovery: package authors explicitly register
each accepted definition in its corresponding index.

The canonical collection can also be imported through its isolated subpath:

```ts
import { AsterCollection } from "@aster/icons/collections/aster";
```

Per-icon subpaths are the authoritative minimal imports:

```ts
import { ArrowLeft } from "@aster/icons/arrow-left";
import { Search } from "@aster/icons/search";
```

No mutable registry, renderer, generated wrapper, implementation path, or undeclared subpath is
public. The package currently has no variants.

## Execution Flow

Importing one icon:

1. loads its isolated definition module;
2. reads immutable icon-authoring defaults;
3. delegates construction to public `@aster/core`;
4. returns one deeply frozen portable definition.

It does not evaluate a sibling icon or the package root. Consumers explicitly pass the resulting
value to a renderer or adapter.

Importing `AsterCollection` evaluates the collection module and its declared members. The
collection retains the same canonical icon objects and does not reconstruct or modify them.

Importing the package root evaluates `AsterIcons` but no collection module. Importing
`@aster/icons/collections` evaluates `AsterCollections`. Isolated definition subpaths remain
independent from their family index and sibling definitions.

The package's authoring and SVG review relationship is defined by the
[Aster Collection Authoring Workflow](../../collections/aster/authoring-workflow.md).
