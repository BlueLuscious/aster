# Canonical Icon Definitions

Status: **Experimental**

The `icons` feature contains one canonical TypeScript module and one named immutable value per
pilot icon. `AsterIcons` is the complete immutable package index over those independent values.

Canonical source modules use `<icon-slug>.icon.ts`. The semantic role remains internal to the
source layout: public imports omit it and retain `@aster/icons/<icon-slug>`.

## Representative Set

| Symbol | Identity | Primary contract coverage |
| --- | --- | --- |
| `ArrowLeft` | `aster/arrow-left` | Directionality, diagonals, open terminals, and RTL mirroring. |
| `Bell` | `aster/bell` | Curved enclosure, optical balance, and detached detail. |
| `Camera` | `aster/camera` | Nested circular detail and asymmetric structural contour. |
| `Check` | `aster/check` | Unequal diagonals and open-terminal rhythm. |
| `Close` | `aster/close` | Diagonal symmetry and crossing strokes. |
| `Cloud` | `aster/cloud` | Compound organic curves and silhouette recognition. |
| `Folder` | `aster/folder` | Asymmetric contour and familiar object metaphor. |
| `Heart` | `aster/heart` | Organic curves and optical symmetry. |
| `Home` | `aster/home` | Preferred angles, symmetry, doorway negative space, and mixed primitives. |
| `Leaf` | `aster/leaf` | Organic asymmetry and internal directional contour. |
| `Lock` | `aster/lock` | Nested negative space, curves, and rectangular structure. |
| `Plus` | `aster/plus` | Primary axes and equal stroke extent. |
| `Search` | `aster/search` | Circle-line transition and diagonal handle. |
| `Settings` | `aster/settings` | Highest primitive count and radial detail budget. |
| `Star` | `aster/star` | Repeated points, polygon rhythm, and near-safe-area extents. |
| `User` | `aster/user` | Nested curves and minimum-size separation. |

Every icon:

- uses the shared internal `asterIconAuthoring` viewBox and presentation policy;
- contains no node-specific paint or stroke exceptions;
- uses geometry values on the provisional half-unit grid;
- resolves ISC licence and BlueLuscious attribution;
- is deeply frozen by Core;
- remains below the provisional primitive budget;
- exports through `@aster/icons/<icon-slug>`.

`AsterIcons` retains the canonical definitions in identity order. Registration in this index makes
an icon available to complete-package consumers such as the built-in CLI catalogue without adding
collection membership. It is a package-owned sequence, not a mutable runtime registry or source
discovery service.

Only `ArrowLeft` uses the `mirror` RTL policy. The remaining pilot identities preserve geometry in
RTL because their metaphors are not directional.

## Metadata Scope

The pilot retains display name, RTL policy, presentation policy, licence, attribution,
deprecation state, replacement relationship semantics, and intrinsic search tags supported by
Core.

Aliases, collection-specific categories, review notes, computed metrics, and provider search terms
are not embedded. They require an opt-in catalogue consumer and must not become dependencies of an
isolated icon module.

## Isolation

An icon module imports only public `@aster/core` authority and the internal authoring constant. It
does not import a collection, another icon, the root index, a manifest, a renderer, or Import.

Package ABI tests verify that direct and root imports preserve the same object identity, internal
subpaths are rejected, and emitted ESM and declarations remain host independent.
