import type { asterCommandSubjects } from "../constants/aster-command-subjects.constant.js";

/**
 * @description Portable identity family accepted by exact show invocations.
 */
export type AsterCommandShowSubjectType =
  (typeof asterCommandSubjects.show)[keyof typeof asterCommandSubjects.show];
