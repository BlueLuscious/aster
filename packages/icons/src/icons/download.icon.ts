import { Icon } from "@aster/core";
import { asterIconAuthoring } from "../shared/constants/aster-icon-authoring.constant.js";

/**
 * @description Canonical portable definition for the Aster download icon.
 */
export const Download = Icon.define({
  identity: {
    namespace: asterIconAuthoring.namespace,
    name: "download",
  },
  viewBox: asterIconAuthoring.viewBox,
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
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
