# @aster/icons

Canonical portable TypeScript definitions for the Experimental Aster icon collection.

The package depends only on `@aster/core`. It provides one isolated public subpath per icon and
contains no renderer, framework, DOM, filesystem, Build, or global catalogue dependency.
The example below assumes `@aster/svg` is installed independently by the consumer.

```ts
import { ArrowLeft } from "@aster/icons/arrow-left";
import { Svg } from "@aster/svg";

const markup = Svg.render(ArrowLeft);
```

The collection remains Experimental while its representative set and visual rules are reviewed.
Canonical documentation lives under `docs/en/packages/icons/` and `docs/en/collections/aster/`.
