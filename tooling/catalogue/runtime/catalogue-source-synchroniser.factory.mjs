import { RepositoryFileWalker } from "../../shared/runtime/repository-file.walker.mjs";
import { RepositoryPathResolver } from "../../shared/runtime/repository-path.resolver.mjs";
import { catalogueSourceGeneration } from "../constants/catalogue-source-generation.constant.mjs";
import { CatalogueSourceFacadePlanner } from "./catalogue-source-facade.planner.mjs";
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
   * @returns {CatalogueSourceSynchroniser} Fully composed catalogue source synchroniser.
   */
  create() {
    const fileSystem = new NodeCatalogueSourceFileSystem();
    const paths = new RepositoryPathResolver();
    const files = new RepositoryFileWalker(fileSystem, paths);
    const serialiser = new CatalogueSourceSerialiser(
      catalogueSourceGeneration.command,
    );

    return new CatalogueSourceSynchroniser(
      fileSystem,
      new CatalogueSourceModuleInspector(
        fileSystem,
        files,
        paths,
        new CatalogueSourceLayoutNormaliser(),
        new CatalogueSourceSyntaxInspector(
          new CatalogueSourceManifestInspector(
            new CatalogueSourceValueResolver(fileSystem, paths),
          ),
        ),
      ),
      serialiser,
      new CatalogueSourceFacadePlanner(
        serialiser,
        paths,
        catalogueSourceGeneration.reservedIconNames,
      ),
      new CatalogueSourceManifestPlanner(
        serialiser,
        paths,
        catalogueSourceGeneration.manifestPath,
      ),
      paths,
      new CatalogueSourceRelationshipInspector(paths),
      files,
      catalogueSourceGeneration.families,
      catalogueSourceGeneration.facadeRoot,
    );
  }
}
