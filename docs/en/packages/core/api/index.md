# Core API

Status: **Accepted**

The API feature exposes frozen construction objects backed by private validation authorities.
There is no logical-identity registry or incremental mutation API.

## Contracts and values

| Contract | Operation | Responsibility and relations |
| --- | --- | --- |
| `IconApi` | `define(definition: IconDefinition): IconDefinition` | Describes the public `Icon` object; constructs one [portable definition](../definition/index.md). |
| `IconApi` | `variantPropertyName(variant: string): string` | Validates a treatment slug and derives its portable dictionary property; never selects a definition. |
| `CollectionApi` | `define<TIconMap extends CollectionIconMap>(definition: CollectionDefinitionInput<TIconMap>): CollectionDefinition<TIconMap>` | Describes the public `Collection` object; preserves authored aliases while returning [canonical membership](../collection/index.md). |

TypeScript guides authoring; each factory validates unknown runtime input rather than treating an
annotation as evidence. Successful calls return deeply frozen plain data. Equal authored input
does not create a shared logical-identity entry: fresh authored inputs produce independent results.
Passing an exact output recognised by the same Core copy returns that output unchanged. The
[definition runtime](../definition/runtime/index.md#recognised-outputs) owns recognition and
unknown-input handling; [Collection](../collection/index.md#runtime) owns additional leaf retention.

## Usage

```ts
import { Collection, Icon } from "@luscious-garden/aster-core";

const CameraOutline = Icon.define({
  identity: { namespace: "example", name: "camera", variant: "outline" },
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
  icons: { camera: { outline: CameraOutline } },
  metadata: { displayName: "Interface Icons" },
});

InterfaceIcons.icons.camera.outline;
InterfaceIcons.members;
```

The two membership views contain the same canonical `CameraOutline` object. Consumers inspect definition
fields directly; collection alias grammar, ordering, generic output and revalidation are owned by
[Collection](../collection/index.md).

`Icon.variantPropertyName("filled-dotted")` returns `"filledDotted"`. It trims and validates the
open treatment slug before retaining its first segment and capitalising subsequent segments.
Digit-led properties remain valid: `2-tone` becomes `2Tone`, while `01` stays `01`.
The mapping is not injective: `tone-1` and `tone1` both produce `tone1`. Dictionary owners must
reject collisions, never overwrite a selected treatment. Core imposes no closed style list.

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
