# Packages

Status: **Accepted**

This directory documents Aster's real package set and dependency relationships. Package-specific
documentation is added only when its package exists under `packages/`.

The current package set is:

| Package | Status | Responsibility |
| --- | --- | --- |
| [`@aster/core`](core/index.md) | Pre-release | Portable icon definitions, immutable construction, and render-neutral contracts. |
| [`@aster/build`](build/index.md) | Private | Build-time source, diagnostic, parsing, validation, normalisation, and generation domain services. |
| [`@aster/icons`](icons/index.md) | Experimental | Canonical portable definitions for the Aster pilot collection. |
| [`@aster/svg`](svg/index.md) | Experimental | Framework-independent standalone SVG rendering contracts. |

Accepted responsibilities and dependency direction are defined by
[Product and Package Boundaries](../architecture/product-and-package-boundaries.md).

Each package document covers:

- public responsibility and explicit non-responsibilities;
- features and internal composition;
- runtime and development dependencies;
- root and subpath exports;
- contracts, types, APIs, and implemented flows;
- target, compatibility, testing, and generation boundaries.

Feature documentation mirrors the real package-relative feature path as defined by
[Documentation Policy](../governance/documentation-policy.md).
