import { catalogueSourceFamilyKinds } from "./catalogue-source-family-kinds.constant.mjs";

/**
 * @description Immutable catalogue source-generation ownership and family configuration.
 */
export const catalogueSourceGeneration = Object.freeze({
  /** @description Canonical command recorded in generated source headers. */
  command: "pnpm --dir packages/icons run generate:catalogue",
  /** @description Argument selecting read-only synchronisation verification. */
  checkArgument: "--check",
  /** @description Exclusively owned root containing generated public definition facades. */
  facadeRoot: "src/generated/facades",
  /** @description Generated metadata-only distribution manifest path. */
  manifestPath: "src/generated/manifest/index.ts",
  /** @description Generated exact asynchronous definition-loader path. */
  dynamicPath: "src/generated/dynamic/index.ts",
  /** @description Icon names reserved by package-level public subpath families. */
  reservedIconNames: Object.freeze(["collections", "dynamic", "manifest"]),
  /** @description Canonical source families and their generated outputs. */
  families: Object.freeze([
    Object.freeze({
      /** @description Semantic family used to apply icon identity and layout rules. */
      kind: catalogueSourceFamilyKinds.icon,
      /** @description Directory containing canonical icon modules. */
      sourceDirectory: "src/glyphs",
      /** @description Filename suffix identifying canonical icon modules. */
      sourceSuffix: ".icon.ts",
      /** @description Symbol suffix appended after slug conversion. */
      symbolSuffix: "",
      /** @description Public Core factory expected in canonical icon modules. */
      definitionFactory: "Icon",
      /** @description Public package module owning the canonical icon factory. */
      definitionModule: "@luscious-garden/aster-core",
      /** @description Reserved source-root directories excluded from canonical discovery. */
      excludedDirectories: Object.freeze([]),
      /** @description Directory containing generated public icon facades. */
      facadeDirectory: "src/generated/facades/icons",
    }),
    Object.freeze({
      /** @description Semantic family used to apply collection identity and layout rules. */
      kind: catalogueSourceFamilyKinds.collection,
      /** @description Directory containing canonical collection modules. */
      sourceDirectory: "src/collections",
      /** @description Filename suffix identifying canonical collection modules. */
      sourceSuffix: ".collection.ts",
      /** @description Symbol suffix appended after slug conversion. */
      symbolSuffix: "Collection",
      /** @description Public Core factory expected in canonical collection modules. */
      definitionFactory: "Collection",
      /** @description Public package module owning the canonical collection factory. */
      definitionModule: "@luscious-garden/aster-core",
      /** @description Reserved source-root directories excluded from canonical discovery. */
      excludedDirectories: Object.freeze(["constants"]),
      /** @description Directory containing generated public collection facades. */
      facadeDirectory: "src/generated/facades/collections",
    }),
  ]),
});
