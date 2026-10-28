import { Icon } from "@luscious-garden/aster-core";
import {
  amellusIconAuthoringProfile,
} from "../../../authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../../../authoring/constants/aster-original-icon-authorship.constant.js";

/**
 * @description Canonical portable Outline definition for the Aster user glyph.
 */
export const UserOutline = Icon.define({
  identity: {
    variant: "outline",
    namespace: asterOriginalIconAuthorship.namespace,
    name: "user",
  },
  viewBox: amellusIconAuthoringProfile.viewBox,
  nodes: [
    { kind: "circle", cx: 12, cy: 8, radius: 4 },
    {
      kind: "path",
      commands: [
        { kind: "move", x: 4, y: 21 },
        {
          kind: "cubic-bezier",
          control1X: 4,
          control1Y: 16.5,
          control2X: 7.5,
          control2Y: 14,
          x: 12,
          y: 14,
        },
        {
          kind: "cubic-bezier",
          control1X: 16.5,
          control1Y: 14,
          control2X: 20,
          control2Y: 16.5,
          x: 20,
          y: 21,
        },
      ],
    },
  ],
  metadata: {
    displayName: "User Outline",
    tags: ["account", "person", "profile", "user"],
    rtl: "preserve",
    presentation: amellusIconAuthoringProfile.presentations.outline,
    licence: asterOriginalIconAuthorship.licence,
    attribution: asterOriginalIconAuthorship.attribution,
    deprecated: false,
  },
});
