# Versioning and Releases

Status: **Pre-release**

This document defines Aster's cross-package compatibility and release posture. Package-specific
public surfaces, failure guarantees, distribution evidence, and quality gates remain with their
respective [package documentation](../packages/index.md).

## Current maturity

Aster has no stable public release or compatibility commitment to external consumers. Core,
Icons, SVG, and CLI declare initial `0.1.0` candidates; none has been published by this decision.
`@luscious-garden/aster-import` also uses `0.1.0` for independent internal version tracking but remains private.
Repository conformance proves the current implementation against its documented boundaries but
does not turn candidate versions into published releases.
The [manual publication procedure](publication.md) records the separate registry and human
go/no-go checks; this policy does not authorise publication by itself.

The shared initial number is a convenient starting point, not a lockstep policy. Core has no
production dependency. Icons and SVG depend on Core; CLI depends on all three. Each public edge
uses `workspace:^` in source and must resolve to a caret range on the installed dependency's
version when packed. For the initial candidates, this is `^0.1.0`, which excludes `0.2.0`.
Import also uses `workspace:^` for its Core edge, even though it is not packed for publication.
Development-only workspace dependencies retain `workspace:*` because they are not runtime
requirements of a distributed package.

## Version ownership

Each independently installable package owns its own Semantic Versioning sequence. A coordinated
release may publish several mutually compatible packages, but an unchanged package does not move
in lockstep merely because it shares the repository.

Icons and collections do not acquire independent package versions. Their release history belongs
to the package that exports their definitions. Stable icon metadata may record introduction,
deprecation, and replacement relationships without becoming a second versioning system.

## Compatibility before 1.0

Before `1.0.0`, Aster classifies releases as follows:

| Change | Minimum increment |
| --- | --- |
| Breaking public contract, export, identity, or observable semantic change | Minor |
| Compatible public capability or additional icon definition | Minor |
| Compatible defect, documentation, metadata, or implementation correction | Patch |

A pre-release minor may contain breaking work, but release notes must label it explicitly and
provide migration guidance. Pre-release status never permits silent removal, renaming, or
reinterpretation of an accepted public surface. From `1.0.0`, breaking changes increment major,
compatible features increment minor, and compatible corrections increment patch.

Package-specific documentation determines whether a change affects its accepted input, output,
error, export, or behavioural contract. Removing or repurposing a released icon identity is a
public compatibility change even when collection membership changes independently.

## Coordinated releases

Each package declares the narrowest dependency range proven by its built-package and integration
evidence. When an upstream contract changes incompatibly, its release must precede or accompany
compatible releases of dependent packages. Release notes identify the affected package set,
required migration, and compatible versions; unrelated packages remain untouched.

Publish Core first, then Icons and SVG in either order, then CLI, but only after all four final
tarballs pass clean-consumer conformance. A package release note must name its own version,
classify each change as compatible capability, compatible correction, or breaking change, and
state any affected public contract, supported dependency range, and consumer migration. An
unchanged dependent package needs no new release when its already published range covers the
upstream update. If not, review and release that dependent package with an updated range and
evidence before recommending the new combination. Conventional Commit titles inform this
assessment but never determine versions or trigger publication alone.

Private packages participate in repository verification but are not published. Making one public
requires an explicit package-boundary decision and complete public distribution evidence rather
than only removing the manifest's private marker.

## Release evidence

A publishable package requires a locked clean installation, applicable type and runtime tests,
built-package conformance, verified declarations and export maps, resolved software and artwork
licensing, and reproducible package contents. Release notes classify compatibility and record any
required migration.

A collection-bearing release additionally requires current provenance, artwork licensing,
attribution, visual evidence, and curatorial acceptance from the owning
[collection authority](../collections/index.md). Repository verification is necessary evidence,
but publication remains an explicit release action.
