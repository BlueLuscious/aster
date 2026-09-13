import { Icon } from "@aster/core";
import {
  amellusIconAuthoringProfile,
} from "../authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../authoring/constants/aster-original-icon-authorship.constant.js";

/**
 * @description Canonical portable definition for the Aster download icon.
 */
export const Download = Icon.define({
  identity: {
    namespace: asterOriginalIconAuthorship.namespace,
    name: "download",
  },
  viewBox: amellusIconAuthoringProfile.viewBox,
  nodes: [
    { kind: "line", x1: 12, y1: 3, x2: 12, y2: 15 },
    {
      kind: "polyline",
      points: [
        { x: 7, y: 10 },
        { x: 12, y: 15 },
        { x: 17, y: 10 },
      ],
    },
    { kind: "line", x1: 5, y1: 20, x2: 19, y2: 20 },
  ],
  metadata: {
    displayName: "Download",
    tags: ["download", "save", "transfer"],
    rtl: "preserve",
    presentation: amellusIconAuthoringProfile.presentation,
    licence: asterOriginalIconAuthorship.licence,
    attribution: asterOriginalIconAuthorship.attribution,
    deprecated: false,
  },
});
