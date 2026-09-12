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
    { kind: "rect", x: 5, y: 10, width: 14, height: 11, radiusX: 2, radiusY: 2 },
    {
      kind: "path",
      commands: [
        { kind: "move", x: 8, y: 10 },
        { kind: "line", x: 8, y: 7 },
        {
          kind: "cubic-bezier",
          control1X: 8,
          control1Y: 5,
          control2X: 10,
          control2Y: 3,
          x: 12,
          y: 3,
        },
        {
          kind: "cubic-bezier",
          control1X: 14,
          control1Y: 3,
          control2X: 16,
          control2Y: 5,
          x: 16,
          y: 7,
        },
        { kind: "line", x: 16, y: 10 },
      ],
    },
  ],
  metadata: {
    displayName: "Lock",
    tags: ["lock", "privacy", "secure", "security"],
    rtl: "preserve",
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
