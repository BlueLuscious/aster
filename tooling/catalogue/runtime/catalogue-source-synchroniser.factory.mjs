import { RepositoryPathResolver } from "../../shared/runtime/repository-path.resolver.mjs";
import { catalogueSourceGeneration } from "../constants/catalogue-source-generation.constant.mjs";
import { CatalogueSourceModuleInspector } from "./catalogue-source-module.inspector.mjs";
import { CatalogueSourceSerialiser } from "./catalogue-source.serialiser.mjs";
import { CatalogueSourceSynchroniser } from "./catalogue-source.synchroniser.mjs";
import { NodeCatalogueSourceFileSystem } from "./node-catalogue-source-file-system.mjs";

/**
 * @description Composes catalogue source synchronisation from private repository capabilities.
 */
export class CatalogueSourceSynchroniserFactory {
  /**
   * @description Creates one independently stateful catalogue source synchroniser.
   * @returns {CatalogueSourceSynchroniser} Fully composed catalogue source synchroniser.
   */
  create() {
    const fileSystem = new NodeCatalogueSourceFileSystem();
    const paths = new RepositoryPathResolver();

    return new CatalogueSourceSynchroniser(
      fileSystem,
      new CatalogueSourceModuleInspector(fileSystem, paths),
      new CatalogueSourceSerialiser(catalogueSourceGeneration.command),
      paths,
      catalogueSourceGeneration.families,
    );
  }
}
