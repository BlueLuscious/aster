import { Icon } from "@aster/core";
import { asterCollection } from "../collections/constants/aster.collection.js";

/**
 * @description Canonical portable definition for the Aster arrow-left icon.
 */
export const ArrowLeft = Icon.define({
  identity: {
    collection: asterCollection.slug,
    name: "arrow-left",
  },
  viewBox: asterCollection.viewBox,
  nodes: [
    {
      kind: "line",
      x1: 20,
      y1: 12,
      x2: 4,
      y2: 12,
    },
    {
      kind: "polyline",
      points: [
        { x: 10, y: 6 },
        { x: 4, y: 12 },
        { x: 10, y: 18 },
      ],
    },
  ],
  metadata: {
    displayName: "Arrow Left",
    rtl: "mirror",
    presentation: asterCollection.presentation,
    licence: asterCollection.licence,
    attribution: asterCollection.attribution,
    deprecated: false,
  },
});
