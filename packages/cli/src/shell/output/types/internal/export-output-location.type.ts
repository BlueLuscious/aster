/**
 * @description Resolved same-parent target and private staging roots for one publication.
 */
export type TExportOutputLocation = Readonly<{
  /**
   * @description Absolute requested output root.
   */
  targetRoot: string;

  /**
   * @description Absolute private sibling used to stage the complete output tree.
   */
  stageRoot: string;

  /**
   * @description Absolute parent shared by the target and staging roots.
   */
  parentRoot: string;
}>;
