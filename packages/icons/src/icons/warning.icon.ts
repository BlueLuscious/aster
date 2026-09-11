import { Icon } from "@aster/core";
import { asterIconAuthoring } from "../shared/constants/aster-icon-authoring.constant.js";

/**
 * @description Canonical portable definition for the Aster warning icon.
 */
export const Warning = Icon.define({
  identity: {
    namespace: asterIconAuthoring.namespace,
    name: "warning",
  },
  viewBox: asterIconAuthoring.viewBox,
  nodes: [
    {
      kind: "polygon",
      points: [
        { x: 12, y: 3 },
        { x: 22, y: 21 },
        { x: 2, y: 21 },
      ],
    },
    { kind: "line", x1: 12, y1: 9, x2: 12, y2: 14.5 },
    { kind: "line", x1: 12, y1: 17.5, x2: 12, y2: 18.5 },
  ],
  metadata: {
    displayName: "Warning",
    tags: ["alert", "attention", "caution", "warning"],
    rtl: "preserve",
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
