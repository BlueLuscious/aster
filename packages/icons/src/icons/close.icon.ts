import { Icon } from "@aster/core";
import {
  amellusIconAuthoringProfile,
} from "../authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../authoring/constants/aster-original-icon-authorship.constant.js";

/**
 * @description Canonical portable definition for the Aster close icon.
 */
export const Close = Icon.define({
  identity: {
    namespace: asterOriginalIconAuthorship.namespace,
    name: "close",
  },
  viewBox: amellusIconAuthoringProfile.viewBox,
  nodes: [
    { kind: "line", x1: 5, y1: 5, x2: 19, y2: 19 },
    { kind: "line", x1: 19, y1: 5, x2: 5, y2: 19 },
  ],
  metadata: {
    displayName: "Close",
    tags: ["cancel", "close", "dismiss", "remove", "x"],
    rtl: "preserve",
    presentation: amellusIconAuthoringProfile.presentation,
    licence: asterOriginalIconAuthorship.licence,
    attribution: asterOriginalIconAuthorship.attribution,
    deprecated: false,
  },
});
