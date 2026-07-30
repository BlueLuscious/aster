import { Icon } from "@aster/core";
import { asterCollection } from "../collections/constants/aster.collection.js";

/**
 * @description Canonical portable definition for the Aster search icon.
 */
export const Search = Icon.define({
  identity: {
    collection: asterCollection.slug,
    name: "search",
  },
  viewBox: asterCollection.viewBox,
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
    rtl: "preserve",
    presentation: asterCollection.presentation,
    licence: asterCollection.licence,
    attribution: asterCollection.attribution,
    deprecated: false,
  },
});
