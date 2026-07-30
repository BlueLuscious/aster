/**
 * @description One public collection-package subpath and its generated TypeScript source.
 */
export interface IPlannedPackageExport {
  /**
   * @description Canonical package export key such as `.`, `./camera`, or `./manifest`.
   */
  readonly subpath: string;

  /**
   * @description Generated-root-relative TypeScript module implementing the export.
   */
  readonly sourcePath: string;
}
