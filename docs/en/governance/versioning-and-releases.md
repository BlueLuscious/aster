# Versioning and Releases

Status: **Accepted**

This document defines compatibility and release policy for Aster packages and curated collection
content.

## Version ownership

Every published package owns an independent Semantic Versioning sequence. Core, renderers,
collection definitions, framework adapters, and generated collection-target integrations do not
move in lockstep merely because they share a repository.

One coordinated release may publish several compatible package versions. Unchanged packages are
not republished.

Icons do not have independent package versions. Their release history is derived from the
collection definition package that exports them, with stable metadata such as `introducedIn`,
deprecation, and replacement identity where required.

## Semantic Versioning

Before `1.0.0`, Aster applies:

| Change | Version increment |
| --- | --- |
| Breaking public contract, export, identity, or observable semantic change | Minor. |
| Compatible feature or additive public capability | Minor. |
| Compatible defect, documentation, or implementation correction | Patch. |

A `0.x` minor may therefore contain breaking work, but it must be labelled explicitly in release
notes and include migration guidance. Pre-1.0 status is not permission for silent breakage.

From `1.0.0`, standard Semantic Versioning applies: breaking changes increment major, compatible
features increment minor, and compatible fixes increment patch.

## Compatibility classification

The following changes are breaking:

- removing, renaming, or reinterpreting a public symbol, field, option, diagnostic code, or export
  subpath;
- changing canonical collection, icon, or variant identity;
- removing a released icon or variant;
- adding a portable node kind to a public discriminated union without an accepted capability
  mechanism;
- making previously accepted input invalid;
- changing accessibility, direction, or presentation precedence incompatibly;
- changing target result type or generated module shape incompatibly.

Compatible minor changes include new icons, variants, optional metadata capabilities, adapters,
subpaths, and explicitly negotiated target support.

A patch may correct an implementation defect, search metadata, documentation, or geometry that
failed to represent already accepted intent. Geometry patches require visual evidence and
curatorial approval. An intentional redesign, changed meaning, or reduced recognisability is at
least minor and may be breaking.

## Collection releases

One collection definition package version describes the complete released state of that
collection.

| Collection change | Minimum classification |
| --- | --- |
| Add an icon or variant | Compatible minor. |
| Deprecate an identity without removing it | Compatible minor. |
| Correct metadata or geometry to accepted intent | Patch. |
| Change design rules with observable output changes | Minor, or breaking when compatibility is not preserved. |
| Remove, rename, repurpose, or merge an identity | Breaking. |
| Change variant representation or public subpath | Breaking. |

Aliases and tags never preserve an import identity after removal or rename.

## Deprecation and replacement

A released identity is deprecated before removal. Deprecation preserves its export and records a
fully qualified replacement when one exists.

- During `0.x`, removal occurs no earlier than the subsequent minor after deprecation and is
  labelled breaking.
- From `1.0.0`, removal waits for the next major version.
- A replacement cannot point to itself or create a cycle.
- An unavailable replacement remains a diagnostic and documentation concern; it is not treated as
  a valid local alias.

Security, legal, or provenance failures may require immediate withdrawal. Such a release records
the reason, affected versions, and migration or containment guidance.

## Dependency compatibility

Each package declares the narrowest dependency range proven by built-package and integration
tests. Wildcard compatibility is prohibited.

Portable packages use ordinary runtime dependencies only where their generated or runtime modules
execute that dependency. Framework adapters use peer dependencies when the host must provide one
compatible framework instance.

Generated collection-target integrations depend on their corresponding collection definitions and
generic target renderer. Collection definitions never depend on those integrations.

A coordinated breaking release publishes upstream contracts before or together with compatible
renderers, collections, and integrations. Release notes provide a compatibility table when several
packages must move together.

## Release gates

Every package release requires:

- a clean deterministic checkout and locked install;
- type, runtime, package, and conformance checks applicable to the package;
- public API, declaration, export-map, and rejected-subpath verification;
- no stale or manually edited generated artefacts;
- release notes with compatibility classification;
- resolved software and artwork licensing;
- reproducible package contents without local or machine-specific data.

A collection release additionally requires source provenance, effective artwork licence, required
attribution, current visual evidence, and curator approval.

A framework or DOM adapter release additionally requires conformance against every claimed host
version and target.

## Pilot evidence

The first experimental and pilot releases must validate:

- whether independent package versions create operational friction;
- practical dependency ranges among Core, collections, renderers, and integrations;
- geometry-change classification through real visual review;
- the pre-1.0 deprecation interval;
- coordinated release ordering and rollback.

Evidence may refine operational detail through an accepted decision record. It cannot silently
weaken identity, compatibility, provenance, or approval guarantees.
