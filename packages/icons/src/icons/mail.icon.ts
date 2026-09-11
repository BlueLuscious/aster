import { Icon } from "@aster/core";
import { asterIconAuthoring } from "../shared/constants/aster-icon-authoring.constant.js";

/**
 * @description Canonical portable definition for the Aster mail icon.
 */
export const Mail = Icon.define({
  identity: {
    namespace: asterIconAuthoring.namespace,
    name: "mail",
  },
  viewBox: asterIconAuthoring.viewBox,
  nodes: [
    {
      kind: "rect",
      x: 3,
      y: 5,
      width: 18,
      height: 14,
      radiusX: 2,
      radiusY: 2,
    },
    {
      kind: "polyline",
      points: [
        { x: 4, y: 7 },
        { x: 12, y: 13 },
        { x: 20, y: 7 },
      ],
    },
  ],
  metadata: {
    displayName: "Mail",
    tags: ["email", "envelope", "inbox", "mail", "message"],
    rtl: "preserve",
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
