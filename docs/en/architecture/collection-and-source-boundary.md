# Collection and Source Boundary

Status: **Accepted**

This document defines collection ownership, lifecycle, visual-rule authority, authoring roles, and
the boundary between authored sources and generated artefacts. The canonical authoring format is
deliberately unresolved.

## Collection identity and ownership

A collection is a curated visual family identified by one stable canonical slug. It owns:

- a human-readable name and purpose;
- one curator or explicitly named curatorial group;
- a design contract;
- direct membership references to portable icon definitions;
- optional editable artwork masters and SVG import sources;
- collection-level and icon-level metadata represented by the chosen authoring path;
- lifecycle and licensing information;
- evidence for visual-rule changes and approved exceptions.

The canonical slug is ASCII lowercase `kebab-case`. Renaming a display name does not change the
slug. Changing a released slug is an identity migration and requires an explicit replacement and
deprecation decision.

One collection cannot silently inherit the visual personality of another. Shared technical
constraints may be project wide, but visual rules belong to the collection that provides evidence
for them.

A portable collection may be empty while drafted. One portable icon may be retained by zero, one,
or multiple collections. Membership is never part of icon identity and does not alter the member
definition.

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
- deterministic diagnostics, normalisation, and generation;
- generated-artefact ownership;
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

An SVG import source root may use separate ownership boundaries:

```text
<source-root>/
  masters/
  svg/
  metadata/
    collection.json
    icons/
```

The directories have exact responsibilities:

| Directory | Authority |
| --- | --- |
| `masters/` | Optional editable design documents used to revise artwork. |
| `svg/` | Canonical machine-readable exports consumed by the build pipeline. |
| `metadata/` | Authored collection and icon metadata consumed by the build pipeline. |

No normalised SVG, generated TypeScript, renderer wrapper, preview, contact sheet, search index, or
package manifest belongs in these source directories. Generated outputs use separately declared
boundaries and can be deleted without removing canonical sources.

Metadata uses strict UTF-8 JSON with `schemaVersion: 1`. One source root owns
`metadata/collection.json`; each icon owns `metadata/icons/<icon-slug>.json`; and a separately
represented variant owns `metadata/icons/<icon-slug>--<variant-slug>.json`. Metadata and SVG base
filenames must agree.

Build itself does not discover this layout or require a repository-relative storage location. A
future CLI may adopt it as a default convention while still supplying explicit source descriptors
to Build. Hand-authored TypeScript definitions require none of these directories.

Decoding remains separate from source acquisition and domain authority. The accepted format,
alternatives, duplicate-key requirement, and migration boundary are recorded by
[JSON Metadata for SVG Imports](../decisions/0004-canonical-json-metadata-sources.md).

## Optional editable masters

An SVG-first collection may designate an editable master as the visual source of truth. Adobe
Illustrator `.ai` documents are one possible master format, but Aster's runtime and automated
Build pipeline do not parse them.

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

## SVG import sources

An exported SVG is the geometry input consumed by the optional Build importer. It is neither
required by Core nor automatically authoritative for a TypeScript-first collection.

Each SVG source:

- resolves to one namespace, icon, and optional variant identity;
- enters a selected collection import request as explicit request context rather than intrinsic
  icon membership;
- uses a filename derived from the canonical icon identity;
- contains the approved export geometry only;
- is reviewed and corrected through the authority selected by its collection;
- remains unchanged by runtime normalisation;
- can be validated without access to Illustrator.

For an icon without a separately represented variant, the filename is `<icon-slug>.svg`. A variant
uses `<icon-slug>--<variant-slug>.svg`. Collection, icon, and variant slugs cannot contain empty
segments or consecutive hyphens, so the delimiter is unambiguous.

Normalised portable node data is generated output in an SVG-first workflow. In a TypeScript-first
workflow, the portable definition may instead be canonical and SVG may become a derived review or
distribution artefact. Aster will select a default only after both directions have implementation
and visual-review evidence.

## Metadata source relationship

Collection metadata identifies the collection and provides allowed defaults. Icon metadata uses
the same canonical icon slug as its SVG source. An SVG import request must reject:

- an SVG without required icon metadata;
- icon metadata without a corresponding SVG where geometry is required;
- ambiguous identity mappings;
- duplicate canonical identities;
- disagreement between the explicitly acquired SVG and icon metadata identities;
- disagreement between collection metadata and the selected collection import context.

Build does not derive these identities from filenames or repository paths. A future CLI may apply
one source-layout convention during acquisition, but that convention remains outside the
host-independent import pipeline.

The complete composition and naming contract is defined by
[Metadata and Identity Boundary](metadata-and-identity-boundary.md).

## Generated artefact ownership

Every generated boundary declares:

- its canonical input set;
- the generator and stable rebuild command;
- its allowed output root;
- stale-output cleanup behaviour;
- whether outputs are committed, packaged, or ephemeral;
- the verification proving clean reproducibility.

Generated artefacts are terminal products of source processing. They never become inputs to
another authoring path when a canonical source exists.

A generated boundary must be safely deletable and reproducible from its declared canonical input.
The automated Build importer never claims it can recreate SVG exports from `.ai` files.

## Licensing ownership

Every Active collection resolves one distribution licence. Collection metadata may provide the
default licence, author, and attribution policy. Individual icon metadata may override those values
only when the collection contract permits it.

An icon cannot be distributed when its effective licence or required attribution is unresolved.
Licensing metadata describes distribution authority; it does not replace the repository's own
software licence.
