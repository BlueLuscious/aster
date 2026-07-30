# @aster/svg

Framework-independent SVG rendering for portable Aster icon definitions.

```ts
import { Icon } from "@aster/core";
import { Svg } from "@aster/svg";

const Camera = Icon.define({
  // Portable identity, geometry, and metadata.
});

const markup = Svg.render(Camera, {
  size: 24,
  label: "Camera",
});
```

See the [canonical package documentation](../../docs/en/packages/svg/index.md) for
responsibilities, exports, and rendering semantics.

## Licence

This package is licensed under the terms in [LICENSE](LICENSE).
