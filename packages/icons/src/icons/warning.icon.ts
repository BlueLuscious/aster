import { Icon } from "@aster/core";
import {
  amellusIconAuthoringProfile,
} from "../authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../authoring/constants/aster-original-icon-authorship.constant.js";

/**
 * @description Canonical portable definition for the Aster warning icon.
 */
export const Warning = Icon.define({
  identity: {
    namespace: asterOriginalIconAuthorship.namespace,
    name: "warning",
  },
  viewBox: amellusIconAuthoringProfile.viewBox,
  nodes: [
    {
      kind: "polygon",
      points: [
        { x: 12, y: 3 },
        { x: 22, y: 21 },
        { x: 2, y: 21 },
      ],
    },
    { kind: "line", x1: 12, y1: 9, x2: 12, y2: 14.5 },
    { kind: "circle", cx: 12, cy: 18, radius: 0.5 },
  ],
  metadata: {
    displayName: "Warning",
    tags: ["alert", "attention", "caution", "warning"],
    rtl: "preserve",
    presentation: amellusIconAuthoringProfile.presentation,
    licence: asterOriginalIconAuthorship.licence,
    attribution: asterOriginalIconAuthorship.attribution,
    deprecated: false,
  },
});
