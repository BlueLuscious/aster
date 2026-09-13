import { Icon } from "@aster/core";
import {
  amellusIconAuthoringProfile,
} from "../authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../authoring/constants/aster-original-icon-authorship.constant.js";

/**
 * @description Canonical portable definition for the Aster pause icon.
 */
export const Pause = Icon.define({
  identity: {
    namespace: asterOriginalIconAuthorship.namespace,
    name: "pause",
  },
  viewBox: amellusIconAuthoringProfile.viewBox,
  nodes: [
    { kind: "line", x1: 8, y1: 5, x2: 8, y2: 19 },
    { kind: "line", x1: 16, y1: 5, x2: 16, y2: 19 },
  ],
  metadata: {
    displayName: "Pause",
    tags: ["hold", "media", "pause", "playback"],
    rtl: "preserve",
    presentation: amellusIconAuthoringProfile.presentation,
    licence: asterOriginalIconAuthorship.licence,
    attribution: asterOriginalIconAuthorship.attribution,
    deprecated: false,
  },
});
