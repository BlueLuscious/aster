import { Icon } from "@luscious-garden/aster-core";
import {
  amellusIconAuthoringProfile,
} from "../../../authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../../../authoring/constants/aster-original-icon-authorship.constant.js";

/**
 * @description Canonical portable Outline definition for the Aster arrow-left glyph.
 */
export const ArrowLeftOutline = Icon.define({
  identity: {
    variant: "outline",
    namespace: asterOriginalIconAuthorship.namespace,
    name: "arrow-left",
  },
  viewBox: amellusIconAuthoringProfile.viewBox,
  nodes: [
    { kind: "line", x1: 20, y1: 12, x2: 4, y2: 12 },
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
    displayName: "Arrow Left Outline",
    tags: ["arrow", "back", "left", "navigation", "previous"],
    rtl: "mirror",
    presentation: amellusIconAuthoringProfile.presentations.outline,
    licence: asterOriginalIconAuthorship.licence,
    attribution: asterOriginalIconAuthorship.attribution,
    deprecated: false,
  },
});
