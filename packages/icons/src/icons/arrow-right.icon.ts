import { Icon } from "@aster/core";
import {
  amellusIconAuthoringProfile,
} from "../authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../authoring/constants/aster-original-icon-authorship.constant.js";

/**
 * @description Canonical portable definition for the Aster arrow-right icon.
 */
export const ArrowRight = Icon.define({
  identity: {
    namespace: asterOriginalIconAuthorship.namespace,
    name: "arrow-right",
  },
  viewBox: amellusIconAuthoringProfile.viewBox,
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
    presentation: amellusIconAuthoringProfile.presentation,
    licence: asterOriginalIconAuthorship.licence,
    attribution: asterOriginalIconAuthorship.attribution,
    deprecated: false,
  },
});
