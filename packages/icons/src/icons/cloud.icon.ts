import { Icon } from "@aster/core";
import { asterIconAuthoring } from "../shared/constants/aster-icon-authoring.constant.js";

/**
 * @description Canonical portable definition for the Aster cloud icon.
 */
export const Cloud = Icon.define({
  identity: {
    namespace: asterIconAuthoring.namespace,
    name: "cloud",
  },
  viewBox: asterIconAuthoring.viewBox,
  nodes: [
    {
      kind: "path",
      data: "M7 19h11a4 4 0 0 0 .5-8A6.5 6.5 0 0 0 6 10a4.5 4.5 0 0 0 1 9z",
    },
  ],
  metadata: {
    displayName: "Cloud",
    tags: ["cloud", "storage", "weather"],
    rtl: "preserve",
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
