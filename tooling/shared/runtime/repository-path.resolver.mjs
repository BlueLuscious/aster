import { dirname, relative, resolve, sep } from "node:path";

/**
 * @description Resolves, relates, and presents repository filesystem paths deterministically.
 */
export class RepositoryPathResolver {
  /**
   * @description Resolves path segments through the host path implementation.
   * @param {...string} segments - Ordered path segments.
   * @returns {string} Absolute resolved path.
   */
  resolve(...segments) {
    return resolve(...segments);
  }

  /**
   * @description Returns the parent directory of one path.
   * @param {string} path - Path whose parent is requested.
   * @returns {string} Parent directory path.
   */
  dirname(path) {
    return dirname(path);
  }

  /**
   * @description Relates one target path to a root path.
   * @param {string} root - Reference root path.
   * @param {string} target - Target path.
   * @returns {string} Host-relative path.
   */
  relative(root, target) {
    return relative(root, target);
  }

  /**
   * @description Determines whether one resolved target is equal to or contained by a root.
   * @param {string} root - Candidate ancestor path.
   * @param {string} target - Candidate descendant path.
   * @returns {boolean} Whether the target remains inside the root boundary.
   */
  contains(root, target) {
    const relation = relative(resolve(root), resolve(target));

    return relation === "" || (relation !== ".." && !relation.startsWith(`..${sep}`));
  }

  /**
   * @description Converts a repository-relative host path to slash-separated presentation.
   * @param {string} root - Repository root path.
   * @param {string} target - Path beneath the repository root.
   * @returns {string} Portable repository-relative path.
   */
  display(root, target) {
    return relative(root, target).split(sep).join("/");
  }
}
