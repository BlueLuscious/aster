import { Icon } from "@luscious-garden/aster-core";
import {
  amellusIconAuthoringProfile,
} from "../../../authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../../../authoring/constants/aster-original-icon-authorship.constant.js";

/**
 * @description Canonical portable Outline definition for the Aster info glyph.
 */
export const InfoOutline = Icon.define({
  identity: {
    variant: "outline",
    namespace: asterOriginalIconAuthorship.namespace,
    name: "info",
  },
  viewBox: amellusIconAuthoringProfile.viewBox,
  nodes: [
    { kind: "circle", cx: 12, cy: 12, radius: 9 },
    { kind: "circle", cx: 12, cy: 7, radius: 0.5 },
    { kind: "line", x1: 12, y1: 11, x2: 12, y2: 17 },
  ],
  metadata: {
    displayName: "Info Outline",
    tags: ["about", "help", "info", "information"],
    rtl: "preserve",
    presentation: amellusIconAuthoringProfile.presentations.outline,
    licence: asterOriginalIconAuthorship.licence,
    attribution: asterOriginalIconAuthorship.attribution,
    deprecated: false,
  },
});
