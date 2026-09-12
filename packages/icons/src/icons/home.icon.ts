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
      commands: [
        { kind: "move", x: 5, y: 9.5 },
        { kind: "line", x: 5, y: 21 },
        { kind: "line", x: 9, y: 21 },
        { kind: "line", x: 9, y: 15 },
        { kind: "line", x: 15, y: 15 },
        { kind: "line", x: 15, y: 21 },
        { kind: "line", x: 19, y: 21 },
        { kind: "line", x: 19, y: 9.5 },
      ],
    },
  ],
  metadata: {
    displayName: "Home",
    tags: ["home", "house", "navigation", "start"],
    rtl: "preserve",
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
