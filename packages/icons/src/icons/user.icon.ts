import { Icon } from "@aster/core";
import { asterIconAuthoring } from "../shared/constants/aster-icon-authoring.constant.js";

/**
 * @description Canonical portable definition for the Aster user icon.
 */
export const User = Icon.define({
  identity: {
    namespace: asterIconAuthoring.namespace,
    name: "user",
  },
  viewBox: asterIconAuthoring.viewBox,
  nodes: [
    {
      kind: "circle",
      cx: 12,
      cy: 8,
      radius: 4,
    },
    {
      kind: "path",
      data: "M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7",
    },
  ],
  metadata: {
    displayName: "User",
    tags: ["account", "person", "profile", "user"],
    rtl: "preserve",
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
