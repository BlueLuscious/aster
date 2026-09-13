import { Icon } from "@aster/core";
import {
  amellusIconAuthoringProfile,
} from "../authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../authoring/constants/aster-original-icon-authorship.constant.js";

/**
 * @description Canonical portable definition for the Aster play icon.
 */
export const Play = Icon.define({
  identity: {
    namespace: asterOriginalIconAuthorship.namespace,
    name: "play",
  },
  viewBox: amellusIconAuthoringProfile.viewBox,
  nodes: [
    {
      kind: "polygon",
      points: [
        { x: 7, y: 4 },
        { x: 20, y: 12 },
        { x: 7, y: 20 },
      ],
    },
  ],
  metadata: {
    displayName: "Play",
    tags: ["media", "play", "playback", "start"],
    rtl: "preserve",
    presentation: amellusIconAuthoringProfile.presentation,
    licence: asterOriginalIconAuthorship.licence,
    attribution: asterOriginalIconAuthorship.attribution,
    deprecated: false,
  },
});
