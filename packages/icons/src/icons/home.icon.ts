import { Icon } from "@aster/core";
import { asterIconAuthoring } from "../shared/constants/aster-icon-authoring.constant.js";

/**
 * @description Canonical portable definition for the Aster home icon.
 */
export const Home = Icon.define({
  identity: {
    namespace: asterIconAuthoring.namespace,
    name: "home",
  },
  viewBox: asterIconAuthoring.viewBox,
  nodes: [
    {
      kind: "polyline",
      points: [
        { x: 3, y: 11 },
        { x: 12, y: 3 },
        { x: 21, y: 11 },
      ],
    },
    {
      kind: "path",
      data: "M5 9.5V21h4v-6h6v6h4V9.5",
    },
  ],
  metadata: {
    displayName: "Home",
    tags: ["home", "house", "navigation"],
    rtl: "preserve",
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
