import { Icon } from "@aster/core";
import { asterIconAuthoring } from "../shared/constants/aster-icon-authoring.constant.js";

/**
 * @description Canonical portable definition for the Aster menu icon.
 */
export const Menu = Icon.define({
  identity: {
    namespace: asterIconAuthoring.namespace,
    name: "menu",
  },
  viewBox: asterIconAuthoring.viewBox,
  nodes: [
    { kind: "line", x1: 4, y1: 6, x2: 20, y2: 6 },
    { kind: "line", x1: 4, y1: 12, x2: 20, y2: 12 },
    { kind: "line", x1: 4, y1: 18, x2: 20, y2: 18 },
  ],
  metadata: {
    displayName: "Menu",
    tags: ["hamburger", "menu", "navigation"],
    rtl: "preserve",
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
