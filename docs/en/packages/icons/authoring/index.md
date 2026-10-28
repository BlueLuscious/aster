# Icons Authoring Authorities

Status: **Accepted**

The internal authoring feature supplies immutable inputs composed by canonical icon modules.
Authorship and visual policy are independent; neither is a universal requirement for every
definition distributed by Icons or a public package export.

## Original authorship

| Authority | Responsibility and composition |
| --- | --- |
| `asterArtworkLicence` | Names `LicenseRef-Aster-Artwork-1.0`; reused by original icon and collection metadata. Complete terms belong to the [artwork licence](../../../../../packages/icons/ARTWORK-LICENCE.md). |
| `asterOriginalIconAuthorship` | Carries namespace `aster`, that licence identifier and attribution `BlueLuscious`; composed into originally authored icon identities and metadata. |

Authorship contains no geometry, presentation, tags, RTL policy or membership. Other artwork
supplies its own identity and effective legal metadata. Package inclusion or the namespace
alone does not assign a licence.

## Glyph reference and treatment derivation

The first accepted canonical variant of each glyph establishes its geometric reference for
subsequent treatments. Outline is the usual starting point, not a required first variant;
disposable experiments and acquired source files do not establish that authority.

Develop later variants from that reference's coordinate system, proportions, defining features
and principal anchors. Treatment-specific construction and optical adjustments remain deliberate
and reviewed rather than requiring identical coordinates or a mechanical conversion. When
correcting the reference, review the affected variants for continued consistency instead of
overwriting them automatically. No glyph requires a complete set of treatments.

This is an Aster catalogue authoring rule, not a Core constraint, runtime default or relationship
stored in `IconDefinition`. Each treatment retains its own geometry and independent module under
[definition ownership](../glyphs/index.md#definition-ownership); it does not import the reference
definition to construct itself. Collection admission remains a separate decision.

Each canonical definition's JSDoc identifies both the glyph and its treatment. Its authored
`metadata.displayName` combines the readable glyph name and treatment, including Outline:
`Camera Outline`, `Camera Filled` and `Arrow Left Outline`. This catalogue convention does not
change canonical identities or export names, and Core does not append or require that suffix.

## Geometry representation and numeric intent

Prefer native primitives when they faithfully express the intended geometry and paint: a circle
should use `circle`, not an approximate expanded path. Judge simplicity by the complete geometry,
not node count alone; a deliberate set of circles may be clearer than one large compound path.

Use the accepted family's grid for principal dimensions and anchors. Retain calculated values
where curves, tangencies or even distribution require them; do not blindly snap every coordinate
or retain numerical export residue. Review symmetry, spacing and the result at intended sizes.
For point-based treatments, choose diameter separately from point count and spacing; a coherent
diameter across a family does not require identical counts or gaps on every shape.

Keep faithful [source adoption](../../import/workflow.md) separate from artistic refinement.
Moving or resizing points, changing their intended distribution or approximating curves requires
artistic review; these are not merely shorter spellings of the acquired source.

## Amellus visual input

`amellusIconAuthoringProfile` contains two deeply frozen values:

- `viewBox`, checked against Core `IconViewBox`;
- `presentations`, with explicit `outline` and `filled` entries, each checked against Core
  `IconPresentationPolicy`, including defaults, authorised overrides and viewport guidance.

Their accepted values implement the [Amellus visual contract](../../../collections/amellus/design-contract.md),
which owns canvas, treatment, size and direction rules. Each applicable icon selects its own
presentation; the map supplies no default treatment. The profile contains no identity, legal
metadata, nodes, display name, tags, RTL policy, deprecation or membership. Another family uses a
different narrow profile without modifying Amellus or original authorship.

## Composition

An applicable `.icon.ts` module combines authorship and visual inputs when calling `Icon.define()`.
Core validates, isolates and freezes the complete result. Collections then retain definitions
without applying either profile at membership time.

A collection declares its own legal metadata for its curation; member artwork keeps its separate
terms. The [rights boundary](../index.md#rights-boundary) links the software and artwork authorities.
Runtime consumers receive resolved `IconDefinition` values, not these internal authoring objects.
