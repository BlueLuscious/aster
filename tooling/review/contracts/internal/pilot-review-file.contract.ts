/**
 * @description One generated review artefact planned relative to the owned output root.
 */
export interface IPilotReviewFile {
  /**
   * @description Canonical `/`-separated path relative to the review output root.
   */
  readonly path: string;

  /**
   * @description Complete deterministic UTF-8 text content.
   */
  readonly content: string;
}
