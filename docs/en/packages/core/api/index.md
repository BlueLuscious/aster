# Core API

Status: **Accepted**

The API feature exposes the smallest public construction authority for portable icon values. It
owns one private `IconDefinitionFactory` instance and presents it through an immutable object.

## Contract

| Contract | Responsibility | Relations |
| --- | --- | --- |
| `IconApi` | Declares `define()` as the complete public value authority. | Accepts and returns `IconDefinition`. |

## Value

| Value | Members | Responsibility |
| --- | --- | --- |
| `Icon` | `define()` | Validates authored data and returns an isolated deeply frozen definition. |

`Icon` is frozen and retains no icon, collection, or catalogue state. Calling `define()` twice
with equal authored values creates independent equal definitions.

The API provides compile-time guidance through `IconDefinition`, while its internal factory
accepts an unknown runtime value and validates it before reading the closed shape. TypeScript
annotations are therefore never treated as runtime evidence.

## Usage

```ts
import { Icon } from "@aster/core";

const Camera = Icon.define({
  identity: {
    collection: "minimal",
    name: "camera",
  },
  viewBox: {
    minX: 0,
    minY: 0,
    width: 24,
    height: 24,
  },
  nodes: [
    {
      kind: "circle",
      cx: 12,
      cy: 12,
      radius: 4,
    },
  ],
  metadata: {
    displayName: "Camera",
    rtl: "preserve",
    presentation: {
      defaults: {
        fill: "none",
        stroke: "currentColor",
      },
      overrides: ["stroke"],
    },
    deprecated: false,
  },
});
```

The accepted value is plain readonly data. Consumers inspect `identity`, `viewBox`, `nodes`, and
`metadata` directly; no inspection facade or instance registry is required.

## Package exports

`@aster/core` approves only its root `"."` export. The root provides `Icon`, documented frozen
portable runtime authorities, and all public contracts and types.

No feature, runtime, manager, normaliser, error, or shared implementation subpath is public.
Unsupported subpaths fail through the package resolver rather than becoming compatibility
contracts accidentally.

The exact runtime value surface is:

- `Icon`;
- `iconDirections`;
- `iconNodeKinds`;
- `iconPaintSchema`;
- `iconPresentationEnumerations`;
- `iconPresentationOverrideOrder`;
- `iconRtlPolicies`;
- `iconTechnicalPresentation`.

The package is native ES2022 ESM and declares its modules free of observable import side effects.
This makes the export graph compatible with static consumer analysis without promising
bundler-specific tree-shaking behaviour.

## Failure

Invalid authored data raises the deterministic error documented by
[Immutable Definition Runtime](../definition/runtime/index.md). The error implementation is not a
separate package export.
