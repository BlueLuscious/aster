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

## Amellus visual input

`amellusIconAuthoringProfile` contains two deeply frozen values:

- `viewBox`, checked against Core `IconViewBox`;
- `presentation`, checked against Core `IconPresentationPolicy`, including defaults,
  authorised overrides and viewport guidance.

Their accepted values implement the [Amellus visual contract](../../../collections/amellus/design-contract.md),
which owns canvas, outline, size and direction rules. The profile contains no identity, legal
metadata, nodes, display name, tags, RTL policy, deprecation or membership. Another family uses a
different narrow profile without modifying Amellus or original authorship.

## Composition

An applicable `.icon.ts` module combines authorship and visual inputs when calling `Icon.define()`.
Core validates, isolates and freezes the complete result. Collections then retain definitions
without applying either profile at membership time.

A collection declares its own legal metadata for its curation; member artwork keeps its separate
terms. The [rights boundary](../index.md#rights-boundary) links the software and artwork authorities.
Runtime consumers receive resolved `IconDefinition` values, not these internal authoring objects.
