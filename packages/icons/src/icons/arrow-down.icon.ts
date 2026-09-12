import { Icon } from "@aster/core";
import { asterIconAuthoring } from "../shared/constants/aster-icon-authoring.constant.js";

/**
 * @description Canonical portable definition for the Aster arrow-down icon.
 */
export const ArrowDown = Icon.define({
  identity: {
    namespace: asterIconAuthoring.namespace,
    name: "arrow-down",
  },
  viewBox: asterIconAuthoring.viewBox,
  nodes: [
    { kind: "line", x1: 12, y1: 4, x2: 12, y2: 20 },
    {
      kind: "polyline",
      points: [
        { x: 6, y: 14 },
        { x: 12, y: 20 },
        { x: 18, y: 14 },
      ],
    },
  ],
  metadata: {
    displayName: "Arrow Down",
    tags: ["arrow", "bottom", "down", "navigation"],
    rtl: "preserve",
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
