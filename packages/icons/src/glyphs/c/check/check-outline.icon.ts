import { Icon } from "@luscious-garden/aster-core";
import {
  amellusIconAuthoringProfile,
} from "../../../authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../../../authoring/constants/aster-original-icon-authorship.constant.js";

/**
 * @description Canonical portable Outline definition for the Aster check glyph.
 */
export const CheckOutline = Icon.define({
  identity: {
    variant: "outline",
    namespace: asterOriginalIconAuthorship.namespace,
    name: "check",
  },
  viewBox: amellusIconAuthoringProfile.viewBox,
  nodes: [
    {
      kind: "polyline",
      points: [
        { x: 4, y: 12.5 },
        { x: 9.5, y: 18 },
        { x: 20, y: 6 },
      ],
    },
  ],
  metadata: {
    displayName: "Check Outline",
    tags: ["check", "complete", "confirm", "done", "success"],
    rtl: "preserve",
    presentation: amellusIconAuthoringProfile.presentations.outline,
    licence: asterOriginalIconAuthorship.licence,
    attribution: asterOriginalIconAuthorship.attribution,
    deprecated: false,
  },
});
