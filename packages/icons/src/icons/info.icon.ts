import { Icon } from "@aster/core";
import { asterIconAuthoring } from "../shared/constants/aster-icon-authoring.constant.js";

/**
 * @description Canonical portable definition for the Aster info icon.
 */
export const Info = Icon.define({
  identity: {
    namespace: asterIconAuthoring.namespace,
    name: "info",
  },
  viewBox: asterIconAuthoring.viewBox,
  nodes: [
    { kind: "circle", cx: 12, cy: 12, radius: 9 },
    { kind: "circle", cx: 12, cy: 7, radius: 0.5 },
    { kind: "line", x1: 12, y1: 11, x2: 12, y2: 17 },
  ],
  metadata: {
    displayName: "Info",
    tags: ["about", "help", "info", "information"],
    rtl: "preserve",
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
