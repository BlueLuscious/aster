# @aster/icons

Canonical portable TypeScript icon and collection definitions for Aster.

The package depends only on `@aster/core`. Its root provides named icons and the complete immutable
icon index. Collections use a separate public family, while every icon and collection also retains
an isolated public subpath. It contains no renderer, framework, DOM, filesystem, Import, or global
catalogue dependency.
The example below assumes `@aster/svg` is installed independently by the consumer.

Canonical `*.icon.ts` and `*.collection.ts` modules are editable sources. Package builds
deterministically synchronise their generated barrels and immutable aggregate indexes before
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
