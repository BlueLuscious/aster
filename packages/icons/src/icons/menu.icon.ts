import { Icon } from "@aster/core";
import {
  amellusIconAuthoringProfile,
} from "../authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../authoring/constants/aster-original-icon-authorship.constant.js";

/**
 * @description Canonical portable definition for the Aster menu icon.
 */
export const Menu = Icon.define({
  identity: {
    namespace: asterOriginalIconAuthorship.namespace,
    name: "menu",
  },
  viewBox: amellusIconAuthoringProfile.viewBox,
  nodes: [
    { kind: "line", x1: 4, y1: 6, x2: 20, y2: 6 },
    { kind: "line", x1: 4, y1: 12, x2: 20, y2: 12 },
    { kind: "line", x1: 4, y1: 18, x2: 20, y2: 18 },
  ],
  metadata: {
    displayName: "Menu",
    tags: ["hamburger", "menu", "navigation"],
    rtl: "preserve",
    presentation: amellusIconAuthoringProfile.presentation,
    licence: asterOriginalIconAuthorship.licence,
    attribution: asterOriginalIconAuthorship.attribution,
    deprecated: false,
  },
});
