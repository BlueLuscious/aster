# @luscious-garden/aster-core

Portable, render-neutral icon and collection contracts for Aster.

The package exposes portable contracts, frozen runtime vocabularies, and the immutable `Icon` and
`Collection` API objects. It ships as dependency-free ES2022 ESM with a single approved root
export.

Install this version with `pnpm add @luscious-garden/aster-core@0.1.0`.
This package has no runtime dependencies.

```ts
import { Icon } from "@luscious-garden/aster-core";

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

Collections support typed icon aliases and an ordered member list:

```ts
import { Collection } from "@luscious-garden/aster-core";

const InterfaceIcons = Collection.define({
  identity: { name: "interface-icons" },
  icons: { camera: Camera },
  metadata: { displayName: "Interface Icons" },
});

InterfaceIcons.icons.camera; // Known readonly alias.
InterfaceIcons.members; // Frozen ordered [Camera], derived once.
```

The [release notes](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/core/releases/index.md)
describe migration from earlier candidates. Definitions remain immutable data without lookup or
mutation methods.

See the [canonical package documentation](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/core/index.md) and
[release notes](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/core/releases/index.md) for
responsibilities, features, exports, and model relationships.

## Licence

This package is licensed under the terms in [LICENSE](LICENSE).
