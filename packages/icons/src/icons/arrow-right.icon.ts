import { Icon } from "@aster/core";
import { asterIconAuthoring } from "../shared/constants/aster-icon-authoring.constant.js";

/**
 * @description Canonical portable definition for the Aster arrow-right icon.
 */
export const ArrowRight = Icon.define({
  identity: {
    namespace: asterIconAuthoring.namespace,
    name: "arrow-right",
  },
  viewBox: asterIconAuthoring.viewBox,
  nodes: [
    { kind: "line", x1: 4, y1: 12, x2: 20, y2: 12 },
    {
      kind: "polyline",
      points: [
        { x: 14, y: 6 },
        { x: 20, y: 12 },
        { x: 14, y: 18 },
      ],
    },
  ],
  metadata: {
    displayName: "Arrow Right",
    tags: ["arrow", "forward", "navigation", "next", "right"],
    rtl: "mirror",
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
