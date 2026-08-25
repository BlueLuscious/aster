/**
 * @description Immutable discriminators for every initial structured command payload.
 */
export const asterCommandPayloadKinds = Object.freeze({
  export: "export",
  catalogueList: "catalogue-list",
  collectionList: "collection-list",
  iconList: "icon-list",
  search: "search",
  iconShow: "icon-show",
  collectionShow: "collection-show",
  help: "help",
  version: "version",
} as const);
