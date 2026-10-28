import { Icon } from "@luscious-garden/aster-core";
import {
  amellusIconAuthoringProfile,
} from "../../../authoring/constants/amellus-icon-authoring-profile.constant.js";
import {
  asterOriginalIconAuthorship,
} from "../../../authoring/constants/aster-original-icon-authorship.constant.js";

/**
 * @description Canonical portable Filled definition for the Aster camera glyph.
 */
export const CameraFilled = Icon.define({
  identity: {
    variant: "filled",
    namespace: asterOriginalIconAuthorship.namespace,
    name: "camera",
  },
  viewBox: amellusIconAuthoringProfile.viewBox,
  nodes: [
    { kind: "circle", cx: 12, cy: 13, radius: 2 },
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
        { kind: "move", x: 12, y: 18 },
        {
          kind: "arc",
          radiusX: 5,
          radiusY: 5,
          rotation: 0,
          largeArc: false,
          sweep: false,
          x: 12,
          y: 8,
        },
        {
          kind: "arc",
          radiusX: 5,
          radiusY: 5,
          rotation: 0,
          largeArc: false,
          sweep: false,
          x: 12,
          y: 18,
        },
        { kind: "close" },
      ],
    },
  ],
  metadata: {
    displayName: "Camera Filled",
    tags: ["camera", "media", "photo", "photograph"],
    rtl: "preserve",
    presentation: amellusIconAuthoringProfile.presentations.filled,
    licence: asterOriginalIconAuthorship.licence,
    attribution: asterOriginalIconAuthorship.attribution,
    deprecated: false,
  },
});
