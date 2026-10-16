import { Icon } from "@luscious-garden/aster-core";
import { catalogueSourceFamilyKinds } from "../constants/catalogue-source-family-kinds.constant.mjs";
import { CatalogueSourceError } from "./catalogue-source.error.mjs";

/**
 * @description Validates collection membership against the complete discovered icon source set.
 */
export class CatalogueSourceRelationshipInspector {
  /**
   * @description Repository path composition capability.
   * @type {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver}
   */
  #paths;

  /**
   * @description Creates one catalogue source relationship inspector.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   */
  constructor(paths) {
    this.#paths = paths;
  }

  /**
   * @description Requires every collection member import to resolve to one discovered icon source.
   * @param {readonly import("../contracts/internal/catalogue-source-family-inspection.contract.mjs").ICatalogueSourceFamilyInspection[]} inspections - Complete family discovery results.
   * @returns {void}
   */
  validate(inspections) {
    const iconModules = inspections
      .filter(({ family }) => family.kind === catalogueSourceFamilyKinds.icon)
      .flatMap(({ modules }) => modules);
    const collectionModules = inspections
      .filter(({ family }) => family.kind === catalogueSourceFamilyKinds.collection)
      .flatMap(({ modules }) => modules);
    const iconsByPath = new Map(
      iconModules.map((module) => [this.#paths.resolve(module.sourcePath), module]),
    );

    for (const collection of collectionModules) {
      const memberPaths = new Set();
      const groups = new Map();

      for (const reference of collection.memberReferences) {
        if (
          !/^(?:\.\/|\.\.\/)/u.test(reference.moduleSpecifier) ||
          reference.moduleSpecifier.includes("\\") ||
          !reference.moduleSpecifier.endsWith(".icon.js")
        ) {
          throw new CatalogueSourceError(
            `${collection.sourcePath} collection member ${reference.localSymbol} must reference a relative canonical icon module.`,
          );
        }

        const targetPath = this.#paths.resolve(
          this.#paths.dirname(collection.sourcePath),
          reference.moduleSpecifier.replace(/\.js$/u, ".ts"),
        );
        const target = iconsByPath.get(targetPath);

        if (target === undefined) {
          throw new CatalogueSourceError(
            `${collection.sourcePath} contains dangling icon reference ${reference.moduleSpecifier}.`,
          );
        }

        if (memberPaths.has(targetPath)) {
          throw new CatalogueSourceError(
            `${collection.sourcePath} contains duplicate icon reference ${reference.moduleSpecifier}.`,
          );
        }

        if (reference.importedSymbol !== target.symbol) {
          throw new CatalogueSourceError(
            `${collection.sourcePath} must import ${target.symbol} from ${reference.moduleSpecifier}.`,
          );
        }

        const identity = target.manifest.identity;
        if (!("variant" in identity) || Icon.variantProperty(identity.variant) !== reference.variantProperty) {
          throw new CatalogueSourceError(
            `${collection.sourcePath} collection variant ${reference.alias}.${reference.variantProperty} must match the canonical variant property.`,
          );
        }
        const glyph = JSON.stringify([identity.namespace, identity.name]);
        const existing = groups.get(reference.alias);
        if (existing !== undefined && existing !== glyph) {
          throw new CatalogueSourceError(
            `${collection.sourcePath} collection variant group ${reference.alias} must contain the same glyph.`,
          );
        }
        groups.set(reference.alias, glyph);

        memberPaths.add(targetPath);
      }
    }
  }
}
