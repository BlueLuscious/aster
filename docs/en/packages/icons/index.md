# @aster/icons

Status: **Experimental**

`@aster/icons` owns canonical portable TypeScript icon definitions and the independently defined
Experimental Aster collection. It exposes a convenience root, one isolated public subpath per
icon, and one explicit collection subpath.

## Responsibilities

The package:

- authors each icon as one immutable `Icon.define(...)` value;
- applies shared internal authoring defaults without embedding collection membership;
- exposes the [representative icon set](icons/index.md);
- exposes the independent [Aster collection](collections/index.md);
- preserves canonical namespace, icon, and RTL identity;
- retains effective artwork licence and attribution;
- supports tree-shakable per-icon imports without a catalogue registry.

The package does not render SVG, create framework components, access DOM or filesystem APIs,
import SVG sources, run Import, discover paths, or own repository tooling.

## Dependency Boundary

The only production dependency is public `@aster/core`.

```text
@aster/icons --> @aster/core
```

`@aster/svg`, `@aster/import`, Lilium, Lotus, Aster adapters, DOM libraries, and Node APIs are not
runtime dependencies. Repository-level workflow tests may compose independently installed
packages without changing this boundary.

## Public Exports

The root re-exports the complete pilot as a convenience:

```ts
import { ArrowLeft, Search } from "@aster/icons";
```

The canonical collection can be imported from the root or its explicit subpath:

```ts
import { AsterCollection } from "@aster/icons/collections/aster";
```

Per-icon subpaths are the authoritative minimal imports:

```ts
import { ArrowLeft } from "@aster/icons/arrow-left";
import { Search } from "@aster/icons/search";
```

No manifest, global registry, renderer, generated wrapper, implementation path, or undeclared
subpath is public. The package currently has no variants.

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

The package's authoring and SVG review relationship is defined by the
[Aster Collection Authoring Workflow](../../collections/aster/authoring-workflow.md).
