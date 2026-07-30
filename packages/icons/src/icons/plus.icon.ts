import { Icon } from "@aster/core";
import { asterCollection } from "../collections/constants/aster.collection.js";

/**
 * @description Canonical portable definition for the Aster plus icon.
 */
export const Plus = Icon.define({
  identity: {
    collection: asterCollection.slug,
    name: "plus",
  },
  viewBox: asterCollection.viewBox,
  nodes: [
    {
      kind: "line",
      x1: 12,
      y1: 4,
      x2: 12,
      y2: 20,
    },
    {
      kind: "line",
      x1: 4,
      y1: 12,
      x2: 20,
      y2: 12,
    },
  ],
  metadata: {
    displayName: "Plus",
    rtl: "preserve",
    presentation: asterCollection.presentation,
    licence: asterCollection.licence,
    attribution: asterCollection.attribution,
    deprecated: false,
  },
});
