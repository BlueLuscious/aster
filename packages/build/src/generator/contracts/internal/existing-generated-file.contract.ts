/**
 * @description Existing generated-root-relative text file supplied by a filesystem host.
 */
export interface IExistingGeneratedFile {
  /**
   * @description Canonical generated-root-relative path using `/` separators.
   */
  readonly path: string;

  /**
   * @description Exact existing UTF-8 text content.
   */
  readonly content: string;
}
