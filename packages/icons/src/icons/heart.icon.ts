import { Icon } from "@aster/core";
import { asterCollection } from "../collections/constants/aster.collection.js";

/**
 * @description Canonical portable definition for the Aster heart icon.
 */
export const Heart = Icon.define({
  identity: {
    collection: asterCollection.slug,
    name: "heart",
  },
  viewBox: asterCollection.viewBox,
  nodes: [
    {
      kind: "path",
      data: "M12 21S3 15.5 3 9.5C3 6 5.5 4 8 4c2 0 3.5 1 4 2.5C13 5 14.5 4 16 4c2.5 0 5 2 5 5.5C21 15.5 12 21 12 21z",
    },
  ],
  metadata: {
    displayName: "Heart",
    rtl: "preserve",
    presentation: asterCollection.presentation,
    licence: asterCollection.licence,
    attribution: asterCollection.attribution,
    deprecated: false,
  },
});
