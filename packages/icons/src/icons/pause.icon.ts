import { Icon } from "@aster/core";
import { asterIconAuthoring } from "../shared/constants/aster-icon-authoring.constant.js";

/**
 * @description Canonical portable definition for the Aster pause icon.
 */
export const Pause = Icon.define({
  identity: {
    namespace: asterIconAuthoring.namespace,
    name: "pause",
  },
  viewBox: asterIconAuthoring.viewBox,
  nodes: [
    { kind: "line", x1: 8, y1: 5, x2: 8, y2: 19 },
    { kind: "line", x1: 16, y1: 5, x2: 16, y2: 19 },
  ],
  metadata: {
    displayName: "Pause",
    tags: ["hold", "media", "pause", "playback"],
    rtl: "preserve",
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
