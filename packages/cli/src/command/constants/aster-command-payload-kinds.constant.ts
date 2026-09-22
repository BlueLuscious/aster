/**
 * @description Immutable discriminators for every initial structured command payload.
 */
export const asterCommandPayloadKinds = Object.freeze({
  /** @description Payload containing one accepted export plan. */
  export: "export",
  /** @description Payload containing available catalogue providers. */
  catalogueList: "catalogue-list",
  /** @description Payload containing canonical collection records. */
  collectionList: "collection-list",
  /** @description Payload containing canonical icon records. */
  iconList: "icon-list",
  /** @description Payload containing one accepted review plan. */
  review: "review",
  /** @description Payload containing matched catalogue records. */
  search: "search",
  /** @description Payload containing one exact icon record. */
  iconShow: "icon-show",
  /** @description Payload containing one exact collection record. */
  collectionShow: "collection-show",
  /** @description Payload containing command help metadata. */
  help: "help",
  /** @description Payload containing explicit product metadata. */
  version: "version",
} as const);
