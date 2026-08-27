# Packages

Status: **Accepted**

This directory documents Aster's real package set and dependency relationships. Package-specific
documentation is added only when its package exists under `packages/`.

The current package set is:

| Package | Status | Responsibility |
| --- | --- | --- |
| [`@aster/core`](core/index.md) | Pre-release | Independent portable icon and collection definitions, immutable construction, and render-neutral contracts. |
| [`@aster/build`](build/index.md) | Private | Build-time source, diagnostic, parsing, validation, normalisation, and generation domain services. |
| [`@aster/icons`](icons/index.md) | Experimental | Canonical portable icons and opt-in collection aggregates for the Aster pilot. |
| [`@aster/svg`](svg/index.md) | Pre-release | Hardened framework-independent standalone SVG rendering. |
| [`@aster/cli`](cli/index.md) | Pre-release | Host-neutral command execution, explicit catalogue discovery, deterministic SVG export planning, and a thin standalone Node output host. |

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
