import { Icon } from "@aster/core";
import { asterIconAuthoring } from "../shared/constants/aster-icon-authoring.constant.js";

/**
 * @description Canonical portable definition for the Aster lock icon.
 */
export const Lock = Icon.define({
  identity: {
    namespace: asterIconAuthoring.namespace,
    name: "lock",
  },
  viewBox: asterIconAuthoring.viewBox,
  nodes: [
    {
      kind: "rect",
      x: 5,
      y: 10,
      width: 14,
      height: 11,
      radiusX: 2,
      radiusY: 2,
    },
    {
      kind: "path",
      data: "M8 10V7a4 4 0 0 1 8 0v3",
    },
  ],
  metadata: {
    displayName: "Lock",
    tags: ["lock", "privacy", "security"],
    rtl: "preserve",
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
