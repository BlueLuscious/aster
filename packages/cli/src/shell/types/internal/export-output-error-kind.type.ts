import type { exportOutputErrorKinds } from "../../constants/export-output-error-kinds.constant.js";

/**
 * @description Closed private failure family produced by standalone export publication.
 */
export type TExportOutputErrorKind =
  (typeof exportOutputErrorKinds)[keyof typeof exportOutputErrorKinds];
