import { Icon } from "@aster/core";
import { asterIconAuthoring } from "../shared/constants/aster-icon-authoring.constant.js";

/**
 * @description Canonical portable definition for the Aster close icon.
 */
export const Close = Icon.define({
  identity: {
    namespace: asterIconAuthoring.namespace,
    name: "close",
  },
  viewBox: asterIconAuthoring.viewBox,
  nodes: [
    {
      kind: "line",
      x1: 5,
      y1: 5,
      x2: 19,
      y2: 19,
    },
    {
      kind: "line",
      x1: 19,
      y1: 5,
      x2: 5,
      y2: 19,
    },
  ],
  metadata: {
    displayName: "Close",
    tags: ["cancel", "close", "dismiss", "remove"],
    rtl: "preserve",
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
