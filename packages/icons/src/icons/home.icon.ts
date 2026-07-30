import { Icon } from "@aster/core";
import { asterCollection } from "../collections/constants/aster.collection.js";

/**
 * @description Canonical portable definition for the Aster home icon.
 */
export const Home = Icon.define({
  identity: {
    collection: asterCollection.slug,
    name: "home",
  },
  viewBox: asterCollection.viewBox,
  nodes: [
    {
      kind: "polyline",
      points: [
        { x: 3, y: 11 },
        { x: 12, y: 3 },
        { x: 21, y: 11 },
      ],
    },
    {
      kind: "path",
      data: "M5 9.5V21h4v-6h6v6h4V9.5",
    },
  ],
  metadata: {
    displayName: "Home",
    rtl: "preserve",
    presentation: asterCollection.presentation,
    licence: asterCollection.licence,
    attribution: asterCollection.attribution,
    deprecated: false,
  },
});
