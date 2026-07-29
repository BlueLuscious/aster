/**
 * @description Immutable discriminator values for every canonical ingestion source family.
 */
export const ingestionSourceKinds = Object.freeze({
  svg: "svg",
  collectionMetadata: "collection-metadata",
  iconMetadata: "icon-metadata",
} as const);
