import { Icon } from "@aster/core";
import { asterIconAuthoring } from "../shared/constants/aster-icon-authoring.constant.js";

/**
 * @description Canonical portable definition for the Aster arrow-up icon.
 */
export const ArrowUp = Icon.define({
  identity: {
    namespace: asterIconAuthoring.namespace,
    name: "arrow-up",
  },
  viewBox: asterIconAuthoring.viewBox,
  nodes: [
    { kind: "line", x1: 12, y1: 20, x2: 12, y2: 4 },
    {
      kind: "polyline",
      points: [
        { x: 6, y: 10 },
        { x: 12, y: 4 },
        { x: 18, y: 10 },
      ],
    },
  ],
  metadata: {
    displayName: "Arrow Up",
    tags: ["arrow", "navigation", "top", "up"],
    rtl: "preserve",
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
