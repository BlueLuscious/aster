import { Icon } from "@aster/core";
import { asterCollection } from "../collections/constants/aster.collection.js";

/**
 * @description Canonical portable definition for the Aster cloud icon.
 */
export const Cloud = Icon.define({
  identity: {
    collection: asterCollection.slug,
    name: "cloud",
  },
  viewBox: asterCollection.viewBox,
  nodes: [
    {
      kind: "path",
      data: "M7 19h11a4 4 0 0 0 .5-8A6.5 6.5 0 0 0 6 10a4.5 4.5 0 0 0 1 9z",
    },
  ],
  metadata: {
    displayName: "Cloud",
    rtl: "preserve",
    presentation: asterCollection.presentation,
    licence: asterCollection.licence,
    attribution: asterCollection.attribution,
    deprecated: false,
  },
});
