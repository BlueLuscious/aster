import { Icon } from "@aster/core";
import { asterIconAuthoring } from "../shared/constants/aster-icon-authoring.constant.js";

/**
 * @description Canonical portable definition for the Aster plus icon.
 */
export const Plus = Icon.define({
  identity: {
    namespace: asterIconAuthoring.namespace,
    name: "plus",
  },
  viewBox: asterIconAuthoring.viewBox,
  nodes: [
    {
      kind: "line",
      x1: 12,
      y1: 4,
      x2: 12,
      y2: 20,
    },
    {
      kind: "line",
      x1: 4,
      y1: 12,
      x2: 20,
      y2: 12,
    },
  ],
  metadata: {
    displayName: "Plus",
    tags: ["add", "create", "plus"],
    rtl: "preserve",
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
