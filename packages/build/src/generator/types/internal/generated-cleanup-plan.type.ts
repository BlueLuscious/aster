/**
 * @description Pure cleanup analysis for one existing generated-root snapshot.
 */
export type TGeneratedCleanupPlan = {
  /**
   * @description Owned files absent from the new plan and safe to remove.
   */
  readonly stalePaths: readonly string[];

  /**
   * @description Planned paths currently occupied by files not owned by Aster generation.
   */
  readonly conflictingPaths: readonly string[];
};
