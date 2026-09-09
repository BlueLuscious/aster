/**
 * @description Resolved same-parent target and private roots for one publication.
 */
export type TOutputLocation = Readonly<{
  /**
   * @description Absolute requested output root.
   */
  targetRoot: string;

  /**
   * @description Absolute private sibling used to stage the complete output.
   */
  stageRoot: string;

  /**
   * @description Absolute parent shared by all publication roots.
   */
  parentRoot: string;
}>;
