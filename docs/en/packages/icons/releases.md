# Icons Release Notes

## 0.1.0 candidate

Status: **Not published**. This is the proposed first public version, not a previously supported
release. No consumer migration is required.

**Compatible capability:** `@luscious-garden/aster-icons` provides the accepted 26 canonical icon definitions,
the Amellus collection, isolated icon and collection subpaths, a metadata-only `/manifest`, and
exact asynchronous `/dynamic` loaders. Its runtime dependency is `@luscious-garden/aster-core@^0.1.0`.

**Accepted limits:** The package root and `/collections` aggregate are deliberately not exported.
Installing the package acquires all its files even when a consumer imports one icon. Metadata
discovery avoids evaluating all definitions, but it does not provide selective npm acquisition.
No variant identities or registry-backed installation are included. See [Icons](index.md),
[Distribution Costs](index.md#distribution-costs), and the [Amellus authority](../../collections/amellus/index.md).

Original BlueLuscious-owned artwork marked `LicenseRef-Aster-Artwork-1.0` follows the separate
[artwork licence](../../../../packages/icons/ARTWORK-LICENCE.md); software follows
[ISC](../../../../packages/icons/LICENSE). There are no prior public corrections or breaking
changes to classify. Future releases follow the
[project compatibility policy](../../project/versioning.md).
