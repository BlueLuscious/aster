/**
 * @description Immutable evidence returned after an output plan is handled successfully.
 */
export type TExportOutputPublication = Readonly<{
  /**
   * @description Absolute requested output root.
   */
  targetRoot: string;

  /**
   * @description Number of complete artefacts published under the target root.
   */
  artefactCount: number;

  /**
   * @description Whether a visible output tree was committed.
   */
  committed: boolean;
}>;
