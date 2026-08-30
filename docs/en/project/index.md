# Aster Project

Status: **Pre-release**

Aster is a framework-agnostic icon platform. It defines portable immutable icons and collections,
provides deterministic SVG rendering, supports explicit catalogue workflows, and can adopt
reviewed external artwork into editable TypeScript. No portable Aster value requires a browser,
DOM, framework, command-line host, or repository tool.

## Product composition

| Boundary | Maturity | Project role |
| --- | --- | --- |
| [`@aster/core`](../packages/core/index.md) | Pre-release | Defines and constructs the portable icon and collection model. |
| [`@aster/icons`](../packages/icons/index.md) | Experimental | Publishes canonical TypeScript-first icons and explicit collection aggregates. |
| [`@aster/svg`](../packages/svg/index.md) | Pre-release | Renders portable definitions as deterministic standalone SVG markup. |
| [`@aster/cli`](../packages/cli/index.md) | Pre-release | Provides host-neutral catalogue commands and a thin standalone Node executable. |
| [`@aster/import`](../packages/import/index.md) | Private | Adopts explicit external sources into portable definitions and editable TypeScript. |
| [Repository tooling](../tooling/index.md) | Private | Verifies and maintains this repository without entering production package graphs. |

Collection documentation is a curatorial authority, not another package boundary. The
[collection index](../collections/index.md) records accepted collection identities, authorship,
visual rules, provenance, and evidence; `@aster/icons` owns their distributable TypeScript values.

## Dependency direction

The production graph points towards Core and contains no dependency on repository tooling:

```text
@aster/icons ----------------> @aster/core <---------------- @aster/svg
                                    ^
                                    |
@aster/import ----------------------+----> xmlsax-typescript

@aster/cli ----> @aster/core
      +--------> @aster/icons
      +--------> @aster/svg
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

Aster has no stable public release. Public package manifests remain at `0.0.0`, Icons is an
experimental catalogue, and Import is deliberately private. Current package and workflow checks
prove development conformance but do not constitute a compatibility promise to external
consumers.

When publication begins, independently installable packages will own separate Semantic Versioning
sequences and coordinate only where their dependency contracts require it. The complete
cross-package posture is defined by [Versioning and Releases](versioning.md).

## External integration direction

Lilium, Lotus, Flora, and other consumers may integrate through optional adapters built against
stable public Aster contracts. Portable Aster packages do not depend on those products or acquire
their framework, component, DOM, or plugin semantics. Prospective integrations remain proposals
until their activation conditions are met in [Future Capabilities](../future-capabilities.md).

## Documentation map

- [Packages](../packages/index.md) own production responsibilities, APIs, workflows, quality, and
  distribution evidence.
- [Repository Tooling](../tooling/index.md) owns private verification and maintenance behaviour.
- [Collections](../collections/index.md) own curatorial identity, design rules, provenance, and
  review evidence.
- [Future Capabilities](../future-capabilities.md) records proposals and activation triggers; it
  does not define current product guarantees.
- [Versioning and Releases](versioning.md) owns cross-package maturity, compatibility, and release
  coordination.
