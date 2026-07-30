import { Icon } from "@aster/core";
import { asterIconAuthoring } from "../shared/constants/aster-icon-authoring.constant.js";

/**
 * @description Canonical portable definition for the Aster star icon.
 */
export const Star = Icon.define({
  identity: {
    namespace: asterIconAuthoring.namespace,
    name: "star",
  },
  viewBox: asterIconAuthoring.viewBox,
  nodes: [
    {
      kind: "polygon",
      points: [
        { x: 12, y: 2.5 },
        { x: 15, y: 8.5 },
        { x: 21.5, y: 9.5 },
        { x: 16.5, y: 14 },
        { x: 18, y: 21 },
        { x: 12, y: 17.5 },
        { x: 6, y: 21 },
        { x: 7.5, y: 14 },
        { x: 2.5, y: 9.5 },
        { x: 9, y: 8.5 },
      ],
    },
  ],
  metadata: {
    displayName: "Star",
    tags: ["favourite", "rating", "star"],
    rtl: "preserve",
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
