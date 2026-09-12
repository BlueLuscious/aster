import { Icon } from "@aster/core";
import { asterIconAuthoring } from "../shared/constants/aster-icon-authoring.constant.js";

/**
 * @description Canonical portable definition for the Aster folder icon.
 */
export const Folder = Icon.define({
  identity: {
    namespace: asterIconAuthoring.namespace,
    name: "folder",
  },
  viewBox: asterIconAuthoring.viewBox,
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
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
