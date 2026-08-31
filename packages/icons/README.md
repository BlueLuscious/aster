# @aster/icons

Canonical portable TypeScript icon and collection definitions for Aster.

The package depends only on `@aster/core`. It provides one isolated public subpath per icon and
explicit immutable root indexes for complete icon and collection discovery. It contains no
renderer, framework, DOM, filesystem, Import, or global catalogue dependency.
The example below assumes `@aster/svg` is installed independently by the consumer.

```ts
import { ArrowLeft } from "@aster/icons/arrow-left";
import { Svg } from "@aster/svg";

const markup = Svg.render(ArrowLeft);
```

The collection remains Experimental while its representative set and visual rules are reviewed.
See the [canonical package documentation](../../docs/en/packages/icons/index.md) and
[Aster collection authority](../../docs/en/collections/aster/index.md).

## Licence

This package is licensed under the terms in [LICENSE](LICENSE).
