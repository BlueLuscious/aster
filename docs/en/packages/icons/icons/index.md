# Canonical Icon Definitions

Status: **Accepted**

The `icons` feature contains one canonical TypeScript module and one named immutable value per
authored icon. The metadata manifest and exact loader map provide complete discovery without a
package-wide definition aggregate. The current corpus contains all twenty-six definitions accepted for foundational Amellus
membership. Seventeen definitions remain primitive-first. Nine use structured absolute path
commands, combined with clearer primitives where appropriate, and contain no raw SVG path text.

Canonical source modules use `<icon-slug>.icon.ts`. The semantic role remains internal to the
source layout: public imports omit it and retain `@aster/icons/<icon-slug>`.

## Authored corpus

| Symbol | Identity | Primary contract coverage |
| --- | --- | --- |
| `ArrowDown` | `aster/arrow-down` | Vertical direction, diagonals, open terminals, and preserved RTL orientation. |
| `ArrowLeft` | `aster/arrow-left` | Directionality, diagonals, open terminals, and RTL mirroring. |
| `ArrowRight` | `aster/arrow-right` | Opposing logical direction, diagonals, open terminals, and RTL mirroring. |
| `ArrowUp` | `aster/arrow-up` | Opposing vertical direction, diagonals, open terminals, and preserved RTL orientation. |
| `Bell` | `aster/bell` | Curved enclosure, detached baseline, symmetry, and minimum-size spacing. |
| `Camera` | `aster/camera` | Rounded structured enclosure, circular lens, and mixed geometry. |
| `Check` | `aster/check` | Unequal diagonals and open-terminal rhythm. |
| `Close` | `aster/close` | Diagonal symmetry and crossing strokes. |
| `Cloud` | `aster/cloud` | Connected elliptical arcs, organic balance, and closed contour continuity. |
| `Download` | `aster/download` | Vertical movement, open terminals, and receiving baseline. |
| `Folder` | `aster/folder` | Asymmetric tab, rounded enclosure, and grouped-container metaphor. |
| `Heart` | `aster/heart` | Symmetric cubic curves, organic tension, and pointed lower convergence. |
| `Home` | `aster/home` | Primitive roof, structured enclosure, centred entrance, and negative space. |
| `Info` | `aster/info` | Circular enclosure, minimum-size spacing, and detached detail. |
| `Leaf` | `aster/leaf` | Organic cubic contour, internal vein, and deliberate asymmetry. |
| `Lock` | `aster/lock` | Rounded rectangular body, curved shackle, and enclosed negative space. |
| `Mail` | `aster/mail` | Rounded enclosure, diagonal rhythm, and message metaphor. |
| `Menu` | `aster/menu` | Parallel rhythm, equal stroke extent, and open terminals. |
| `Pause` | `aster/pause` | Parallel vertical symmetry and media distinction. |
| `Play` | `aster/play` | Closed directional geometry and media distinction. |
| `Plus` | `aster/plus` | Primary axes and equal stroke extent. |
| `Search` | `aster/search` | Circle-line transition and diagonal handle. |
| `Settings` | `aster/settings` | Highest primitive count and radial detail budget. |
| `Star` | `aster/star` | Repeated points, polygon rhythm, and near-safe-area extents. |
| `User` | `aster/user` | Circular head, curved shoulders, symmetry, and minimum-size recognition. |
| `Warning` | `aster/warning` | Triangular enclosure, vertical detail, and minimum-size spacing. |

Every current icon:

- composes internal `asterOriginalIconAuthorship` and `amellusIconAuthoringProfile` authorities;
- contains no node-specific paint or stroke exceptions;
- uses geometry values on the provisional half-unit grid;
- resolves ISC licence and BlueLuscious attribution;
- is deeply frozen by Core;
- remains below the provisional primitive and structured-command budgets;
- exports through `@aster/icons/<icon-slug>`.

Catalogue source synchronisation generates one manifest record, exact loader and public facade for
each nested canonical `*.icon.ts` module. Complete-package consumers must deliberately iterate the
loader map; metadata-only consumers use the manifest without evaluating definitions.

Only `ArrowLeft` and `ArrowRight` use the `mirror` RTL policy. The remaining identities preserve
geometry in RTL because their metaphors do not represent logical horizontal movement.

`AmellusCollection` explicitly retains all twenty-six definitions. Presence in the icon manifest
provides package discovery only and never implies Amellus membership or membership in a future
collection. Core and package tests prove that the same immutable definition may be retained by
multiple independently constructed collections without acquiring mutable reverse links.

## Metadata Scope

The corpus retains display name, RTL policy, presentation policy, licence, attribution,
deprecation state, replacement relationship semantics, and intrinsic search tags supported by
Core.

Aliases, collection-specific categories, review notes, computed metrics, and provider search terms
are not embedded. They require an opt-in catalogue consumer and must not become dependencies of an
isolated icon module.

## Isolation

An icon module imports only public `@aster/core` authority and its applicable internal authoring
authorities. It does not import a collection, another icon, the root index, a manifest, a renderer,
or Import. The [authoring boundary](../authoring/index.md) allows another visual family or artwork
owner to supply different inputs without changing Amellus or original Aster authorship.

Package ABI tests verify that direct imports and exact loaders preserve the same object identity,
aggregate roots and internal subpaths are rejected, and emitted ESM and declarations remain host
independent.

Generated facades, manifests and loader maps are versioned, deterministically reconstructable
outputs. Their ownership and drift checks are documented by
[Catalogue Source Tooling](../../../tooling/catalogue/index.md).
