# CLI Catalogue

Status: **Experimental**

The catalogue feature currently defines the explicit provider and snapshot contracts required by
host-neutral discovery. It does not yet load or query the built-in Aster catalogue.

## Public contracts

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `CatalogueProvider` | Identifies and asynchronously loads one explicit catalogue snapshot. | Supplied through `AsterCommandContext`; invoked only by catalogue command definitions. |
| `CatalogueSnapshot` | Retains the complete icon and collection record sequences for one provider load. | Contains `CatalogueIconRecord` and `CatalogueCollectionRecord` values. |
| `CatalogueIconRecord` | Retains one portable icon, independent collection memberships, and optional provider search terms. | Uses Core `IconDefinition` and `CollectionIdentity`; does not mutate either value. |
| `CatalogueCollectionRecord` | Retains one portable collection and optional provider search terms. | Uses Core `CollectionDefinition`; membership remains owned by that portable collection. |

These records keep provider provenance, computed search terms, and many-to-many catalogue
membership outside portable Core metadata. Equal portable identities from different providers
remain distinct catalogue results until explicit lookup rules resolve or reject them.

## Current lifecycle

Context acceptance validates provider identity and callable shape without loading a snapshot.
Provider loading, snapshot validation, deterministic ordering, conflict detection inside one
snapshot, and built-in provider composition are intentionally deferred until catalogue discovery
is implemented.

The accepted provider and conflict semantics are defined by the
[Command-line Boundary](../../../architecture/command-line-boundary.md).
