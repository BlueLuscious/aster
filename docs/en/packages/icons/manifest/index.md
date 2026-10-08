# Icons Distribution Manifest

Status: **Accepted**

`@luscious-garden/aster-icons/manifest` exposes immutable discovery metadata without evaluating
geometry, presentation policy or complete definitions. It performs no search or definition
loading itself.

## Public values

```ts
import {
  AsterCollectionManifest,
  AsterIconManifest,
} from "@luscious-garden/aster-icons/manifest";
```

Both values are readonly arrays ordered by their canonical keys. Records and their retained
identities, metadata, tags, replacement identities and member arrays are deeply frozen.

## Contracts

| Contract | Value | Responsibility and relations |
| --- | --- | --- |
| `IconManifestEntry` | Element of `AsterIconManifest` | Searchable icon metadata using Core `IconIdentity` and `IconRtlPolicyType`; its key also selects an exact icon loader. |
| `CollectionManifestEntry` | Element of `AsterCollectionManifest` | Collection discovery using Core `CollectionIdentity` and `CollectionMetadata`; retains ordered member keys instead of embedded definitions. |

These interfaces are public only through the manifest subpath.

An icon entry contains:

- `key` in `[<namespace>/]<name>[@<variant>]` form;
- complete `identity` and the public named export `symbol`;
- `displayName`, optional intrinsic `tags` and `rtl`;
- optional effective `licence` and `attribution`;
- `deprecated` and optional complete `replacedBy` identity.

A collection entry contains:

- `key` in `[<namespace>/]<name>` form;
- complete `identity` and public export `symbol`;
- complete descriptive `metadata`;
- `members` as ordered canonical icon keys, not collection aliases or icon objects.

Neither entry contains `viewBox`, nodes or presentation policy. Textual collection member keys
preserve authored order without evaluating members.
[Core definitions](../../core/index.md) own the underlying identity/metadata contracts;
the [rights boundary](../index.md#rights-boundary) owns legal-authority links.

## Source projection

[Catalogue Source Tooling](../../../tooling/catalogue/index.md) statically derives records from
canonical icon and collection modules without executing them. It owns source grammar, imported
constant resolution, relationship validation and synchronisation safety.

The emitted manifest has only type-only contract imports and no runtime definition imports.
Generated records are distribution projections, not editable membership sources. Removing a
referenced icon is rejected by tooling rather than silently changing a collection.

[Dynamic Loaders](../dynamic/index.md) resolves selected keys to complete definitions.
[Distribution Costs](../index.md#distribution-costs) explains why metadata-only evaluation does
not reduce the package acquired from npm. [Quality](../quality.md) owns exactness and freezing
evidence; [Quality Baseline](../quality-baseline.md) owns fresh-process measurements.
