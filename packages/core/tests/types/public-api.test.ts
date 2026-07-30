import {
  Collection,
  Icon,
  iconDirections,
  iconNodeKinds,
  iconPaintSchema,
  iconPresentationEnumerations,
  iconPresentationOverrideOrder,
  iconRtlPolicies,
  iconTechnicalPresentation,
} from "../../src/index.js";
import type {
  CollectionDefinition,
  IconDefinition,
} from "../../src/index.js";

const camera = Icon.define({
  identity: {
    namespace: "minimal",
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

const acceptedDefinition: IconDefinition = camera;
const collection = Collection.define({
  identity: {
    name: "minimal",
  },
  icons: [camera],
  metadata: {
    displayName: "Minimal",
    tags: ["interface-icons"],
  },
});
const acceptedCollection: CollectionDefinition = collection;
const pathKind: typeof iconNodeKinds.path = "path";
const direction: (typeof iconDirections)[number] = "rtl";
const rtlPolicy: (typeof iconRtlPolicies)[number] = "mirror";
const paintKeyword: (typeof iconPaintSchema.keywords)[number] = "currentColor";
const fillRule: (typeof iconPresentationEnumerations.fillRule)[number] = "evenodd";
const override: (typeof iconPresentationOverrideOrder)[number] = "strokeWidth";
const technicalFill = iconTechnicalPresentation.fill;

Icon.define({
  ...camera,
  // @ts-expect-error The public API accepts no target-specific definition fields.
  renderer: "svg",
});

void acceptedDefinition;
void acceptedCollection;
void pathKind;
void direction;
void rtlPolicy;
void paintKeyword;
void fillRule;
void override;
void technicalFill;
