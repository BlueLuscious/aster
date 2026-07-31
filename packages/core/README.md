# @aster/core

Portable, render-neutral icon and collection contracts for Aster.

The package exposes portable contracts, frozen runtime vocabularies, and the immutable `Icon` and
`Collection` API objects. It ships as dependency-free ES2022 ESM with a single approved root
export.

```ts
import { Icon } from "@aster/core";

const Camera = Icon.define({
  identity: { namespace: "minimal", name: "camera" },
  viewBox: { minX: 0, minY: 0, width: 24, height: 24 },
  nodes: [{ kind: "circle", cx: 12, cy: 12, radius: 4 }],
  metadata: {
    displayName: "Camera",
    rtl: "preserve",
    presentation: {
      defaults: { fill: "none", stroke: "currentColor" },
      overrides: ["stroke"],
    },
    deprecated: false,
  },
});
```

See the [canonical package documentation](../../docs/en/packages/core/index.md) for
responsibilities, features, exports, and model relationships.

## Licence

This package is licensed under the terms in [LICENSE](LICENSE).
