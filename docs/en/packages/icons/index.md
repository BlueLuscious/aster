# @aster/icons

Status: **Accepted**

`@aster/icons` owns canonical portable TypeScript icon definitions, independently defined
collections, a lightweight metadata-only manifest and exact asynchronous loaders. It exposes one
isolated short subpath per definition and deliberately provides no package-wide definition root.

## Responsibilities

The package:

- authors each icon as one immutable `Icon.define(...)` value;
- composes [original authorship and visual authoring authorities](authoring/index.md) without
  embedding collection membership;
- exposes the [representative icon set](icons/index.md) through isolated definition subpaths;
- exposes independent [canonical collections](collections/index.md) through isolated collection
  subpaths;
- exposes the [distribution manifest](manifest/index.md) without loading complete definitions;
- exposes [dynamic definition loaders](dynamic/index.md) without eager definition evaluation;
- preserves canonical namespace, icon, and RTL identity;
- retains effective artwork licence and attribution;
- supports tree-shakable per-icon imports without an ambient catalogue registry.

The package does not render SVG, create framework components, access DOM or filesystem APIs,
import SVG sources, run Import, discover paths, or own repository tooling.

The [initial release notes](releases.md) record this package's candidate public capability and
accepted limits. The [project publication procedure](../../project/publication.md) owns registry
checks and human approval.

## Rights Boundary

The [package licence notice](../../../../packages/icons/LICENSE) applies ISC to software code
and APIs. Original BlueLuscious-owned icon geometry, rendered forms and collection curation
marked `LicenseRef-Aster-Artwork-1.0` follow the separate
[Aster Artwork Licence](../../../../packages/icons/ARTWORK-LICENCE.md). Commercial use in an
application is permitted; sale of that artwork as a standalone asset is not. Other artwork keeps
its own declared terms. A canonical `*.icon.ts` file can contain both software implementation
and visual artwork, so the file extension alone does not determine its licence. The `licence`
field in definition metadata identifies the effective artwork terms, not the software licence.

## Authoring authority

Each `.icon.ts` module is the sole canonical editable source for its definition. SVG is a derived
render result, not a second source kept in synchronisation. Optional Import may translate reviewed
external material into an editable module, but that module becomes ordinary human-owned Icons
source and has no runtime or rebuild dependency on Import or the original input.

Icons and collections are independent. An icon remains valid without membership and can belong to
several collections; a collection owns only its explicit member sequence. Canonical collection
modules therefore aggregate existing icon values instead of generating, cloning or decorating
them.

The package build synchronises the metadata-only manifest, exact loader maps and stable public
definition facades from canonical modules before TypeScript compilation.
Authors never edit those generated files.
Repository tooling performs this source maintenance without entering the package's production
dependency graph or runtime.

## Dependency Boundary

The only production dependency is public `@aster/core`.

```text
@aster/icons --> @aster/core
```

`@aster/svg`, `@aster/import`, Lilium, Protea, Aster adapters, DOM libraries, and Node APIs are not
runtime dependencies. Repository-level workflow tests may compose independently installed
packages without changing this boundary.

## Public Exports

Each canonical collection is imported through its isolated subpath:

```ts
import { AmellusCollection } from "@aster/icons/collections/amellus";
```

Per-icon subpaths are the authoritative minimal imports and resolve through generated facades that
do not expose the canonical source layout:

```ts
import { ArrowLeft } from "@aster/icons/arrow-left";
import { Search } from "@aster/icons/search";
```

A rendition keeps the same logical icon name, adds a lowercase kebab-case variant identity and
concatenates both PascalCase parts in its export symbol. For example, a future `stippled`
rendition of `camera` would use identity `aster/camera@stippled`, public subpath
`@aster/icons/camera/stippled` and symbol `CameraStippled`. A visually different concept such as a
retro camera remains a separate base identity rather than using a style variant to change its
meaning.

Search and catalogue inspection use the isolated metadata-only manifest:

```ts
import {
  AsterCollectionManifest,
  AsterIconManifest,
} from "@aster/icons/manifest";
```

This subpath exposes immutable identities, symbols, discovery metadata and collection member keys.
It does not contain or evaluate geometry, presentation policy or complete definitions. Its exact
contracts and generation boundary are defined by the [Icons Distribution Manifest](manifest/index.md).

Identities selected at runtime resolve through generated loader maps:

```ts
import { AsterIconLoaders } from "@aster/icons/dynamic";

const camera = await AsterIconLoaders["aster/camera"]?.();
```

Unknown keys return `undefined`. Invoked loader failures remain native dynamic-import rejections;
Icons adds no lookup exception or diagnostic adaptation.

No mutable registry, renderer, generated implementation path, physical source path or undeclared
subpath is public. The package root and bare collection-family subpath are intentionally not
exported. The package currently has no variants, but the export surface accepts
`@aster/icons/<name>/<variant>` once a canonical rendition exists.

## Distribution Costs

Acquisition, runtime evaluation and bundle inclusion are separate concerns:

| Concern | Current guarantee |
| --- | --- |
| npm acquisition | Installing `@aster/icons` acquires the complete published package, including every canonical definition. |
| Runtime evaluation | A direct icon import evaluates only its facade, definition and shared authorities. A manifest or loader-map import evaluates no complete definition. |
| Bundle inclusion | Stable definition subpaths and dynamic loader boundaries permit consumers and capable bundlers to retain isolated modules or chunks; final inclusion remains bundler- and application-dependent. |

Normal application code should import a known definition directly. Metadata-only catalogue
discovery and runtime-selected resolution are advanced integration concerns and should use
`@aster/icons/manifest` and `@aster/icons/dynamic` respectively. Neither integration reduces the
package downloaded by npm. Selective acquisition requires a future registry and explicit CLI
materialisation workflow rather than a different import spelling.

## Execution Flow

Importing one icon:

1. loads its minimal generated facade and isolated definition module;
2. composes applicable immutable authorship and visual-profile inputs;
3. delegates construction to public `@aster/core`;
4. returns one deeply frozen portable definition.

It does not evaluate a sibling icon. Consumers explicitly pass the resulting
value to a renderer or adapter.

Importing an isolated collection evaluates its module and declared members. The collection retains
the same canonical icon objects and does not reconstruct or modify them.

Complete discovery requires the manifest. Complete definition loading requires deliberate
iteration over the loader maps; no supported import evaluates either complete family by default.

Importing `@aster/icons/manifest` evaluates only its public entrypoint and generated data module.
Consumers that need a definition import its stable icon or collection subpath separately.

Importing `@aster/icons/dynamic` evaluates only its public entrypoint and generated loader map.
Invoking a loader evaluates its exact facade and required definition graph.

The package's authoring and SVG review relationship is defined by the
[Icons Authoring Workflow](workflow.md).
Generated integration ownership and the exact package build loop are defined by
[Catalogue Source Tooling](../../tooling/catalogue/index.md).
Current package, catalogue and distribution evidence is defined by [Icons Quality](quality.md).
Fresh-process import evaluation and emitted-size evidence is defined by the
[Icons Quality Baseline](quality-baseline.md).
