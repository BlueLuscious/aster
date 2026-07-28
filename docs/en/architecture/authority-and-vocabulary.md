# Authority and Vocabulary

Status: **Accepted**

This document defines the authority model and shared vocabulary used by Aster architecture,
implementation, collections, and contributor documentation.

## Authority

Canonical accepted architecture lives under `docs/en/`. It is the only authority that production
code and published documentation may reference. When two canonical documents appear to conflict,
the more specific accepted contract governs its domain and the conflict must be resolved explicitly
rather than inferred from code.

Implementation does not become architecture merely because it exists. Material decisions must be
accepted in canonical documentation or a decision record, and implementation must then conform to
them.

## Vocabulary

| Term | Meaning |
| --- | --- |
| Icon | One named visual symbol belonging to a collection, independent from any renderer or framework component. |
| Definition | The immutable portable data representation of one icon. |
| Node | One ordered portable geometry or presentation entry retained by an icon definition. |
| Collection | A curated visual family that owns a coherent design contract and lifecycle. |
| Variant | A controlled visual variation within one collection, distinct from the collection itself. |
| Renderer | A target-specific implementation that converts a portable definition and render options into one explicit output form. |
| Adapter | An integration layer that exposes portable Aster definitions through another framework or target without changing Core. |
| Source | A human-authored or exported canonical input consumed by an Aster pipeline. |
| Master | The editable design document used to revise artwork, such as an Illustrator `.ai` file. |
| Artefact | A reproducible output created from canonical sources and never edited manually. |
| Metadata | Non-geometric descriptive, lifecycle, search, accessibility, licensing, or directional data associated with an icon or collection. |

The canonical exported SVG is a machine-readable source. It is not the editable master. A
framework component is a generated or composed view over a definition; it is not the icon itself.

## Decision states

| State | Meaning |
| --- | --- |
| Accepted | Current architecture that implementation must follow. |
| Provisional | A testable hypothesis that requires evidence before becoming accepted. |
| Open | A material choice that has not been made and cannot be buried in implementation. |
| Non-goal | Work intentionally excluded from the stated milestone or boundary. |
| Historical | Superseded context retained only to explain provenance. |

## Promotion flow

Proposals gather questions, alternatives, and implementation evidence. A material choice moves
through an explicit decision record. Once accepted, its stable behaviour and consequences are
incorporated into the relevant canonical architecture document.

Canonical documents link to one source of truth for each contract and do not repeat another
document's detailed responsibility.

Decision-record naming, lifecycle, acceptance, and supersession are defined by
[Decision Records](../decisions/index.md). Contribution authority is defined by
[Contribution and Review](../governance/contribution-and-review.md).
