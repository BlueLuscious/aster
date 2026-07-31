import { Icon } from "@aster/core";
import { asterIconAuthoring } from "../shared/constants/aster-icon-authoring.constant.js";

/**
 * @description Canonical portable definition for the Aster arrow-left icon.
 */
export const ArrowLeft = Icon.define({
  identity: {
    namespace: asterIconAuthoring.namespace,
    name: "arrow-left",
  },
  viewBox: asterIconAuthoring.viewBox,
  nodes: [
    {
      kind: "line",
      x1: 20,
      y1: 12,
      x2: 4,
      y2: 12,
    },
    {
      kind: "polyline",
      points: [
        { x: 10, y: 6 },
        { x: 4, y: 12 },
        { x: 10, y: 18 },
      ],
    },
  ],
  metadata: {
    displayName: "Arrow Left",
    tags: ["arrow", "back", "left", "navigation", "previous"],
    rtl: "mirror",
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
