import { Icon } from "@aster/core";
import {
  amellusIconAuthoringProfile,
} from "../authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../authoring/constants/aster-original-icon-authorship.constant.js";

/**
 * @description Canonical portable definition for the Aster home icon.
 */
export const Home = Icon.define({
  identity: {
    namespace: asterOriginalIconAuthorship.namespace,
    name: "home",
  },
  viewBox: amellusIconAuthoringProfile.viewBox,
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
    presentation: amellusIconAuthoringProfile.presentation,
    licence: asterOriginalIconAuthorship.licence,
    attribution: asterOriginalIconAuthorship.attribution,
    deprecated: false,
  },
});
