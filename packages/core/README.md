# @luscious-garden/aster-core

Dependency-free ES2022 ESM contracts and immutable construction for portable, render-neutral icons
and collections. Definitions are data, not renderers or mutable registries.

## Usage

Examples follow the [current source contract](https://github.com/BlueLuscious/aster/blob/master/docs/en/index.md#source-and-published-versions).

```sh
pnpm add @luscious-garden/aster-core
```

```ts
import { Collection, Icon } from "@luscious-garden/aster-core";

const Disc = Icon.define({
  identity: { namespace: "example", name: "disc", variant: "outline" },
  viewBox: { minX: 0, minY: 0, width: 24, height: 24 },
  nodes: [{ kind: "circle", cx: 12, cy: 12, radius: 4 }],
  metadata: {
    displayName: "Disc",
    rtl: "preserve",
    presentation: { defaults: { fill: "none", stroke: "currentColor" }, overrides: [] },
    deprecated: false,
  },
});

const InterfaceIcons = Collection.define({
  identity: { name: "interface-icons" },
  icons: { disc: { outline: Disc } },
  metadata: { displayName: "Interface Icons" },
});
```

The collection exposes the same definition through `InterfaceIcons.icons.disc.outline` and its ordered
`members` view. [Construction](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/core/workflow.md)
owns validation and immutability guarantees.

See the [identity migration](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/core/definition/index.md#explicit-treatment-migration)
and [grouped membership migration](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/core/collection/index.md#grouped-membership-migration)
when updating earlier authored data.

For repeated use, construct once and share the returned definition; see
[definition reuse](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/core/definition/runtime/index.md#reusing-definitions).

## Documentation

- [Package guide](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/core/index.md): exports, contracts and feature guides.
- [Version history](https://github.com/BlueLuscious/aster/blob/master/docs/en/packages/core/releases/index.md): changes and migrations.

## Licence

Software and documentation follow [ISC](LICENSE).
