import { Icon } from "@aster/core";
import { asterCollection } from "../collections/constants/aster.collection.js";

/**
 * @description Canonical portable definition for the Aster user icon.
 */
export const User = Icon.define({
  identity: {
    collection: asterCollection.slug,
    name: "user",
  },
  viewBox: asterCollection.viewBox,
  nodes: [
    {
      kind: "circle",
      cx: 12,
      cy: 8,
      radius: 4,
    },
    {
      kind: "path",
      data: "M4 21c0-4.5 3.5-7 8-7s8 2.5 8 7",
    },
  ],
  metadata: {
    displayName: "User",
    rtl: "preserve",
    presentation: asterCollection.presentation,
    licence: asterCollection.licence,
    attribution: asterCollection.attribution,
    deprecated: false,
  },
});
