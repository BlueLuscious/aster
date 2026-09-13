import { Icon } from "@aster/core";
import {
  amellusIconAuthoringProfile,
} from "../authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../authoring/constants/aster-original-icon-authorship.constant.js";

/**
 * @description Canonical portable definition for the Aster bell icon.
 */
export const Bell = Icon.define({
  identity: {
    namespace: asterOriginalIconAuthorship.namespace,
    name: "bell",
  },
  viewBox: amellusIconAuthoringProfile.viewBox,
  nodes: [
    {
      kind: "path",
      commands: [
        { kind: "move", x: 5, y: 18 },
        { kind: "line", x: 6.5, y: 16 },
        { kind: "line", x: 6.5, y: 10.5 },
        {
          kind: "arc",
          radiusX: 5.5,
          radiusY: 5.5,
          rotation: 0,
          largeArc: false,
          sweep: true,
          x: 17.5,
          y: 10.5,
        },
        { kind: "line", x: 17.5, y: 16 },
        { kind: "line", x: 19, y: 18 },
        { kind: "close" },
      ],
    },
    { kind: "line", x1: 10, y1: 20, x2: 14, y2: 20 },
  ],
  metadata: {
    displayName: "Bell",
    tags: ["alert", "bell", "notification"],
    rtl: "preserve",
    presentation: amellusIconAuthoringProfile.presentation,
    licence: asterOriginalIconAuthorship.licence,
    attribution: asterOriginalIconAuthorship.attribution,
    deprecated: false,
  },
});
