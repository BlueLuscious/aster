import { Icon } from "@luscious-garden/aster-core";
import {
  amellusIconAuthoringProfile,
} from "../../../authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../../../authoring/constants/aster-original-icon-authorship.constant.js";

/**
 * @description Canonical portable Outline definition for the Aster close glyph.
 */
export const CloseOutline = Icon.define({
  identity: {
    variant: "outline",
    namespace: asterOriginalIconAuthorship.namespace,
    name: "close",
  },
  viewBox: amellusIconAuthoringProfile.viewBox,
  nodes: [
    { kind: "line", x1: 5, y1: 5, x2: 19, y2: 19 },
    { kind: "line", x1: 19, y1: 5, x2: 5, y2: 19 },
  ],
  metadata: {
    displayName: "Close Outline",
    tags: ["cancel", "close", "dismiss", "remove", "x"],
    rtl: "preserve",
    presentation: amellusIconAuthoringProfile.presentations.outline,
    licence: asterOriginalIconAuthorship.licence,
    attribution: asterOriginalIconAuthorship.attribution,
    deprecated: false,
  },
});
