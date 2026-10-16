# Aster Documentation

Canonical documentation uses British English and gives each subject one owner:

- [Project](project/index.md): product purpose, implemented composition and shared policies.
- [Packages](packages/index.md): the package set, dependencies and independent feature guides.
- [Collections](collections/index.md): curatorial identity, visual rules, provenance and acceptance.
- [Repository Tooling](tooling/index.md): private verification and maintenance capabilities.
- [Future Capabilities](future-capabilities.md): conditional proposals, not current guarantees.

Package and tooling guides follow their real implementation features. Collection guides follow
accepted curatorial identities independently of source-directory layout. Each page explains its
own responsibility and links to related owners rather than repeating their complete specifications.

## Source and published versions

Current guides and README examples describe the checked-out source. An accepted source contract
is not a claim that its changes are already published; each package's
[version history](packages/index.md) identifies released behaviour and version-specific migrations.
An ordinary registry installation does not acquire unreleased source. To try those changes, use
the [workspace setup](../../README.md#development); select compatible published versions from their
histories instead when working outside the checkout. Publication remains a
[separate reviewed operation](project/publication.md).
