# Canonical Icon Definitions

Status: **Experimental**

The `icons` feature contains one canonical TypeScript module and one named immutable value per
authored icon. `AsterIcons` is the complete immutable package index over those independent values.
The current corpus contains fifteen definitions accepted for foundational Amellus authorship and
two additional collection-independent vertical-arrow definitions. Seven foundational candidates
originate in the Experimental Aster pilot and eight close identified semantic gaps. Nine accepted
Amellus concepts await primitive-first reauthoring and are not currently package exports.

Canonical source modules use `<icon-slug>.icon.ts`. The semantic role remains internal to the
source layout: public imports omit it and retain `@aster/icons/<icon-slug>`.

## Authored corpus

| Symbol | Identity | Primary contract coverage |
| --- | --- | --- |
| `ArrowDown` | `aster/arrow-down` | Vertical direction, diagonals, open terminals, and preserved RTL orientation. |
| `ArrowLeft` | `aster/arrow-left` | Directionality, diagonals, open terminals, and RTL mirroring. |
| `ArrowRight` | `aster/arrow-right` | Opposing logical direction, diagonals, open terminals, and RTL mirroring. |
| `ArrowUp` | `aster/arrow-up` | Opposing vertical direction, diagonals, open terminals, and preserved RTL orientation. |
| `Check` | `aster/check` | Unequal diagonals and open-terminal rhythm. |
| `Close` | `aster/close` | Diagonal symmetry and crossing strokes. |
| `Download` | `aster/download` | Vertical movement, open terminals, and receiving baseline. |
| `Info` | `aster/info` | Circular enclosure, minimum-size spacing, and detached detail. |
| `Mail` | `aster/mail` | Rounded enclosure, diagonal rhythm, and message metaphor. |
| `Menu` | `aster/menu` | Parallel rhythm, equal stroke extent, and open terminals. |
| `Pause` | `aster/pause` | Parallel vertical symmetry and media distinction. |
| `Play` | `aster/play` | Closed directional geometry and media distinction. |
| `Plus` | `aster/plus` | Primary axes and equal stroke extent. |
| `Search` | `aster/search` | Circle-line transition and diagonal handle. |
| `Settings` | `aster/settings` | Highest primitive count and radial detail budget. |
| `Star` | `aster/star` | Repeated points, polygon rhythm, and near-safe-area extents. |
| `Warning` | `aster/warning` | Triangular enclosure, vertical detail, and minimum-size spacing. |

Every icon:

- uses the shared internal `asterIconAuthoring` viewBox and presentation policy;
- contains no node-specific paint or stroke exceptions;
- uses geometry values on the provisional half-unit grid;
- resolves ISC licence and BlueLuscious attribution;
- is deeply frozen by Core;
- remains below the provisional primitive budget;
- exports through `@aster/icons/<icon-slug>`.

`AsterIcons` retains the canonical definitions in identity order. Catalogue source synchronisation
generates this index from direct `*.icon.ts` modules, making each valid icon available to
complete-package consumers such as the built-in CLI catalogue without adding collection
membership. It is a package-owned sequence, not a mutable runtime registry or runtime source
discovery service.

Only `ArrowLeft` and `ArrowRight` use the `mirror` RTL policy. The remaining identities preserve
geometry in RTL because their metaphors do not represent logical horizontal movement.

The Experimental `AsterCollection` retains its explicit seven-icon pilot membership. The eight new
foundational definitions and two vertical arrows remain collection-independent until a collection
composition is accepted; inclusion in `AsterIcons` provides package discovery and does not imply
collection membership.

## Metadata Scope

The corpus retains display name, RTL policy, presentation policy, licence, attribution,
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

The generated barrel and aggregate index are versioned, deterministically reconstructable outputs.
Their ownership and drift checks are documented by
[Catalogue Source Tooling](../../../tooling/catalogue/index.md).
