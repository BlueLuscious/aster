import { Icon } from "@aster/core";
import {
  amellusIconAuthoringProfile,
} from "../authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../authoring/constants/aster-original-icon-authorship.constant.js";

/**
 * @description Canonical portable definition for the Aster plus icon.
 */
export const Plus = Icon.define({
  identity: {
    namespace: asterOriginalIconAuthorship.namespace,
    name: "plus",
  },
  viewBox: amellusIconAuthoringProfile.viewBox,
  nodes: [
    { kind: "line", x1: 12, y1: 4, x2: 12, y2: 20 },
    { kind: "line", x1: 4, y1: 12, x2: 20, y2: 12 },
  ],
  metadata: {
    displayName: "Plus",
    tags: ["add", "create", "new", "plus"],
    rtl: "preserve",
    presentation: amellusIconAuthoringProfile.presentation,
    licence: asterOriginalIconAuthorship.licence,
    attribution: asterOriginalIconAuthorship.attribution,
    deprecated: false,
  },
});
