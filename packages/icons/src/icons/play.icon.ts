import { Icon } from "@aster/core";
import { asterIconAuthoring } from "../shared/constants/aster-icon-authoring.constant.js";

/**
 * @description Canonical portable definition for the Aster play icon.
 */
export const Play = Icon.define({
  identity: {
    namespace: asterIconAuthoring.namespace,
    name: "play",
  },
  viewBox: asterIconAuthoring.viewBox,
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
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
