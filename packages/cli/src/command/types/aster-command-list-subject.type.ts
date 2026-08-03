import type { asterCommandSubjects } from "../constants/aster-command-subjects.constant.js";

/**
 * @description Catalogue value family accepted by deterministic list invocations.
 */
export type AsterCommandListSubjectType =
  (typeof asterCommandSubjects.list)[keyof typeof asterCommandSubjects.list];
