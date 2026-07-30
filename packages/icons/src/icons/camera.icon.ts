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
      data: "M8 6.5L9.5 4h5L16 6.5h3a2 2 0 0 1 2 2v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-9a2 2 0 0 1 2-2z",
    },
    {
      kind: "circle",
      cx: 12,
      cy: 13,
      radius: 3.5,
    },
  ],
  metadata: {
    displayName: "Camera",
    tags: ["camera", "media", "photo"],
    rtl: "preserve",
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
