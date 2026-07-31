import { Icon } from "@aster/core";
import { asterIconAuthoring } from "../shared/constants/aster-icon-authoring.constant.js";

/**
 * @description Canonical portable definition for the Aster leaf icon.
 */
export const Leaf = Icon.define({
  identity: {
    namespace: asterIconAuthoring.namespace,
    name: "leaf",
  },
  viewBox: asterIconAuthoring.viewBox,
  nodes: [
    {
      kind: "path",
      data: "M20.5 3.5C12 3.5 5 7.5 5 14a6 6 0 0 0 6 6c6.5 0 9.5-7 9.5-16.5z",
    },
    {
      kind: "path",
      data: "M7 18c3-4 6.5-7 11-10.5",
    },
  ],
  metadata: {
    displayName: "Leaf",
    tags: ["eco", "leaf", "nature", "plant"],
    rtl: "preserve",
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
