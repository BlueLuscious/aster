import type { asterCliLocationStatuses } from "../constants/aster-cli-location-statuses.constant.js";

/**
 * @description Outcome of comparing the executed CLI with the current project's direct CLI.
 */
export type AsterCliLocationStatusType =
  (typeof asterCliLocationStatuses)[keyof typeof asterCliLocationStatuses];
