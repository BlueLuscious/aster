import { Icon } from "@aster/core";
import { asterCollection } from "../collections/constants/aster.collection.js";

/**
 * @description Canonical portable definition for the Aster close icon.
 */
export const Close = Icon.define({
  identity: {
    collection: asterCollection.slug,
    name: "close",
  },
  viewBox: asterCollection.viewBox,
  nodes: [
    {
      kind: "line",
      x1: 5,
      y1: 5,
      x2: 19,
      y2: 19,
    },
    {
      kind: "line",
      x1: 19,
      y1: 5,
      x2: 5,
      y2: 19,
    },
  ],
  metadata: {
    displayName: "Close",
    rtl: "preserve",
    presentation: asterCollection.presentation,
    licence: asterCollection.licence,
    attribution: asterCollection.attribution,
    deprecated: false,
  },
});
