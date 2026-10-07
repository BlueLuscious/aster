# Icons Release Notes

## 0.1.0

Status: **Prepared in source; not yet published**.

The first stable Icons package retains the accepted definitions, collection membership and public
exports from `0.1.0-rc.2`. It adds no icon or runtime capability. The stable archive must declare
Core `^0.1.0`. Consumers coming directly from `0.1.0-rc.1` must apply the
collection migration described below. Registry links, archive hashes and the publication date
will be recorded after the exact stable archive is approved and published.

## 0.1.0-rc.2

Status: **Published on 6 October 2026** under the npm `next` tag.

Registry: [`@luscious-garden/aster-icons@0.1.0-rc.2`](https://www.npmjs.com/package/@luscious-garden/aster-icons/v/0.1.0-rc.2)

Approved archive SHA-256: `d0d8d01eec13c97055bfdf9842ac8d331d5648f8bd55cf33ac1c5fe83a04da3d`.

**Breaking change:** `AmellusCollection.icons` becomes a concrete readonly alias dictionary and
`AmellusCollection.members` becomes its ordered member list. Use `.icons.camera` or
`.icons.arrowLeft` for known icons, and migrate array indexing, counting and traversal to
`.members`. The accepted icon identities, geometry, collection membership and semantic order
remain unchanged. Direct icon imports and exact loader routes retain the same canonical objects.

This representation requires the corresponding typed-collection Core implementation and is not
available in the earlier `0.1.0-rc.1` tarball. The published package depends on Core
`^0.1.0-rc.2`. Current usage and import costs are documented by
[Canonical Collections](collections/index.md), with source grammar owned by
[Catalogue Source Tooling](../../tooling/catalogue/index.md).

## 0.1.0-rc.1

Status: **Published on 22 September 2026**. This is the formal release candidate for the first
public `0.1.0`, not a previously supported release. No consumer migration is required.

Registry: [`@luscious-garden/aster-icons@0.1.0-rc.1`](https://www.npmjs.com/package/@luscious-garden/aster-icons/v/0.1.0-rc.1)

Approved archive SHA-256: `DDE0653DBD7C94E75E7FEA880C24ED1A641566DD077516650BA1AEEA8B2DEA63`.

**Compatible capability:** `@luscious-garden/aster-icons` provides the accepted 26 canonical icon definitions,
the Amellus collection, isolated icon and collection subpaths, a metadata-only `/manifest`, and
exact asynchronous `/dynamic` loaders. Its runtime dependency is `@luscious-garden/aster-core@^0.1.0-rc.1`.

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
