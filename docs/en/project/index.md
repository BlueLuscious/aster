# Aster Project

Status: **Pre-release**

Aster is a framework-agnostic icon platform. It defines portable immutable icons and collections,
provides deterministic SVG rendering, supports explicit catalogue workflows, and can adopt
reviewed external artwork into editable TypeScript. No portable Aster value requires a browser,
DOM, framework, command-line host, or repository tool.

An icon is portable data rather than an SVG file, framework component, or host object. Its
canonical definition remains independent from the source used to author or adopt it and from every
target used to present it.

## Product composition

| Boundary | Maturity | Project role |
| --- | --- | --- |
| [`@luscious-garden/aster-core`](../packages/core/index.md) | Pre-release | Defines and constructs the portable icon and collection model. |
| [`@luscious-garden/aster-icons`](../packages/icons/index.md) | Pre-release | Publishes canonical TypeScript-first icons and explicit collection aggregates. |
| [`@luscious-garden/aster-svg`](../packages/svg/index.md) | Pre-release | Renders portable definitions as deterministic standalone SVG markup. |
| [`@luscious-garden/aster-cli`](../packages/cli/index.md) | Pre-release | Provides host-neutral catalogue commands and a thin standalone Node executable. |
| [`@luscious-garden/aster-import`](../packages/import/index.md) | Private | Adopts explicit external sources into portable definitions and editable TypeScript. |
| [Repository tooling](../tooling/index.md) | Private | Verifies and maintains this repository without entering production package graphs. |

Collection documentation is a curatorial authority, not another package boundary. The
[collection index](../collections/index.md) records accepted collection identities, authorship,
visual rules, provenance, and evidence; `@luscious-garden/aster-icons` owns their distributable TypeScript values.

The `@luscious-garden` npm organisation groups package distribution; the `aster-` package-name
prefix distinguishes this product within that shared scope. Neither the organisation name nor
the package prefix changes an icon's canonical `aster` identity namespace or the `aster`
executable name.

## Dependency direction

The production graph points towards Core and contains no dependency on repository tooling:

```text
@luscious-garden/aster-icons ----------------> @luscious-garden/aster-core <---------------- @luscious-garden/aster-svg
                                    ^
                                    |
@luscious-garden/aster-import ----------------------+----> xmlsax-typescript

@luscious-garden/aster-cli ----> @luscious-garden/aster-core
      +--------> @luscious-garden/aster-icons
      +--------> @luscious-garden/aster-svg
```

Core has no runtime dependency. Icons and SVG depend only on its public root. CLI consumes the
public Core, Icons, and SVG packages for catalogue and export workflows. Private Import depends on
Core and contains its replaceable XML parser behind an internal adapter. No production package
imports repository tooling or another package's implementation paths. Exact package contracts and
exports belong to the [package documentation](../packages/index.md).

## Implemented workflows

```text
TypeScript authoring ----------------------> Core definition
canonical Icons catalogue ----------------> CLI discovery or SVG export
Core definition --------------------------> SVG markup
external source + reviewed Core metadata --> Import --> editable .icon.ts
```

Import is optional and has no filesystem or command-line authority. CLI is optional for
programmatic definition and rendering workflows. Source acquisition, persistence, and other host
effects remain outside portable packages. Detailed execution and failure behaviour is documented
by each owning package rather than repeated here.

## Maturity and releases

Aster has no published public release. Core, Icons, SVG, and CLI declare `0.1.0` as initial
publication candidates, Icons contains its first accepted collection, and Import is deliberately
private. Technical readiness checks and packed-consumer evidence have passed, but they do not
constitute a published compatibility promise or authorise publication. npm scope access, the
release tag, final artefacts and the human go/no-go remain explicit checks in the
[Manual Publication](publication.md) procedure.

When publication begins, independently installable packages will own separate Semantic Versioning
sequences and coordinate only where their dependency contracts require it. The complete
cross-package posture is defined by [Versioning and Releases](versioning.md).
The [Manual Publication](publication.md) procedure describes the separate human-controlled
go/no-go, registry checks and post-publication verification; it is not a release trigger.

## External integration direction

Lilium, Protea, Flora, and other consumers may integrate through optional adapters built against
stable public Aster contracts. Portable Aster packages do not depend on those products or acquire
their framework, component, DOM, or plugin semantics. Prospective integrations remain proposals
until their activation conditions are met in [Future Capabilities](../future-capabilities.md).
The [Garden Aster record](https://github.com/BlueLuscious/garden/blob/master/docs/en/products/aster/index.md)
owns Aster's ecosystem identity and cross-product relationships; this project documentation
remains authoritative for Aster's implemented boundaries and behaviour.
Updates that affect both authorities use separate manually reviewed pull requests. Neither
repository synchronises or mutates the other's documentation automatically.

## Documentation map

- [Packages](../packages/index.md) own production responsibilities, APIs, workflows, quality, and
  distribution evidence.
- [Repository Tooling](../tooling/index.md) owns private verification and maintenance behaviour.
- [Collections](../collections/index.md) own curatorial identity, design rules, provenance, and
  review evidence.
- [Future Capabilities](../future-capabilities.md) records proposals and activation triggers; it
  does not define current product guarantees.
- [Testing Policy](testing.md) defines transversal evidence roles, ownership, catalogue
  independence, isolation, and repository verification.
- [Versioning and Releases](versioning.md) owns cross-package maturity, compatibility, and release
  coordination.
- [Manual Publication](publication.md) owns the explicit release procedure and registry checks.
