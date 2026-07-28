# Collection and Source Boundary

Status: **Accepted**

This document defines collection ownership, lifecycle, visual-rule authority, canonical asset
roles, and the boundary between authored sources and generated artifacts.

## Collection identity and ownership

A collection is a curated visual family identified by one stable canonical slug. It owns:

- a human-readable name and purpose;
- one curator or explicitly named curatorial group;
- a design contract;
- editable artwork masters;
- canonical exported SVG sources;
- collection-level and icon-level metadata;
- lifecycle and licensing information;
- evidence for visual-rule changes and approved exceptions.

The canonical slug is ASCII lowercase `kebab-case`. Renaming a display name does not change the
slug. Changing a released slug is an identity migration and requires an explicit replacement and
deprecation decision.

One collection cannot silently inherit the visual personality of another. Shared technical
constraints may be project wide, but visual rules belong to the collection that provides evidence
for them.

## Collection lifecycle

Collections use these conceptual lifecycle states:

| State | Meaning |
| --- | --- |
| Experimental | Sources and rules are being tested and may change incompatibly. |
| Active | The collection is curated, documented, distributed, and maintained. |
| Deprecated | Existing distribution remains supported for an announced period, but a replacement or retirement is intended. |
| Archived | The collection is retained for provenance but receives no ordinary development. |

Moving a collection to Active requires:

- a named curator;
- a complete design contract;
- resolved distribution licensing;
- validated canonical sources and metadata;
- an approved representative icon set;
- documented automated and human review evidence.

Lifecycle changes are explicit metadata and release decisions. Deleting source files is not a
valid lifecycle transition.

## Project and collection rules

Project-wide technical constraints protect portability, safety, and deterministic generation.
They include:

- canonical identity and path rules;
- supported SVG syntax;
- rejection of executable, external, raster, or unsafe content;
- portable data and metadata contracts;
- deterministic diagnostics, normalization, and generation;
- generated-artifact ownership;
- package and dependency boundaries.

Collection-specific visual rules define personality and construction. They may include:

- viewBox and grid;
- safe area and optical overshoot;
- default and minimum display sizes;
- source stroke widths and scaling;
- caps, joins, corners, curves, and preferred angles;
- symmetry, perspective, negative space, and detail level;
- fill, weight, and variant policies;
- reference icons and accepted visual exceptions.

Grid, stroke, safe area, caps, joins, and optical policies remain Provisional until a
representative icon set demonstrates that they produce a coherent collection. Aster does not
promote one collection's defaults into universal rules without cross-collection evidence.

## Source directory model

Canonical collection sources use separate ownership boundaries:

```text
collections/
  <collection-slug>/
    masters/
    svg/
    metadata/
```

The directories have exact responsibilities:

| Directory | Authority |
| --- | --- |
| `masters/` | Editable design documents used to revise artwork. |
| `svg/` | Canonical machine-readable exports consumed by the build pipeline. |
| `metadata/` | Authored collection and icon metadata consumed by the build pipeline. |

No normalized SVG, generated TypeScript, renderer wrapper, preview, contact sheet, search index, or
package manifest belongs in these source directories. Generated outputs use separately declared
boundaries and can be deleted without removing canonical sources.

Metadata serialization technology and file extension remain Open until schema and authoring
experiments provide evidence. Regardless of format, metadata paths must resolve unambiguously to a
collection or icon identity.

## Editable masters

An editable master is the source of truth for revising visual geometry. Adobe Illustrator `.ai`
documents are supported as masters, but Aster's runtime and automated build do not parse them.

Masters preserve the information needed for future visual work:

- editable shapes and strokes;
- construction geometry and guides;
- named artboards, layers, or groups;
- a clearly identified export boundary;
- notes or evidence needed by the curator.

Whether one master contains one icon, one collection, or a documented batch remains Open until the
authoring workflow is tested. When one file represents one icon, its base filename must match the
canonical icon slug. Multi-artboard or batch masters require an explicit mapping from artboard
identity to canonical icon identity.

The storage transport for large binary masters, including whether version-control extensions are
required, remains Open until real file sizes and collaboration needs are measured.

## Canonical SVG sources

The exported SVG is the only canonical geometry input consumed automatically. It is not the
editable master and is not a generated distribution artifact.

Each SVG source:

- resolves to one collection, icon, and optional variant identity;
- uses a filename derived from the canonical icon identity;
- contains the approved export geometry only;
- is reviewed and corrected through its editable master;
- remains unchanged by runtime normalization;
- can be validated without access to Illustrator.

For an icon without a separately represented variant, the filename is `<icon-slug>.svg`. The exact
filename relationship for variants remains Open until the variant representation and packaging
model is accepted.

Normalized SVG or portable node data is generated output. It may simplify source syntax but never
replaces either the master or canonical exported SVG.

## Metadata source relationship

Collection metadata identifies the collection and provides allowed defaults. Icon metadata uses
the same canonical icon slug as its SVG source. A build request must reject:

- an SVG without required icon metadata;
- icon metadata without a corresponding SVG where geometry is required;
- ambiguous identity mappings;
- duplicate canonical identities;
- filename, metadata, and collection-path disagreement.

The complete composition and naming contract is defined by
[Metadata and Identity Boundary](metadata-and-identity-boundary.md).

## Generated artifact ownership

Every generated boundary declares:

- its canonical input set;
- the generator and stable rebuild command;
- its allowed output root;
- stale-output cleanup behavior;
- whether outputs are committed, packaged, or ephemeral;
- the verification proving clean reproducibility.

Generated artifacts are terminal products of source processing. They never become inputs to
another authoring path when a canonical source exists.

A generated boundary must be safely deletable and reproducible from masters only where a manual
SVG export is not required, and from canonical SVG plus metadata for all automated outputs. The
automated build never claims it can recreate SVG exports from `.ai` files.

## Licensing ownership

Every Active collection resolves one distribution license. Collection metadata may provide the
default license, author, and attribution policy. Individual icon metadata may override those values
only when the collection contract permits it.

An icon cannot be distributed when its effective license or required attribution is unresolved.
Licensing metadata describes distribution authority; it does not replace the repository's own
software license.

