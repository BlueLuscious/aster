# @aster/icons

Status: **Experimental**

`@aster/icons` owns the canonical portable TypeScript definitions for the Experimental `aster`
collection. It exposes a convenience root and one isolated public subpath per icon.

## Responsibilities

The package:

- authors each icon as one immutable `Icon.define(...)` value;
- applies one shared [collection authority](collections/index.md);
- exposes the [representative icon set](icons/index.md);
- preserves canonical collection, icon, and RTL identity;
- retains effective artwork licence and attribution;
- supports tree-shakable per-icon imports without a catalogue registry.

The package does not render SVG, create framework components, access DOM or filesystem APIs,
import SVG sources, run Build, discover paths, or own repository tooling.

## Dependency Boundary

The only production dependency is public `@aster/core`.

```text
@aster/icons --> @aster/core
```

`@aster/svg`, `@aster/build`, Lilium, Lotus, Aster adapters, DOM libraries, and Node APIs are not
runtime dependencies. Repository-level workflow tests may compose independently installed
packages without changing this boundary.

## Public Exports

The root re-exports the complete pilot as a convenience:

```ts
import { ArrowLeft, Search } from "@aster/icons";
```

Per-icon subpaths are the authoritative minimal imports:

```ts
import { ArrowLeft } from "@aster/icons/arrow-left";
import { Search } from "@aster/icons/search";
```

No manifest, registry, renderer, generated wrapper, implementation path, or undeclared subpath is
public. The package currently has no variants.

## Execution Flow

Importing one icon:

1. loads its isolated definition module;
2. reads the internal immutable collection authority;
3. delegates construction to public `@aster/core`;
4. returns one deeply frozen portable definition.

It does not evaluate a sibling icon or the package root. Consumers explicitly pass the resulting
value to a renderer or adapter.

The package's authoring and SVG review relationship is defined by the
[Aster Collection Authoring Workflow](../../collections/aster/authoring-workflow.md).
