# Canonical Glyphs

Status: **Accepted**

The `glyphs` feature owns one canonical editable TypeScript module and one named immutable value
per independent icon. Each module constructs its definition through public Core and has no
collection-owned state.

## Direct imports

```ts
import { ArrowLeftOutline } from "@luscious-garden/aster-icons/arrow-left/outline";
import { SearchOutline } from "@luscious-garden/aster-icons/search/outline";
```

A direct import evaluates its minimal generated facade, the selected definition and applicable
shared authoring authorities, not sibling icons or a collection. The physical
`src/glyphs/` layout remains private; [Catalogue Source Tooling](../../../tooling/catalogue/index.md#source-convention)
owns filename, symbol and public-path validation.

Every definition declares `identity.variant` explicitly.
Renditions of one glyph share its namespace and name. For example, an authored
`camera@stippled` rendition under namespace `aster` would export `CameraStippled` through
`@luscious-garden/aster-icons/camera/stippled`. A different concept such as `camera-retro`
remains a separate name. Stippled is a naming example, not currently distributed artwork.

## Glyph dictionaries

```ts
import { CameraVariants } from "@luscious-garden/aster-icons/camera";

const definition = CameraVariants.outline;
```

The glyph subpath exports only its `<PascalName>Variants` dictionary, not individual definitions.
It eagerly evaluates every distributed treatment of that glyph and references the same canonical
objects as individual imports, collection selections and loaders. Prefer `/camera/outline` when
only that treatment is required; tree shaking is not a native ESM evaluation guarantee.

Dictionaries are frozen, prototype-free own-data maps with exact readonly treatment keys.
`CameraVariants` contains `outline`, `filled`, `dotted` and `beaded`. A dictionary is not an
`IconDefinition` and cannot be rendered directly. There is no
`default`, fallback, compatibility export or implicit selection. An absent runtime key returns
`undefined`, including inherited Object names unless an actual treatment owns that property.
Use static operations such as `Object.keys(dictionary)` rather than inherited methods.

Treatment slugs remain kebab-case in identities and paths; their dictionary properties use
[`Icon.variantPropertyName()`](../../core/api/index.md#usage), so `filled-dotted` would become
`filledDotted`. Native property enumeration applies, including numeric-index ordering. Tooling
rejects ambiguous properties, module bindings or glyph paths before writing any output; glyphs
from different namespaces cannot be merged behind one public name.

<a id="explicit-treatment-migration"></a>

## Identity and selection

Identities and loader keys name concrete treatments, such as `aster/camera@outline`.
Collections select those definitions explicitly; [Core identity](../../core/definition/index.md#identity-rules)
and [membership](../../core/collection/index.md#aliases-and-ordered-members) own the portable rules.
[Import source](../../import/source/index.md) owns acquired identities, while
[CLI catalogue](../../cli/catalogue/index.md) owns glyph and concrete-icon requests.
The [source and registry boundary](../../../index.md#source-and-published-versions) explains version
availability; [versioned release notes](../releases/index.md) own changes and migrations.

## Definition ownership

An icon retains its identity, coordinate system, ordered geometry and resolved metadata as defined
by [Core](../../core/index.md). Its module imports public Core and applicable
[authoring inputs](../authoring/index.md), never a sibling definition, collection, renderer,
manifest or Import.

Intrinsic search tags belong to the icon. Collection aliases and categories, provenance records,
review notes and computed metrics remain outside its portable definition. An icon can stand alone
or join multiple collections without gaining reverse membership or being decorated by them.

The current catalogue includes [Amellus](../../../collections/amellus/index.md) and independent
Camera Dotted/Beaded treatments. Amellus's [inventory](../../../collections/amellus/inventory.md)
owns the concept list, semantic order, search vocabulary and construction coverage; its
[visual contract](../../../collections/amellus/design-contract.md) owns collection-specific
acceptance. Package discovery does not itself grant membership.

## Camera treatments

All four treatments are original Aster artwork by BlueLuscious under the
[artwork terms](../index.md#rights-boundary). Outline is the geometric reference. Filled retains
its body and complementary lens bounds; Dotted and Beaded use the same 66 native-circle centres
curated against that reference, with uniform diameters of `1` and `1.5` respectively. Their static
coordinates preserve symmetry and balanced spacing without running a geometry solver on import.

Only Outline and Filled belong to Amellus. The point treatments carry no minimum-size promise;
review them at the intended display size, particularly where antialiasing weakens dots or bead
joins at small sizes. Larger previews do not establish small-size legibility.

Use `/camera/filled`, `/camera/dotted` or `/camera/beaded` for an isolated treatment, each with its
corresponding `CameraFilled`, `CameraDotted` or `CameraBeaded` export. The dictionary includes all
four regardless of collection membership.

The point treatments remain larger rendering workloads despite their simple native geometry.
[Measurement interpretation](../quality-baseline.md#interpretation) distinguishes representation
from execution cost; primitive count alone is not an optimisation claim.

## Discovery and source maintenance

[Manifest](../manifest/index.md) exposes searchable records without evaluating artwork.
[Dynamic Loaders](../dynamic/index.md) resolves selected canonical keys to the same objects as
direct imports. Neither is a package-wide eager definition aggregate.

The [authoring workflow](../workflow.md) covers changes and review.
[Catalogue Source Tooling](../../../tooling/catalogue/index.md) regenerates facades, manifests
and loaders from canonical modules. [Quality](../quality.md) owns isolation and distribution
evidence.
