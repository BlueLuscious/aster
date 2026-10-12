# Core API

Status: **Accepted**

The API feature exposes frozen construction objects, each owning one private factory instance.
There is no instance registry or incremental mutation API.

## Contracts and values

| Contract | Operation | Responsibility and relations |
| --- | --- | --- |
| `IconApi` | `define(definition: IconDefinition): IconDefinition` | Describes the public `Icon` object; constructs one [portable definition](../definition/index.md). |
| `CollectionApi` | `define<TIconMap extends CollectionIconMap>(definition: CollectionDefinitionInput<TIconMap>): CollectionDefinition<TIconMap>` | Describes the public `Collection` object; preserves authored aliases while returning [canonical membership](../collection/index.md). |

TypeScript guides authoring; each factory validates unknown runtime input rather than treating an
annotation as evidence. Successful calls return deeply frozen plain data. Equal authored input
does not create a shared registry entry: separate construction calls produce independent results,
except for canonical icon references deliberately retained by collections.

## Usage

```ts
import { Collection, Icon } from "@luscious-garden/aster-core";

const Camera = Icon.define({
  identity: { namespace: "example", name: "camera" },
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

const InterfaceIcons = Collection.define({
  identity: { name: "interface-icons" },
  icons: { camera: Camera },
  metadata: { displayName: "Interface Icons" },
});

InterfaceIcons.icons.camera;
InterfaceIcons.members;
```

The two membership views contain the same canonical `Camera` object. Consumers inspect definition
fields directly; collection alias grammar, ordering, generic output and revalidation are owned by
[Collection](../collection/index.md).

## Package exports

Only the root `"."` export is public. Its exact runtime values are:

- `Collection`;
- `Icon`;
- `IconDefinitionError`;
- `iconDirections`;
- `iconNodeKinds`;
- `iconPaintSchema`;
- `iconPathCommandKinds`;
- `iconPresentationOverrideOrder`;
- `iconRtlPolicies`;
- `iconTechnicalPresentation`.

The root also exports the public contracts and types documented by the
[feature map](../index.md#documentation). Feature and implementation subpaths are unsupported,
even when their modules exist in the emitted distribution.

## Failure

Invalid ordinary authored data raises [`IconDefinitionError`](../shared/index.md#error).
Construction returns no partial definition. The
[trust boundary](../workflow.md#security-and-trust-boundary) distinguishes data validation from
caller-controlled execution.
