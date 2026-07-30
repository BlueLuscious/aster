import { Icon } from "@aster/core";
import { asterCollection } from "../collections/constants/aster.collection.js";

/**
 * @description Canonical portable definition for the Aster camera icon.
 */
export const Camera = Icon.define({
  identity: {
    collection: asterCollection.slug,
    name: "camera",
  },
  viewBox: asterCollection.viewBox,
  nodes: [
    {
      kind: "path",
      data: "M8 6.5L9.5 4h5L16 6.5h3a2 2 0 0 1 2 2v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-9a2 2 0 0 1 2-2z",
    },
    {
      kind: "circle",
      cx: 12,
      cy: 13,
      radius: 3.5,
    },
  ],
  metadata: {
    displayName: "Camera",
    rtl: "preserve",
    presentation: asterCollection.presentation,
    licence: asterCollection.licence,
    attribution: asterCollection.attribution,
    deprecated: false,
  },
});
