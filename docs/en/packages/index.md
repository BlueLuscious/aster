# Packages

Status: **Accepted**

This directory owns Aster's real package set and production dependency relationships. Each package
guide owns its APIs, features, exports, workflows and conformance; its release history owns version
changes and migrations.

| Package | Distribution | Responsibility |
| --- | --- | --- |
| [Core](core/index.md) | Published | Portable icon/collection definitions, immutable construction and render-neutral contracts. |
| [Icons](icons/index.md) | Published | Canonical artwork, isolated imports, explicit collections and lightweight discovery. |
| [SVG](svg/index.md) | Published | Framework-independent standalone SVG rendering. |
| [CLI](cli/index.md) | Published | Host-neutral catalogue commands, export/review planning and a standalone Node host. |
| [Import](import/index.md) | Private | Adoption of acquired external sources into portable definitions and editable TypeScript. |

## Production dependencies

Arrows point from a package to its direct runtime dependencies:

```text
CLI    -> Core, Icons, SVG
Icons  -> Core
SVG    -> Core
Import -> Core, xmlsax-typescript
Core   -> (none)
```

Cross-package code uses public exports, never implementation paths. Import's XML dependency remains
behind its private parser adapter. No package depends on repository tooling, and the portable,
artwork and rendering packages do not depend on CLI or Import. Runtime and development dependencies
are distinct; manifests and the [architecture verifier](../tooling/architecture/index.md) establish
their exact boundaries.

## Documentation ownership

A package introduction identifies responsibility, exports and useful navigation. Feature guides
describe their contracts, types and implemented behaviour. Dedicated runtime subdocuments exist
only where composition needs its own explanation; ordinary layer directories do not require
additional pages.

Quality records own acceptance evidence, comparison baselines own measurements, and histories own
release-specific facts. [Versioning](../project/versioning.md) governs compatibility across packages;
[publication records](../project/publications/index.md) retain verification of distributed combinations.
