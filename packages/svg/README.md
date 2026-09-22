# @luscious-garden/aster-svg

Framework-independent SVG rendering for portable Aster icon definitions.

When `0.1.0` is published, install the exact candidate version with
`pnpm add @luscious-garden/aster-core@0.1.0 @luscious-garden/aster-svg@0.1.0` to author and render definitions directly.

```ts
import { Icon } from "@luscious-garden/aster-core";
import { Svg } from "@luscious-garden/aster-svg";

const Camera = Icon.define({
  identity: { namespace: "consumer", name: "camera" },
  viewBox: { minX: 0, minY: 0, width: 24, height: 24 },
  nodes: [{ kind: "circle", cx: 12, cy: 12, radius: 4 }],
  metadata: {
    displayName: "Camera",
    rtl: "preserve",
    presentation: {
      defaults: { fill: "none", stroke: "currentColor" },
      overrides: [],
    },
    deprecated: false,
  },
});

const markup = Svg.render(Camera, {
  size: 24,
  label: "Camera",
});
```

See the [canonical package documentation](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/svg/index.md) and
[initial release notes](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/svg/releases.md) for
responsibilities, exports, and rendering semantics.

## Licence

This package is licensed under the terms in [LICENSE](LICENSE).
