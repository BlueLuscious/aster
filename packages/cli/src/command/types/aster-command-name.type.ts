import type { asterCommandNames } from "../constants/aster-command-names.constant.js";

/**
 * @description Stable identity of one accepted Aster command.
 */
export type AsterCommandNameType =
  (typeof asterCommandNames)[keyof typeof asterCommandNames];
