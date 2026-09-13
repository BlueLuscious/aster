import { Icon } from "@aster/core";
import {
  amellusIconAuthoringProfile,
} from "../authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../authoring/constants/aster-original-icon-authorship.constant.js";

/**
 * @description Canonical portable definition for the Aster leaf icon.
 */
export const Leaf = Icon.define({
  identity: {
    namespace: asterOriginalIconAuthorship.namespace,
    name: "leaf",
  },
  viewBox: amellusIconAuthoringProfile.viewBox,
  nodes: [
    {
      kind: "path",
      commands: [
        { kind: "move", x: 20.5, y: 3.5 },
        {
          kind: "cubic-bezier",
          control1X: 12,
          control1Y: 3.5,
          control2X: 5,
          control2Y: 7.5,
          x: 5,
          y: 14,
        },
        {
          kind: "cubic-bezier",
          control1X: 5,
          control1Y: 17.5,
          control2X: 7.5,
          control2Y: 20,
          x: 11,
          y: 20,
        },
        {
          kind: "cubic-bezier",
          control1X: 17.5,
          control1Y: 20,
          control2X: 20.5,
          control2Y: 13,
          x: 20.5,
          y: 3.5,
        },
        { kind: "close" },
      ],
    },
    {
      kind: "path",
      commands: [
        { kind: "move", x: 7, y: 18 },
        {
          kind: "cubic-bezier",
          control1X: 10,
          control1Y: 14,
          control2X: 13.5,
          control2Y: 11,
          x: 18,
          y: 7.5,
        },
      ],
    },
  ],
  metadata: {
    displayName: "Leaf",
    tags: ["environment", "leaf", "nature", "plant"],
    rtl: "preserve",
    presentation: amellusIconAuthoringProfile.presentation,
    licence: asterOriginalIconAuthorship.licence,
    attribution: asterOriginalIconAuthorship.attribution,
    deprecated: false,
  },
});
