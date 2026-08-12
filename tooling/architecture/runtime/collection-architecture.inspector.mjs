import { collectionBoundaries } from "../constants/collection-boundaries.constant.mjs";
import { repositoryArchitecturePaths } from "../constants/repository-architecture-paths.constant.mjs";

/**
 * @description Inspects canonical authored collection directory boundaries.
 */
export class CollectionArchitectureInspector {
  /**
   * @description Optional repository directory membership reader.
   * @type {import("../../shared/runtime/repository-directory.reader.mjs").RepositoryDirectoryReader}
   */
  #directories;

  /**
   * @description Repository path composition capability.
   * @type {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver}
   */
  #paths;

  /**
   * @description Creates an authored collection architecture inspector.
   * @param {import("../../shared/runtime/repository-directory.reader.mjs").RepositoryDirectoryReader} directories - Optional directory membership reader.
   * @param {import("../../shared/runtime/repository-path.resolver.mjs").RepositoryPathResolver} paths - Repository path capability.
   */
  constructor(directories, paths) {
    this.#directories = directories;
    this.#paths = paths;
  }

  /**
   * @description Inspects every collection identity and source boundary.
   * @param {string} workspaceRoot - Absolute repository root.
   * @param {import("./architecture-issue.collector.mjs").ArchitectureIssueCollector} issues - Ordered issue collector.
   * @returns {Promise<void>} Completion after all authored collections are inspected.
   */
  async inspect(workspaceRoot, issues) {
    const collectionsRoot = this.#paths.resolve(
      workspaceRoot,
      repositoryArchitecturePaths.collections,
    );
    const collections = await this.#directories.read(collectionsRoot);

    for (const collection of collections) {
      const collectionRoot = this.#paths.resolve(collectionsRoot, collection);

      if (!collectionBoundaries.slugPattern.test(collection)) {
        issues.add(`Collection directory must use a canonical kebab-case slug: ${collection}`);
      }

      const directories = await this.#directories.read(collectionRoot);

      for (const required of collectionBoundaries.required) {
        if (!directories.includes(required)) {
          issues.add(`collections/${collection} is missing authored ${required}/ source`);
        }
      }

      for (const directory of directories) {
        if (collectionBoundaries.forbidden.includes(directory)) {
          issues.add(
            `collections/${collection}/${directory}/ cannot be inside an authored collection`,
          );
        }
      }
    }
  }
}
