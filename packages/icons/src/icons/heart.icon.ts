import { Icon } from "@aster/core";
import {
  amellusIconAuthoringProfile,
} from "../authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../authoring/constants/aster-original-icon-authorship.constant.js";

/**
 * @description Canonical portable definition for the Aster heart icon.
 */
export const Heart = Icon.define({
  identity: {
    namespace: asterOriginalIconAuthorship.namespace,
    name: "heart",
  },
  viewBox: amellusIconAuthoringProfile.viewBox,
  nodes: [
    {
      kind: "path",
      commands: [
        { kind: "move", x: 12, y: 21 },
        {
          kind: "cubic-bezier",
          control1X: 10.5,
          control1Y: 20,
          control2X: 3,
          control2Y: 15.5,
          x: 3,
          y: 9.5,
        },
        {
          kind: "cubic-bezier",
          control1X: 3,
          control1Y: 6.5,
          control2X: 5,
          control2Y: 4,
          x: 8,
          y: 4,
        },
        {
          kind: "cubic-bezier",
          control1X: 10,
          control1Y: 4,
          control2X: 11,
          control2Y: 5,
          x: 12,
          y: 6.5,
        },
        {
          kind: "cubic-bezier",
          control1X: 13,
          control1Y: 5,
          control2X: 14,
          control2Y: 4,
          x: 16,
          y: 4,
        },
        {
          kind: "cubic-bezier",
          control1X: 19,
          control1Y: 4,
          control2X: 21,
          control2Y: 6.5,
          x: 21,
          y: 9.5,
        },
        {
          kind: "cubic-bezier",
          control1X: 21,
          control1Y: 15.5,
          control2X: 13.5,
          control2Y: 20,
          x: 12,
          y: 21,
        },
        { kind: "close" },
      ],
    },
  ],
  metadata: {
    displayName: "Heart",
    tags: ["favourite", "heart", "like", "love"],
    rtl: "preserve",
    presentation: amellusIconAuthoringProfile.presentation,
    licence: asterOriginalIconAuthorship.licence,
    attribution: asterOriginalIconAuthorship.attribution,
    deprecated: false,
  },
});
