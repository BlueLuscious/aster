import { Icon } from "@aster/core";
import { asterIconAuthoring } from "../shared/constants/aster-icon-authoring.constant.js";

/**
 * @description Canonical portable definition for the Aster folder icon.
 */
export const Folder = Icon.define({
  identity: {
    namespace: asterIconAuthoring.namespace,
    name: "folder",
  },
  viewBox: asterIconAuthoring.viewBox,
  nodes: [
    {
      kind: "path",
      data: "M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
    },
  ],
  metadata: {
    displayName: "Folder",
    tags: ["directory", "files", "folder"],
    rtl: "preserve",
    presentation: asterIconAuthoring.presentation,
    licence: asterIconAuthoring.licence,
    attribution: asterIconAuthoring.attribution,
    deprecated: false,
  },
});
