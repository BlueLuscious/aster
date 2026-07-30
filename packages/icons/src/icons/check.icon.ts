import { Icon } from "@aster/core";
import { asterCollection } from "../collections/constants/aster.collection.js";

/**
 * @description Canonical portable definition for the Aster check icon.
 */
export const Check = Icon.define({
  identity: {
    collection: asterCollection.slug,
    name: "check",
  },
  viewBox: asterCollection.viewBox,
  nodes: [
    {
      kind: "polyline",
      points: [
        { x: 4, y: 12.5 },
        { x: 9.5, y: 18 },
        { x: 20, y: 6 },
      ],
    },
  ],
  metadata: {
    displayName: "Check",
    rtl: "preserve",
    presentation: asterCollection.presentation,
    licence: asterCollection.licence,
    attribution: asterCollection.attribution,
    deprecated: false,
  },
});
