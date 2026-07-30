import { Icon } from "@aster/core";
import { asterCollection } from "../collections/constants/aster.collection.js";

/**
 * @description Canonical portable definition for the Aster folder icon.
 */
export const Folder = Icon.define({
  identity: {
    collection: asterCollection.slug,
    name: "folder",
  },
  viewBox: asterCollection.viewBox,
  nodes: [
    {
      kind: "path",
      data: "M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
    },
  ],
  metadata: {
    displayName: "Folder",
    rtl: "preserve",
    presentation: asterCollection.presentation,
    licence: asterCollection.licence,
    attribution: asterCollection.attribution,
    deprecated: false,
  },
});
