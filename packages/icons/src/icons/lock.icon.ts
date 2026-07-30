import { Icon } from "@aster/core";
import { asterCollection } from "../collections/constants/aster.collection.js";

/**
 * @description Canonical portable definition for the Aster lock icon.
 */
export const Lock = Icon.define({
  identity: {
    collection: asterCollection.slug,
    name: "lock",
  },
  viewBox: asterCollection.viewBox,
  nodes: [
    {
      kind: "rect",
      x: 5,
      y: 10,
      width: 14,
      height: 11,
      radiusX: 2,
      radiusY: 2,
    },
    {
      kind: "path",
      data: "M8 10V7a4 4 0 0 1 8 0v3",
    },
  ],
  metadata: {
    displayName: "Lock",
    rtl: "preserve",
    presentation: asterCollection.presentation,
    licence: asterCollection.licence,
    attribution: asterCollection.attribution,
    deprecated: false,
  },
});
