/**
 * @description Immutable catalogue source-generation ownership and family configuration.
 */
export const catalogueSourceGeneration = Object.freeze({
  /** @description Canonical command recorded in generated source headers. */
  command: "pnpm --dir packages/icons run generate:catalogue",
  /** @description Argument selecting read-only synchronisation verification. */
  checkArgument: "--check",
  /** @description Canonical source families and their generated outputs. */
  families: Object.freeze([
    Object.freeze({
      /** @description Directory containing canonical icon modules. */
      sourceDirectory: "src/icons",
      /** @description Filename suffix identifying canonical icon modules. */
      sourceSuffix: ".icon.ts",
      /** @description Symbol suffix appended after slug conversion. */
      symbolSuffix: "",
      /** @description Generated icon barrel path. */
      barrelPath: "src/icons/index.ts",
      /** @description Generated icon authority path. */
      authorityPath: "src/icons/constants/aster-icons.constant.ts",
      /** @description Generated icon authority symbol. */
      authorityName: "AsterIcons",
      /** @description Core definition type imported by the generated authority. */
      definitionType: "IconDefinition",
      /** @description Generated authority JSDoc description. */
      authorityDescription:
        "Complete immutable index of canonical Aster icon definitions.",
      /** @description Generated authority JSDoc remarks. */
      authorityRemarks:
        "Collection membership is intentionally independent from this discovery authority.",
    }),
    Object.freeze({
      /** @description Directory containing canonical collection modules. */
      sourceDirectory: "src/collections",
      /** @description Filename suffix identifying canonical collection modules. */
      sourceSuffix: ".collection.ts",
      /** @description Symbol suffix appended after slug conversion. */
      symbolSuffix: "Collection",
      /** @description Generated collection barrel path. */
      barrelPath: "src/collections/index.ts",
      /** @description Generated collection authority path. */
      authorityPath:
        "src/collections/constants/aster-collections.constant.ts",
      /** @description Generated collection authority symbol. */
      authorityName: "AsterCollections",
      /** @description Core definition type imported by the generated authority. */
      definitionType: "CollectionDefinition",
      /** @description Generated authority JSDoc description. */
      authorityDescription:
        "Complete immutable index of canonical Aster collection definitions.",
      /** @description Generated authority JSDoc remarks. */
      authorityRemarks:
        "Icon discovery remains independent from collection membership and collection count.",
    }),
  ]),
});
