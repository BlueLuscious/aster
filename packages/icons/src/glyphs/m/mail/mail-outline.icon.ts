import { Icon } from "@luscious-garden/aster-core";
import {
  amellusIconAuthoringProfile,
} from "../../../authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../../../authoring/constants/aster-original-icon-authorship.constant.js";

/**
 * @description Canonical portable Outline definition for the Aster mail glyph.
 */
export const MailOutline = Icon.define({
  identity: {
    variant: "outline",
    namespace: asterOriginalIconAuthorship.namespace,
    name: "mail",
  },
  viewBox: amellusIconAuthoringProfile.viewBox,
  nodes: [
    {
      kind: "rect",
      x: 3,
      y: 5,
      width: 18,
      height: 14,
      radiusX: 2,
      radiusY: 2,
    },
    {
      kind: "polyline",
      points: [
        { x: 4, y: 7 },
        { x: 12, y: 13 },
        { x: 20, y: 7 },
      ],
    },
  ],
  metadata: {
    displayName: "Mail Outline",
    tags: ["email", "envelope", "inbox", "mail", "message"],
    rtl: "preserve",
    presentation: amellusIconAuthoringProfile.presentations.outline,
    licence: asterOriginalIconAuthorship.licence,
    attribution: asterOriginalIconAuthorship.attribution,
    deprecated: false,
  },
});
