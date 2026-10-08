# Aster Project

Status: **Accepted**

Aster is a framework-agnostic icon platform for defining immutable portable icons and collections,
distributing curated artwork, rendering SVG and running explicit catalogue workflows. Its private
Import compiler can adopt reviewed external artwork into editable TypeScript.

An icon is portable data, not an SVG file, framework component or host object. Its definition is
independent from the source used to author it, any collection membership and the target used to
present it.

## Product composition

The [package set](../packages/index.md) owns distribution responsibilities and the production
dependency graph. Portable definitions, rendering and adoption remain separate capabilities; CLI
adds command planning and a standalone Node host. [Repository tooling](../tooling/index.md)
verifies this repository without entering production dependencies.

[Collections](../collections/index.md) own curatorial identity, visual rules, provenance and
acceptance. Icons distributes their canonical values; a collection is not another package boundary.

The `@luscious-garden` scope groups package distribution and the `aster-` prefix identifies this
product. Neither changes an icon's canonical identity namespace or the `aster` executable name.

## Implemented workflows

| Workflow | Execution owner |
| --- | --- |
| Authored values become portable definitions and collections. | [Core construction](../packages/core/workflow.md) |
| Canonical TypeScript artwork becomes isolated imports and discovery data. | [Icons authoring](../packages/icons/workflow.md) |
| A portable definition becomes standalone SVG markup. | [SVG rendering](../packages/svg/workflow.md) |
| Explicit providers support discovery, export plans and static review. | [CLI execution](../packages/cli/workflow.md) |
| Acquired source and reviewed metadata become editable TypeScript. | [Private Import adoption](../packages/import/workflow.md) |

CLI is optional for programmatic construction and rendering. Import is private and optional for
TypeScript-first authorship. Acquisition, persistence and other host effects belong to explicit
hosts rather than portable values. Each workflow guide owns its execution and failure details.

## Project policies

- [Testing](testing.md) defines evidence roles, isolation and verification requirements.
- [Versioning](versioning.md) defines independent package versions and compatibility obligations.
- [Publication](publication.md) defines the separately approved distribution procedure.
- [Publication records](publications/index.md) retain dated verification of published combinations;
  each package's history owns its changes and migrations.

## Ecosystem authority

The [Garden Aster record](https://github.com/BlueLuscious/garden/blob/master/docs/en/products/aster/index.md)
owns ecosystem identity and cross-product relationships. This repository owns implemented Aster
behaviour. Updates to both authorities require separate manually reviewed changes; neither
repository synchronises the other's prose automatically.

Lilium, Protea, Flora and Studio integrations remain conditional
[future capabilities](../future-capabilities.md), not dependencies or current product guarantees.
