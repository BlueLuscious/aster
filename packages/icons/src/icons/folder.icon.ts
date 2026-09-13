import { Icon } from "@aster/core";
import {
  amellusIconAuthoringProfile,
} from "../authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../authoring/constants/aster-original-icon-authorship.constant.js";

/**
 * @description Canonical portable definition for the Aster folder icon.
 */
export const Folder = Icon.define({
  identity: {
    namespace: asterOriginalIconAuthorship.namespace,
    name: "folder",
  },
  viewBox: amellusIconAuthoringProfile.viewBox,
  nodes: [
    {
      kind: "path",
      commands: [
        { kind: "move", x: 5, y: 5 },
        { kind: "line", x: 9.5, y: 5 },
        { kind: "line", x: 11.5, y: 7 },
        { kind: "line", x: 19, y: 7 },
        {
          kind: "quadratic-bezier",
          controlX: 21,
          controlY: 7,
          x: 21,
          y: 9,
        },
        { kind: "line", x: 21, y: 18 },
        {
          kind: "quadratic-bezier",
          controlX: 21,
          controlY: 20,
          x: 19,
          y: 20,
        },
        { kind: "line", x: 5, y: 20 },
        {
          kind: "quadratic-bezier",
          controlX: 3,
          controlY: 20,
          x: 3,
          y: 18,
        },
        { kind: "line", x: 3, y: 7 },
        {
          kind: "quadratic-bezier",
          controlX: 3,
          controlY: 5,
          x: 5,
          y: 5,
        },
        { kind: "close" },
      ],
    },
  ],
  metadata: {
    displayName: "Folder",
    tags: ["directory", "files", "folder"],
    rtl: "preserve",
    presentation: amellusIconAuthoringProfile.presentation,
    licence: asterOriginalIconAuthorship.licence,
    attribution: asterOriginalIconAuthorship.attribution,
    deprecated: false,
  },
});
