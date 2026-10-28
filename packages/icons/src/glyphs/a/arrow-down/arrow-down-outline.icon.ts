import { Icon } from "@luscious-garden/aster-core";
import {
  amellusIconAuthoringProfile,
} from "../../../authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../../../authoring/constants/aster-original-icon-authorship.constant.js";

/**
 * @description Canonical portable Outline definition for the Aster arrow-down glyph.
 */
export const ArrowDownOutline = Icon.define({
  identity: {
    variant: "outline",
    namespace: asterOriginalIconAuthorship.namespace,
    name: "arrow-down",
  },
  viewBox: amellusIconAuthoringProfile.viewBox,
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
    displayName: "Arrow Down Outline",
    tags: ["arrow", "bottom", "down", "navigation"],
    rtl: "preserve",
    presentation: amellusIconAuthoringProfile.presentations.outline,
    licence: asterOriginalIconAuthorship.licence,
    attribution: asterOriginalIconAuthorship.attribution,
    deprecated: false,
  },
});
