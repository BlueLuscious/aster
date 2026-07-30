import { Icon } from "@aster/core";
import { asterIconAuthoring } from "../shared/constants/aster-icon-authoring.constant.js";

/**
 * @description Canonical portable definition for the Aster check icon.
 */
export const Check = Icon.define({
  identity: {
    namespace: asterIconAuthoring.namespace,
    name: "check",
  },
  viewBox: asterIconAuthoring.viewBox,
  nodes: [
    {
      kind: "polyline",
      points: [
        { x: 4, y: 12.5 },
        { x: 9.5, y: 18 },
        { x: 20, y: 6 },
      ],
    },
  ],
  metadata: {
    displayName: "Check",
    tags: ["accept", "check", "confirm", "success"],
    rtl: "preserve",
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
