# @aster/icons

Canonical portable TypeScript icon and collection definitions for Aster.

The package depends only on `@aster/core`. Every icon and collection has an isolated public
subpath; no package-wide definition root is exported. `@aster/icons/manifest` provides metadata-only discovery without
loading complete definitions, while `@aster/icons/dynamic` resolves identities asynchronously
without eager catalogue evaluation. The package contains no renderer, framework, DOM, filesystem,
Import, or global catalogue dependency.
The example below assumes `@aster/svg` is installed independently by the consumer.

Canonical `*.icon.ts` and `*.collection.ts` modules are editable sources. Package builds
deterministically synchronise their manifests, exact loader maps and stable public facades before
compilation.

```ts
import { ArrowLeft } from "@aster/icons/arrow-left";
import { Svg } from "@aster/svg";

const markup = Svg.render(ArrowLeft);
```

The package currently provides the accepted Amellus foundational collection. See the
[canonical package documentation](../../docs/en/packages/icons/index.md),
[authoring workflow](../../docs/en/packages/icons/workflow.md) and
[Amellus collection authority](../../docs/en/collections/amellus/index.md).

## Licence

This package is licensed under the terms in [LICENSE](LICENSE).
