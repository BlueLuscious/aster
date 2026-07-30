import { Icon } from "@aster/core";
import { asterIconAuthoring } from "../shared/constants/aster-icon-authoring.constant.js";

/**
 * @description Canonical portable definition for the Aster bell icon.
 */
export const Bell = Icon.define({
  identity: {
    namespace: asterIconAuthoring.namespace,
    name: "bell",
  },
  viewBox: asterIconAuthoring.viewBox,
  nodes: [
    {
      kind: "path",
      data: "M5 18h14l-1.5-2v-5.5a5.5 5.5 0 0 0-11 0V16z",
    },
    {
      kind: "line",
      x1: 10,
      y1: 20,
      x2: 14,
      y2: 20,
    },
  ],
  metadata: {
    displayName: "Bell",
    tags: ["alert", "bell", "notification"],
    rtl: "preserve",
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
