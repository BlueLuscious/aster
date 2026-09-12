import { Icon } from "@aster/core";
import { asterIconAuthoring } from "../shared/constants/aster-icon-authoring.constant.js";

/**
 * @description Canonical portable definition for the Aster camera icon.
 */
export const Camera = Icon.define({
  identity: {
    namespace: asterIconAuthoring.namespace,
    name: "camera",
  },
  viewBox: asterIconAuthoring.viewBox,
  nodes: [
    {
      kind: "path",
      commands: [
        { kind: "move", x: 5, y: 6.5 },
        { kind: "line", x: 8, y: 6.5 },
        { kind: "line", x: 9.5, y: 4 },
        { kind: "line", x: 14.5, y: 4 },
        { kind: "line", x: 16, y: 6.5 },
        { kind: "line", x: 19, y: 6.5 },
        {
          kind: "quadratic-bezier",
          controlX: 21,
          controlY: 6.5,
          x: 21,
          y: 8.5,
        },
        { kind: "line", x: 21, y: 17.5 },
        {
          kind: "quadratic-bezier",
          controlX: 21,
          controlY: 20,
          x: 18.5,
          y: 20,
        },
        { kind: "line", x: 5.5, y: 20 },
        {
          kind: "quadratic-bezier",
          controlX: 3,
          controlY: 20,
          x: 3,
          y: 17.5,
        },
        { kind: "line", x: 3, y: 8.5 },
        {
          kind: "quadratic-bezier",
          controlX: 3,
          controlY: 6.5,
          x: 5,
          y: 6.5,
        },
        { kind: "close" },
      ],
    },
    { kind: "circle", cx: 12, cy: 13, radius: 3.5 },
  ],
  metadata: {
    displayName: "Camera",
    tags: ["camera", "media", "photo", "photograph"],
    rtl: "preserve",
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
