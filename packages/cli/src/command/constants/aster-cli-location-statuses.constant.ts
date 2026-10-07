/**
 * @description Closed comparison outcomes between the executed and direct project CLI.
 */
export const asterCliLocationStatuses = Object.freeze({
  /** @description The direct project CLI is the executed installation. */
  same: "same",
  /** @description A different direct project CLI is installed. */
  different: "different",
  /** @description The project has no directly installed CLI. */
  absent: "absent",
  /** @description No current project manifest could be found. */
  noProject: "no-project",
  /** @description Project comparison could not be completed safely. */
  unavailable: "unavailable",
} as const);
