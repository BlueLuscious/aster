import { Icon } from "@aster/core";
import { asterIconAuthoring } from "../shared/constants/aster-icon-authoring.constant.js";

/**
 * @description Canonical portable definition for the Aster search icon.
 */
export const Search = Icon.define({
  identity: {
    namespace: asterIconAuthoring.namespace,
    name: "search",
  },
  viewBox: asterIconAuthoring.viewBox,
  nodes: [
    {
      kind: "circle",
      cx: 10.5,
      cy: 10.5,
      radius: 6.5,
    },
    {
      kind: "line",
      x1: 15,
      y1: 15,
      x2: 21,
      y2: 21,
    },
  ],
  metadata: {
    displayName: "Search",
    tags: ["find", "search"],
    rtl: "preserve",
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
