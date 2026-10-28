import { RepositoryFileWalker } from "../../shared/runtime/repository-file.walker.mjs";
import { RepositoryPathResolver } from "../../shared/runtime/repository-path.resolver.mjs";
import { catalogueSourceGeneration } from "../constants/catalogue-source-generation.constant.mjs";
import { CatalogueSourceFacadePlanner } from "./catalogue-source-facade.planner.mjs";
import { CatalogueSourceFacadeResolver } from "./catalogue-source-facade.resolver.mjs";
import { CatalogueSourceDynamicPlanner } from "./catalogue-source-dynamic.planner.mjs";
import { CatalogueSourceExportsPlanner } from "./catalogue-source-exports.planner.mjs";
import { CatalogueSourceKeySerialiser } from "./catalogue-source-key.serialiser.mjs";
import { CatalogueSourceLayoutNormaliser } from "./catalogue-source-layout.normaliser.mjs";
import { CatalogueSourceManifestInspector } from "./catalogue-source-manifest.inspector.mjs";
import { CatalogueSourceManifestPlanner } from "./catalogue-source-manifest.planner.mjs";
import { CatalogueSourceModuleInspector } from "./catalogue-source-module.inspector.mjs";
import { CatalogueSourceRelationshipInspector } from "./catalogue-source-relationship.inspector.mjs";
import { CatalogueSourceSerialiser } from "./catalogue-source.serialiser.mjs";
import { CatalogueSourceSynchroniser } from "./catalogue-source.synchroniser.mjs";
import { CatalogueSourceSyntaxInspector } from "./catalogue-source-syntax.inspector.mjs";
import { CatalogueSourceValueResolver } from "./catalogue-source-value.resolver.mjs";
import { NodeCatalogueSourceFileSystem } from "./node-catalogue-source-file-system.mjs";

/**
 * @description Composes catalogue source synchronisation from private repository capabilities.
 */
export class CatalogueSourceSynchroniserFactory {
  /**
   * @description Creates one independently stateful catalogue source synchroniser.
   * @param {import("../contracts/internal/catalogue-source-file-system.contract.mjs").ICatalogueSourceFileSystem} [fileSystem] - Borrowed acquisition/publication capability; defaults to the Node adapter.
   * @returns {CatalogueSourceSynchroniser} Fully composed catalogue source synchroniser.
   */
  create(fileSystem = new NodeCatalogueSourceFileSystem()) {
    const paths = new RepositoryPathResolver();
    const files = new RepositoryFileWalker(fileSystem, paths);
    const serialiser = new CatalogueSourceSerialiser(
      catalogueSourceGeneration.command,
    );
    const facadeResolver = new CatalogueSourceFacadeResolver();
    const layouts = new CatalogueSourceLayoutNormaliser();
    const keys = new CatalogueSourceKeySerialiser();

    return new CatalogueSourceSynchroniser(
      fileSystem,
      this.#modules(fileSystem, paths, files, layouts),
      new CatalogueSourceFacadePlanner(
        serialiser,
        paths,
        facadeResolver,
        catalogueSourceGeneration.reservedIconNames,
        layouts,
      ),
      new CatalogueSourceManifestPlanner(
        serialiser,
        paths,
        keys,
        catalogueSourceGeneration.manifestPath,
      ),
      new CatalogueSourceDynamicPlanner(
        serialiser,
        paths,
        keys,
        catalogueSourceGeneration.dynamicPath,
      ),
      paths,
      new CatalogueSourceRelationshipInspector(paths),
      files,
      catalogueSourceGeneration.families,
      catalogueSourceGeneration.facadeRoot,
      new CatalogueSourceExportsPlanner(fileSystem, paths, facadeResolver),
    );
  }

  /**
   * @description Inspects the complete canonical graph through an explicit read capability.
   * @param {string} packageRoot - Absolute Icons package root.
   * @param {import("../contracts/internal/catalogue-source-file-system.contract.mjs").ICatalogueSourceFileSystem} fileSystem - Borrowed source acquisition capability.
   * @returns {Promise<readonly import("../contracts/internal/catalogue-source-family-inspection.contract.mjs").ICatalogueSourceFamilyInspection[]>} Validated canonical families.
   */
  async inspect(packageRoot, fileSystem) {
    const paths = new RepositoryPathResolver();
    const modules = this.#modules(
      fileSystem,
      paths,
      new RepositoryFileWalker(fileSystem, paths),
      new CatalogueSourceLayoutNormaliser(),
    );
    const inspections = [];
    modules.reset();
    for (const family of catalogueSourceGeneration.families) {
      inspections.push(Object.freeze({ family, modules: await modules.inspect(packageRoot, family) }));
    }
    new CatalogueSourceRelationshipInspector(paths).validate(inspections);
    return Object.freeze(inspections);
  }

  /**
   * @description Composes the existing per-family syntax and metadata inspection lifecycle.
   * @param {import("../contracts/internal/catalogue-source-file-system.contract.mjs").ICatalogueSourceFileSystem} fileSystem - Borrowed source reader.
   * @param {RepositoryPathResolver} paths - Path capability.
   * @param {RepositoryFileWalker} files - Deterministic file traversal.
   * @param {CatalogueSourceLayoutNormaliser} layouts - Canonical source layout authority.
   * @returns {CatalogueSourceModuleInspector} Fresh source-module inspector.
   */
  #modules(fileSystem, paths, files, layouts) {
    return new CatalogueSourceModuleInspector(
      fileSystem, files, paths, layouts,
      new CatalogueSourceSyntaxInspector(
        new CatalogueSourceManifestInspector(new CatalogueSourceValueResolver(fileSystem, paths)),
      ),
    );
  }
}
