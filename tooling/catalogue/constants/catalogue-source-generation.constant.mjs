/**
 * @description Immutable catalogue source-generation ownership and family configuration.
 */
export const catalogueSourceGeneration = Object.freeze({
  command: "pnpm --dir packages/icons run generate:catalogue",
  checkArgument: "--check",
  families: Object.freeze([
    Object.freeze({
      sourceDirectory: "src/icons",
      sourceSuffix: ".icon.ts",
      symbolSuffix: "",
      barrelPath: "src/icons/index.ts",
      authorityPath: "src/icons/constants/aster-icons.constant.ts",
      authorityName: "AsterIcons",
      definitionType: "IconDefinition",
      authorityDescription:
        "Complete immutable index of canonical Aster icon definitions.",
      authorityRemarks:
        "Collection membership is intentionally independent from this discovery authority.",
    }),
    Object.freeze({
      sourceDirectory: "src/collections",
      sourceSuffix: ".collection.ts",
      symbolSuffix: "Collection",
      barrelPath: "src/collections/index.ts",
      authorityPath:
        "src/collections/constants/aster-collections.constant.ts",
      authorityName: "AsterCollections",
      definitionType: "CollectionDefinition",
      authorityDescription:
        "Complete immutable index of canonical Aster collection definitions.",
      authorityRemarks:
        "Icon discovery remains independent from collection membership and collection count.",
    }),
  ]),
});
