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

- [Shared-rules adoption](#shared-rules-adoption) identifies the current Garden authority, local
  additions, exception boundary and actual enforcement.
- [Testing](testing.md) defines evidence roles, isolation and verification requirements.
- [Versioning](versioning.md) defines independent package versions and compatibility obligations.
- [Publication](publication.md) defines the separately approved distribution procedure.
- [Publication records](publications/index.md) retain dated verification of published combinations;
  each package's history owns its changes and migrations.

## Shared rules adoption

Aster follows the applicable [Garden shared project rules](https://github.com/BlueLuscious/garden/blob/master/docs/en/project-rules.md)
and their TypeScript/JavaScript profile. Cross-project navigation follows Garden's
[link policy](https://github.com/BlueLuscious/garden/blob/master/docs/en/project-rules.md#cross-project-links):
final canonical `master` targets are authored directly, independently of their current availability.
A pending target does not require coordinated integration or a later link-only change. Navigation
does not change product contracts, published packages or prove universal implementation conformance.
Aster contract changes and exceptions still require their owning product's explicit approval.

### Local additions and exceptions

Aster retains ownership of its package contracts, ES2022 ESM distribution, toolchain/dependency
graph, canonical artwork, collections, private tooling, tests and release procedure. Their owners
are linked above; these compatible product-specific additions are not exceptions to shared rules.
Canonical icon and collection declarations retain their `*.icon.ts` and `*.collection.ts` roles
under the [catalogue source convention](../tooling/catalogue/index.md#source-convention).

The shared [layer boundary](https://github.com/BlueLuscious/garden/blob/master/docs/en/project-rules.md#layer-boundaries)
keeps contracts independent of concrete runtime classes. A missing real capability may justify
an internal bridge; using an existing suitable contract does not require another wrapper. This
is policy alignment, not a runtime refactor or removal of existing capability contracts.

No shared-rule exception is approved by this adoption. Any future exception follows
[Garden's approval boundary](https://github.com/BlueLuscious/garden/blob/master/docs/en/project-rules.md#exceptions)
and is recorded at its affected Aster owner. Incomplete adoption or an unautomated rule is not an
approved exception.

### Actual enforcement

| Boundary | Automated evidence and limits |
| --- | --- |
| Compiler, package and dependency boundaries | [Architecture tooling](../tooling/architecture/index.md) checks its declared compiler, manifest and module rules; it does not prove responsibility design or every naming/layer convention. |
| Source style | [Source quality tooling](../tooling/index.md#source-quality-boundaries) applies focused ESLint rules and configuration-only formatting. It does not currently check authored TypeScript indentation or all naming, JSDoc and comment requirements. |
| Canonical documentation | [Documentation tooling](../tooling/documentation/index.md#current-verification) checks hierarchy, mirroring, local files and forbidden local references; external links, heading fragments, README coverage, British English and prose truth require separate review. |
| Product behaviour and distribution | [Testing](testing.md) maps evidence to source, type, ABI, executable and workflow suites. A passing suite proves its scoped assertions, not universal policy conformance or publication permission. |

Rule adoption introduces no new checker. Semantic design, authority/exception decisions and the
uncovered source/documentary rules remain explicit human-review responsibilities. Root gate and
Ubuntu/Windows orchestration remain owned by [repository tooling](../tooling/index.md#verification-orchestration).

## Ecosystem authority

The [Garden Aster record](https://github.com/BlueLuscious/garden/blob/master/docs/en/products/aster/index.md)
owns ecosystem identity and cross-product relationships. This repository owns implemented Aster
behaviour. Updates to both authorities require separate manually reviewed changes; neither
repository synchronises the other's prose automatically.

Lilium, Protea, Flora and Studio integrations remain conditional
[future capabilities](../future-capabilities.md), not dependencies or current product guarantees.
