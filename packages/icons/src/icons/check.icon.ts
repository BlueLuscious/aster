import { Icon } from "@aster/core";
import {
  amellusIconAuthoringProfile,
} from "../authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../authoring/constants/aster-original-icon-authorship.constant.js";

/**
 * @description Canonical portable definition for the Aster check icon.
 */
export const Check = Icon.define({
  identity: {
    namespace: asterOriginalIconAuthorship.namespace,
    name: "check",
  },
  viewBox: amellusIconAuthoringProfile.viewBox,
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
    tags: ["check", "complete", "confirm", "done", "success"],
    rtl: "preserve",
    presentation: amellusIconAuthoringProfile.presentation,
    licence: asterOriginalIconAuthorship.licence,
    attribution: asterOriginalIconAuthorship.attribution,
    deprecated: false,
  },
});
