/**
 * @description One complete generated-root-relative UTF-8 text file.
 */
export interface IPlannedFile {
  /**
   * @description Canonical generated-root-relative path using `/` separators.
   */
  readonly path: string;

  /**
   * @description Byte-stable LF-terminated text content.
   */
  readonly content: string;
}
