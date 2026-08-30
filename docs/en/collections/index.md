# Collections

Status: **Accepted**

This directory documents Aster's real curated collection set. Collection-specific documentation
is keyed by accepted curatorial identity and does not require one repository-level source root.

The current collection set is:

- [Aster](aster/index.md) is the Experimental pilot collection used to validate its provisional
  geometric outline language.

No release-quality collection exists yet. A documented Experimental identity does not imply that
canonical icon sources, distribution, or Active lifecycle requirements have been accepted.

## Collection authority

A collection document is valid only for an accepted curatorial identity with a canonical slug,
named curator, lifecycle, artwork licence, intended use and provisional visual contract. Its
directory records curatorial evidence; it does not create a package, source root, catalogue or
distribution by existing.

An Experimental collection may test its visual language and reference set before publication.
When it accepts canonical authoring, its documentation must identify exactly one editable source
authority and distinguish every derived artefact. Promotion to Active additionally requires
reviewed canonical icons, provenance, licensing, technical and visual evidence, a supported
distribution boundary and an accepted release posture.

Collection membership remains separate from icon identity. Package documentation owns how
`CollectionDefinition` and `@aster/icons` represent membership; this tree owns why a curator groups
those icons and what visual evidence governs them.

Each collection document covers:

- identity, status, curator, purpose, and licence;
- visual design contract and representative references;
- canonical authoring, metadata, interchange, and export workflow;
- variants, presentation policy, RTL, and accessibility-relevant metadata;
- accepted exceptions and visual review evidence;
- package, version, deprecation, and replacement relationships.

`docs/en/collections/` is a deliberate curatorial exception to package and tooling mirroring. It
is keyed by collection identity because visual authority can exist independently from one source
layout. It is not a precedent for unrelated topic-based documentation roots.
