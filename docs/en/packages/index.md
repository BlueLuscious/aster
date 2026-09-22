# Packages

Status: **Accepted**

This directory documents Aster's real package set and dependency relationships. Package-specific
documentation is added only when its package exists under `packages/`.

The current package set is:

| Package | Status | Responsibility |
| --- | --- | --- |
| [`@luscious-garden/aster-core`](core/index.md) | Pre-release | Independent portable icon and collection definitions, immutable construction, and render-neutral contracts. |
| [`@luscious-garden/aster-import`](import/index.md) | Private | Host-independent adoption of external icon sources into portable definitions and editable TypeScript. |
| [`@luscious-garden/aster-icons`](icons/index.md) | Pre-release | Accepted canonical portable icons and the opt-in Amellus collection aggregate. |
| [`@luscious-garden/aster-svg`](svg/index.md) | Pre-release | Hardened framework-independent standalone SVG rendering. |
| [`@luscious-garden/aster-cli`](cli/index.md) | Pre-release | Host-neutral command execution, explicit catalogue discovery, deterministic SVG export planning, and a thin standalone Node output host. |

The accepted production dependency direction is:

```text
@luscious-garden/aster-core <---- @luscious-garden/aster-icons
      ^
      +---------- @luscious-garden/aster-svg
      +---------- @luscious-garden/aster-import ----> xmlsax-typescript
      ^                  (private)
      |
@luscious-garden/aster-cli ------> @luscious-garden/aster-icons
      |
      +----------> @luscious-garden/aster-svg
```

Core is the portable foundation and has no runtime dependency. Icons and SVG depend only on its
public root. Private Import depends on Core plus its contained XML parser adapter. CLI consumes
the public Core, Icons and SVG roots to provide catalogue and export workflows. No portable or
rendering package depends on CLI or Import, and no package imports repository tooling.

Each package document covers:

- public responsibility and explicit non-responsibilities;
- features and internal composition;
- runtime and development dependencies;
- root and subpath exports;
- contracts, types, APIs, and implemented flows;
- target, compatibility, testing, and generation boundaries.

Feature documentation mirrors each real package-relative feature path when that feature owns a
stable responsibility. Layer-only directories such as `runtime/`, `contracts/` and `types/` may
be described by their owning feature document unless their composition requires a dedicated
subdocument.
