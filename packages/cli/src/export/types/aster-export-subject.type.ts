import type { asterCommandSubjects } from "../../command/constants/aster-command-subjects.constant.js";

/**
 * @description Closed portable value family accepted by SVG export.
 */
export type AsterExportSubjectType =
  (typeof asterCommandSubjects.export)[keyof typeof asterCommandSubjects.export];

