# Collections

Status: **Accepted**

This directory documents Aster's real curated collection set. Collection-specific documentation
is keyed by accepted curatorial identity and does not require one repository-level source root.

The current collection set contains [Amellus](amellus/index.md), Aster's Active foundational
minimalist general-purpose collection. Its canonical definitions, visual language, provenance,
licensing, static review and package conformance are accepted for a first pre-release.

Active collection status does not imply that the exporting package has been published or that its
public compatibility surface is stable. Project release maturity remains independently governed
by [Versioning and Releases](../project/versioning.md).

## Collection authority

A collection document is valid only for an accepted curatorial identity with a canonical slug,
named curator, lifecycle, artwork licence, intended use and provisional visual contract. Its
directory records curatorial evidence; it does not create a package, source root, catalogue or
distribution by existing.

A Proposed collection may test its visual language and reference set before publication. When it
accepts canonical authoring, its documentation must identify exactly one editable source authority
and distinguish every derived artefact. Promotion to Active additionally requires reviewed
canonical icons, provenance, licensing, technical and visual evidence, a supported distribution
boundary and an accepted release posture.

Catalogue size is not maturity or quality evidence. A smaller coherent collection with reviewed
geometry, provenance, and visual behaviour is preferable to unreviewed expansion.

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
