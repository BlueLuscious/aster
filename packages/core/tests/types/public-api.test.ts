import { Icon } from "../../src/index.js";
import type { IconDefinition } from "../../src/index.js";

const camera = Icon.define({
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

const acceptedDefinition: IconDefinition = camera;

Icon.define({
  ...camera,
  // @ts-expect-error The public API accepts no target-specific definition fields.
  renderer: "svg",
});

void acceptedDefinition;
