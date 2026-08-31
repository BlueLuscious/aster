# Aster Collection

Status: **Accepted**

Collection lifecycle: **Experimental**

## Identity

| Field | Value |
| --- | --- |
| Name | Aster |
| Canonical slug | `aster` |
| Curator | BlueLuscious |
| Artwork licence | [ISC](../../../../LICENSE) |
| Intended use | General-purpose interface actions, objects, status, navigation, and communication metaphors. |
| Visual position | Geometric outline construction with restrained optical correction. |

The collection is intended to feel precise without becoming mechanically rigid. Geometric
construction establishes family resemblance; optical corrections preserve apparent balance at
small interface sizes.

The collection excludes brand marks, flags, illustrations, text, embedded type, photographic or
raster content, and highly ornamental subjects that cannot remain legible within its detail
budget. Third-party artwork is not admitted under the collection licence without separate
provenance and licensing evidence.

## Current Authority

The collection identity, curator, Experimental lifecycle, licence, and
[provisional design contract](design-contract.md) are accepted.

The collection uses [TypeScript-first authoring](authoring-workflow.md). Each accepted icon owns
one portable definition module in [`@aster/icons`](../../packages/icons/index.md), while SVG
remains derived review or distribution output and Import remains an optional importer.
`AsterCollection` separately retains the accepted icon definitions as explicit membership data;
the same definitions remain directly usable without importing or consulting that collection.

The [pilot reference set](reference-set.md) contains sixteen canonical Experimental definitions
and records the current structural and curatorial evidence.
The collection is not release quality and must not be presented as an Active collection before
curatorial and release evidence is accepted.

## Source and derived artefacts

Each committed icon has one canonical editable `.icon.ts` module in `@aster/icons`. The collection
module aggregates those definitions but does not own their geometry or intrinsic metadata. No
Illustrator master, imported SVG, filename convention or generated manifest is an alternative
canonical source for the current set.

SVG produced by `@aster/svg` or `aster export` is derived review or distribution output. It may be
deleted and reproduced from the TypeScript definition and must never be edited as source. Import
may adopt external artwork into an editable module, but the acquired input and Import lifecycle
cease to be dependencies once that module is reviewed and accepted.

BlueLuscious authored and curates the current original artwork under ISC. Third-party material
requires explicit provenance, compatible artwork licensing and curatorial acceptance before it can
join this collection; repository software licensing cannot supply missing artwork authority.

## Initial Variant Policy

The pilot has one unqualified outline form and declares no variants. A weight, fill, or stylistic
variant is introduced only after the base form is coherent and a real consumer justifies the
additional identity and review cost.

## Evidence Still Required

Promotion beyond Experimental requires:

- representative canonical icon sources;
- repeatable derived-artefact generation where applicable;
- passing package, workflow and implemented collection-rule checks;
- curator-approved reference icons and exception records;
- review evidence at the default and minimum display sizes;
- an accepted distribution and versioning boundary.

Automation cannot infer recognisability, optical balance or artistic consistency. Curatorial
approval cannot override portable validity, provenance, licensing, deterministic output or public
compatibility failures.
