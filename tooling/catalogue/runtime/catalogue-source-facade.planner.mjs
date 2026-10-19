import { Icon } from "@luscious-garden/aster-core";

import { catalogueSourceFamilyKinds } from "../constants/catalogue-source-family-kinds.constant.mjs";
import { CatalogueSourceError } from "./catalogue-source.error.mjs";

/**
 * @description Plans collision-free public definition facades independently from source layout.
 */
export class CatalogueSourceFacadePlanner {
  /** @description Deterministic generated facade source serialiser. */
  #serialiser;

  /** @description Repository path composition capability. */
  #paths;

  /** @description Stable public subpath and generated facade path authority. */
  #facadeResolver;

  /** @description Icon names owned by exact or distinct package subpath families. */
  #reservedIconNames;

  /** @description Canonical source and dictionary export naming authority. */
  #layouts;

  /**
   * @description Creates one generated public facade planner.
   * @param {import("./catalogue-source.serialiser.mjs").CatalogueSourceSerialiser} serialiser - Generated source serialiser.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   * @param {import("./catalogue-source-facade.resolver.mjs").CatalogueSourceFacadeResolver} facadeResolver - Public subpath and facade path authority.
   * @param {readonly string[]} reservedIconNames - Icon names unavailable to ordinary icon subpaths.
   * @param {import("./catalogue-source-layout.normaliser.mjs").CatalogueSourceLayoutNormaliser} layouts - Canonical export naming authority.
   */
  constructor(serialiser, paths, facadeResolver, reservedIconNames, layouts) {
    this.#serialiser = serialiser;
    this.#paths = paths;
    this.#facadeResolver = facadeResolver;
    this.#reservedIconNames = new Set(reservedIconNames);
    this.#layouts = layouts;
  }

  /**
   * @description Plans every public facade after rejecting reserved or ambiguous subpaths.
   * @param {string} packageRoot - Absolute Icons package root.
   * @param {readonly import("../contracts/internal/catalogue-source-family-inspection.contract.mjs").ICatalogueSourceFamilyInspection[]} inspections - Complete validated family inspections.
   * @returns {readonly import("../contracts/internal/catalogue-source-output.contract.mjs").ICatalogueSourceOutput[]} Canonically ordered facade outputs.
   */
  plan(packageRoot, inspections) {
    const outputs = [];
    const publicSubpaths = new Set();

    for (const { family, modules } of inspections) {
      for (const module of modules) {
        if (
          family.kind === catalogueSourceFamilyKinds.icon &&
          this.#reservedIconNames.has(module.name)
        ) {
          throw new CatalogueSourceError(
            `Canonical icon name collides with a reserved public subpath: ${module.name}`,
          );
        }

        const publicSubpath = this.#facadeResolver.publicSubpath(
          family.kind,
          module,
        );

        if (publicSubpaths.has(publicSubpath)) {
          throw new CatalogueSourceError(
            `Ambiguous generated catalogue public subpath: ${publicSubpath}`,
          );
        }

        publicSubpaths.add(publicSubpath);
        const relativePath = this.#facadeResolver.path(family, module);
        outputs.push(
          Object.freeze({
            path: this.#paths.resolve(packageRoot, relativePath),
            relativePath,
            content: this.#serialiser.facade(relativePath, module),
          }),
        );
      }

      if (family.kind === catalogueSourceFamilyKinds.icon) {
        outputs.push(
          ...this.#glyphs(packageRoot, family, modules, publicSubpaths),
        );
      }
    }

    return Object.freeze(outputs);
  }

  /**
   * @description Groups complete glyph identities and rejects ambiguous dictionaries before publication.
   * @param {string} packageRoot - Absolute Icons package root.
   * @param {import("../contracts/internal/catalogue-source-family.contract.mjs").ICatalogueSourceFamily} family - Icon source-family configuration.
   * @param {readonly import("../contracts/internal/catalogue-source-module.contract.mjs").ICatalogueSourceModule[]} modules - Canonically ordered icon modules.
   * @param {Set<string>} publicSubpaths - Public routes already claimed by planned facades.
   * @returns {readonly import("../contracts/internal/catalogue-source-output.contract.mjs").ICatalogueSourceOutput[]} Derived dictionary outputs.
   */
  #glyphs(packageRoot, family, modules, publicSubpaths) {
    /** @description Canonical treatments indexed by their unique public glyph path. @type {Map<string, import("../contracts/internal/catalogue-source-module.contract.mjs").ICatalogueSourceModule[]>} */
    const groups = new Map();

    for (const module of modules) {
      const group = groups.get(module.name);
      if (group === undefined) {
        groups.set(module.name, [module]);
      } else {
        if (
          group[0]?.manifest.identity.namespace !==
          module.manifest.identity.namespace
        ) {
          throw new CatalogueSourceError(
            `Ambiguous generated glyph public subpath across namespaces: ${module.name}`,
          );
        }
        group.push(module);
      }
    }

    return Object.freeze(
      [...groups].map(([name, group]) => {
        if (publicSubpaths.has(name)) {
          throw new CatalogueSourceError(
            `Ambiguous generated catalogue public subpath: ${name}`,
          );
        }
        publicSubpaths.add(name);

        const symbol = this.#layouts.glyphSymbol(name);
        const properties = new Set();
        const bindings = new Set([symbol]);
        const entries = group.map((module) => {
          if (module.variant === undefined) {
            throw new CatalogueSourceError(
              `Canonical icon ${name} requires an explicit variant.`,
            );
          }
          const propertyName = Icon.variantPropertyName(module.variant);
          if (properties.has(propertyName)) {
            throw new CatalogueSourceError(
              `Generated glyph variant property collision: ${name}.${propertyName}`,
            );
          }
          if (bindings.has(module.exportName)) {
            throw new CatalogueSourceError(
              `Generated glyph symbol collision: ${name} imports ${module.exportName}`,
            );
          }
          properties.add(propertyName);
          bindings.add(module.exportName);

          return Object.freeze({ propertyName, module });
        });
        const relativePath = this.#facadeResolver.glyphPath(family, name);

        return Object.freeze({
          path: this.#paths.resolve(packageRoot, relativePath),
          relativePath,
          content: this.#serialiser.glyph(relativePath, symbol, entries),
        });
      }),
    );
  }
}
