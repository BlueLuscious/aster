# Versioning and Releases

Status: **Public `0.1.0` baseline released**

This document defines Aster's cross-package compatibility and release posture. Package-specific
public surfaces, failure guarantees, distribution evidence, and quality gates remain with their
respective [package documentation](../packages/index.md).

## Current maturity

Aster has published its first non-prerelease `0.1.0` versions of Core, Icons, SVG and CLI under
the npm `latest` tag. The earlier candidates remain available by exact version. Private
`@luscious-garden/aster-import` is versioned in source but has no public release. This initial
public baseline is below `1.0.0` and does not promise a final, unchanging API; accepted
contracts and migration obligations still follow the policy below.

Repository conformance proves the current implementation against its documented boundaries but
does not replace the package compatibility policy.
The [manual publication procedure](publication.md) records the separate registry and human
go/no-go checks; this policy does not authorise publication by itself.

The shared initial number is a convenient starting point, not a lockstep policy. Core has no
production dependency. Icons and SVG depend on Core; CLI depends on all three. Each public edge
uses `workspace:^` in source and must resolve to a caret range on the installed dependency's
version when packed. The published `rc.1` set uses `^0.1.0-rc.1` and the published `rc.2` set
uses `^0.1.0-rc.2` on each public runtime edge. The published stable archives resolve their
public runtime edges to `^0.1.0`. None of
these ranges admits `0.2.0`.
Import also uses `workspace:^` for its Core edge, even though it is not packed for publication.
Development-only workspace dependencies retain `workspace:*` because they are not runtime
requirements of a distributed package.

The `rc.1` suffix is part of the package's Semantic Versioning identity and marks the first
release candidate for `0.1.0`. npm dist-tags are independent registry metadata, not versions.
The first candidate publication also assigned `latest` while no earlier package version
existed; the separately published `0.1.0` archives now own `latest`. The older `next` pointers
remain on their candidates pending a separate tag decision. The
[publication record](publication.md#first-stable-publication) owns the observed registry state.

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

For a coordinated four-package set, publish Core first, then Icons and SVG in either order, then
CLI. A single-package release may reuse already published compatible dependencies, but the
complete installable set must pass clean-consumer conformance. A package release note must name
its own version,
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
