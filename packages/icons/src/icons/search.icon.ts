import { Icon } from "@aster/core";
import {
  amellusIconAuthoringProfile,
} from "../authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../authoring/constants/aster-original-icon-authorship.constant.js";

/**
 * @description Canonical portable definition for the Aster search icon.
 */
export const Search = Icon.define({
  identity: {
    namespace: asterOriginalIconAuthorship.namespace,
    name: "search",
  },
  viewBox: amellusIconAuthoringProfile.viewBox,
  nodes: [
    { kind: "circle", cx: 10.5, cy: 10.5, radius: 6 },
    { kind: "line", x1: 15, y1: 15, x2: 21, y2: 21 },
  ],
  metadata: {
    displayName: "Search",
    tags: ["find", "lookup", "search"],
    rtl: "preserve",
    presentation: amellusIconAuthoringProfile.presentation,
    licence: asterOriginalIconAuthorship.licence,
    attribution: asterOriginalIconAuthorship.attribution,
    deprecated: false,
  },
});
