import { Icon } from "@aster/core";
import {
  amellusIconAuthoringProfile,
} from "../authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../authoring/constants/aster-original-icon-authorship.constant.js";

/**
 * @description Canonical portable definition for the Aster cloud icon.
 */
export const Cloud = Icon.define({
  identity: {
    namespace: asterOriginalIconAuthorship.namespace,
    name: "cloud",
  },
  viewBox: amellusIconAuthoringProfile.viewBox,
  nodes: [
    {
      kind: "path",
      commands: [
        { kind: "move", x: 7, y: 19 },
        { kind: "line", x: 18, y: 19 },
        {
          kind: "arc",
          radiusX: 4,
          radiusY: 4,
          rotation: 0,
          largeArc: false,
          sweep: false,
          x: 18.5,
          y: 11,
        },
        {
          kind: "arc",
          radiusX: 6.5,
          radiusY: 6.5,
          rotation: 0,
          largeArc: false,
          sweep: false,
          x: 6,
          y: 10,
        },
        {
          kind: "arc",
          radiusX: 4.5,
          radiusY: 4.5,
          rotation: 0,
          largeArc: false,
          sweep: false,
          x: 7,
          y: 19,
        },
        { kind: "close" },
      ],
    },
  ],
  metadata: {
    displayName: "Cloud",
    tags: ["cloud", "remote", "storage"],
    rtl: "preserve",
    presentation: amellusIconAuthoringProfile.presentation,
    licence: asterOriginalIconAuthorship.licence,
    attribution: asterOriginalIconAuthorship.attribution,
    deprecated: false,
  },
});
