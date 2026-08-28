# Product and Package Boundaries

Status: **Accepted**

Aster is a framework-agnostic icon platform. Portable definitions remain usable without a DOM,
browser, Node host, Lilium, Lotus, or repository tooling.

## Current packages

| Package | Responsibility | Dependency direction |
| --- | --- | --- |
| `@aster/core` | Portable immutable icon and collection contracts and construction. | Foundation; no Aster package dependency. |
| `@aster/icons` | Canonical TypeScript-first icons and explicit collections. | Depends on Core. |
| `@aster/svg` | Deterministic standalone SVG markup rendering. | Depends on Core. |
| `@aster/cli` | Host-neutral catalogue commands plus a thin Node executable host. | Depends on public packages selected by its workflows. |
| `@aster/import` | Private host-independent adoption of explicit external sources. | Depends on Core and its private parser dependency. |

Repository tooling may coordinate built public packages but no production package may import it.

## Data flow

```text
TypeScript authoring ----------------------> @aster/core definitions
external source + reviewed Core metadata --> @aster/import --> editable .icon.ts
@aster/core definition --------------------> @aster/svg --> SVG markup
installed catalogues ----------------------> @aster/cli --> structured plans or host effects
```

Import is optional. Ordinary Core, Icons, SVG, and CLI workflows do not require it.

## Dependency rules

- Core never depends on renderers, collections, Import, CLI, frameworks, or tooling.
- Icons depends only on Core in production.
- SVG depends only on Core in production.
- Import cannot depend on Icons, SVG, CLI, repository tooling, frameworks, or host APIs.
- Public packages cannot import private implementation paths from another package.
- Filesystem-relative imports cannot cross package boundaries.

## Import and host effects

Import receives source and metadata explicitly and returns Aster-owned immutable results. A future
CLI command may host source acquisition and output commitment, but those effects do not move into
Import. The accepted boundary is recorded by
[Private External-source Adoption Compiler](../decisions/0011-private-external-source-adoption-compiler.md).

## External ecosystems

Lilium, Lotus, Flora, and Aster remain independent products. Optional adapters may depend on stable
public contracts in one direction; no portable Aster package acquires framework or component
semantics.

A future Lilium adapter requires stable Aster and Lilium contracts, exact target-independent and
DOM-specific boundaries, and end-to-end conformance. Empty adapter packages are not created.
