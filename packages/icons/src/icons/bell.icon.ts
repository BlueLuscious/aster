import { Icon } from "@aster/core";
import { asterCollection } from "../collections/constants/aster.collection.js";

/**
 * @description Canonical portable definition for the Aster bell icon.
 */
export const Bell = Icon.define({
  identity: {
    collection: asterCollection.slug,
    name: "bell",
  },
  viewBox: asterCollection.viewBox,
  nodes: [
    {
      kind: "path",
      data: "M5 18h14l-1.5-2v-5.5a5.5 5.5 0 0 0-11 0V16z",
    },
    {
      kind: "line",
      x1: 10,
      y1: 20,
      x2: 14,
      y2: 20,
    },
  ],
  metadata: {
    displayName: "Bell",
    rtl: "preserve",
    presentation: asterCollection.presentation,
    licence: asterCollection.licence,
    attribution: asterCollection.attribution,
    deprecated: false,
  },
});
