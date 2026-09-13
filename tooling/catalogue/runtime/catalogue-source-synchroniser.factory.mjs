import { RepositoryFileWalker } from "../../shared/runtime/repository-file.walker.mjs";
import { RepositoryPathResolver } from "../../shared/runtime/repository-path.resolver.mjs";
import { catalogueSourceGeneration } from "../constants/catalogue-source-generation.constant.mjs";
import { CatalogueSourceLayoutNormaliser } from "./catalogue-source-layout.normaliser.mjs";
import { CatalogueSourceModuleInspector } from "./catalogue-source-module.inspector.mjs";
import { CatalogueSourceRelationshipInspector } from "./catalogue-source-relationship.inspector.mjs";
import { CatalogueSourceSerialiser } from "./catalogue-source.serialiser.mjs";
import { CatalogueSourceSynchroniser } from "./catalogue-source.synchroniser.mjs";
import { CatalogueSourceSyntaxInspector } from "./catalogue-source-syntax.inspector.mjs";
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
    const files = new RepositoryFileWalker(fileSystem, paths);

    return new CatalogueSourceSynchroniser(
      fileSystem,
      new CatalogueSourceModuleInspector(
        fileSystem,
        files,
        paths,
        new CatalogueSourceLayoutNormaliser(),
        new CatalogueSourceSyntaxInspector(),
      ),
      new CatalogueSourceSerialiser(catalogueSourceGeneration.command),
      paths,
      new CatalogueSourceRelationshipInspector(paths),
      catalogueSourceGeneration.families,
    );
  }
}
