import { Icon } from "@aster/core";
import {
  amellusIconAuthoringProfile,
} from "../authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../authoring/constants/aster-original-icon-authorship.constant.js";

/**
 * @description Canonical portable definition for the Aster star icon.
 */
export const Star = Icon.define({
  identity: {
    namespace: asterOriginalIconAuthorship.namespace,
    name: "star",
  },
  viewBox: amellusIconAuthoringProfile.viewBox,
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
    tags: ["bookmark", "favourite", "featured", "rating", "star"],
    rtl: "preserve",
    presentation: amellusIconAuthoringProfile.presentation,
    licence: asterOriginalIconAuthorship.licence,
    attribution: asterOriginalIconAuthorship.attribution,
    deprecated: false,
  },
});
