import { Icon } from "@aster/core";
import { asterCollection } from "../collections/constants/aster.collection.js";

/**
 * @description Canonical portable definition for the Aster settings icon.
 */
export const Settings = Icon.define({
  identity: {
    collection: asterCollection.slug,
    name: "settings",
  },
  viewBox: asterCollection.viewBox,
  nodes: [
    {
      kind: "circle",
      cx: 12,
      cy: 12,
      radius: 7,
    },
    {
      kind: "circle",
      cx: 12,
      cy: 12,
      radius: 3,
    },
    { kind: "line", x1: 12, y1: 3, x2: 12, y2: 5 },
    { kind: "line", x1: 12, y1: 19, x2: 12, y2: 21 },
    { kind: "line", x1: 3, y1: 12, x2: 5, y2: 12 },
    { kind: "line", x1: 19, y1: 12, x2: 21, y2: 12 },
    { kind: "line", x1: 5.5, y1: 5.5, x2: 7, y2: 7 },
    { kind: "line", x1: 17, y1: 17, x2: 18.5, y2: 18.5 },
    { kind: "line", x1: 18.5, y1: 5.5, x2: 17, y2: 7 },
    { kind: "line", x1: 7, y1: 17, x2: 5.5, y2: 18.5 },
  ],
  metadata: {
    displayName: "Settings",
    rtl: "preserve",
    presentation: asterCollection.presentation,
    licence: asterCollection.licence,
    attribution: asterCollection.attribution,
    deprecated: false,
  },
});
