# Versioning and Releases

Status: **Accepted**

This policy governs compatibility and independent package versions. Feature guides define each
package's accepted behaviour; [publication](publication.md) defines approval and distribution.
[Dated publication records](publications/index.md) own registry observations and tested combinations,
not this policy.

## Current maturity

The first public non-prerelease baseline is `0.1.0`. A version below `1.0.0` does not promise a
final, unchanging API, but accepted contracts still carry the migration obligations below.
Import is versioned privately in source and has no public release.

## Version ownership

Each independently installable package owns its Semantic Versioning sequence. A shared repository
or initial version does not require lockstep increments. Icons and collections do not acquire
separate package versions: their changes belong to the package exporting them. Metadata may
record introduction, deprecation and replacement without becoming a second versioning system.

npm dist-tags select registry versions; they are not versions themselves. GitHub Releases use
independent `<package>/v<version>` tags at approved source commits. Repository-wide Latest is
presentation, not a package-version authority.

## Compatibility before 1.0

| Change | Minimum increment |
| --- | --- |
| Breaking public contract, export, identity or observable semantics | Minor |
| Compatible public capability or additional icon definition | Minor |
| Compatible defect, documentation, metadata or implementation correction | Patch |

Release notes must classify breaking work and explain migration, including for candidates.
Pre-release status does not permit silent removal, renaming or reinterpretation of an accepted
surface. From `1.0.0`, breaking changes increment major, compatible features minor and compatible
corrections patch.

Package contracts determine whether a change affects accepted input, output, failure, exports or
behaviour. Removing or repurposing a released icon identity is a public change even when collection
membership changes independently.

## Dependency coordination

Declare the narrowest dependency range proven by built-package and integration evidence.
Public workspace runtime edges use `workspace:^`, resolved to caret ranges when packed;
development-only workspace edges use `workspace:*`. Private Import also uses `workspace:^`
for Core. [The package graph](../packages/index.md) identifies the affected consumers.

An incompatible upstream change must precede or accompany compatible downstream releases.
An unchanged dependent needs no release if its existing published range covers the update;
otherwise review an updated range and consumer evidence before recommending the new combination.
For a four-package publication, Core precedes Icons and SVG, which precede CLI.

Assess all accumulated changes since each package's last published version, including distributed
README changes. Conventional Commits inform that review but neither determine versions nor trigger
publication. Private packages participate in verification; making one public requires an explicit
boundary decision and full distribution evidence, not merely removing `private`.

## Release-note convention

Each future public version page owns its title, changes, dependency requirements and migration.
Keep the existing preparation fields:

- One H1 title in the form `Aster <Package> <version>`.
- A `Status: **Published ...**` line with the npm publication date, specifying UTC.
- `Source commit:` followed by the full forty-character SHA in backticks and a final full stop.
- `Registry:` with a link to the exact npm package version.
- `Approved archive SHA-256:` followed by the sixty-four-character digest in backticks and a final
  full stop.

After those fields, use a short summary paragraph and a concise flat change list. Label entries
as compatible capability, compatible correction or breaking change, naming the affected contract
or output. Add migration, deprecation, replacement or significant limitations only where useful;
do not add empty sections or repeat the entire current feature guide. Link to that guide instead.

The [release preparer](../tooling/release/index.md) consumes the title and body of this page.
Review the final wording before preparation; do not silently reformat approved historical bodies
or change published notes through a documentation cleanup. Private source history is labelled
separately and has no public publication or archive fields.

## Required evidence

A publishable package requires a clean locked installation, applicable tests, packed-consumer
conformance, verified exports/declarations, reproducible contents and resolved software/artwork
licensing. A collection-bearing release additionally requires provenance, visual evidence and
curatorial acceptance from its [collection authority](../collections/index.md).

The complete installable combination must pass clean-consumer verification, even when it reuses
unchanged published dependencies. Verification is necessary evidence, not publication approval.
