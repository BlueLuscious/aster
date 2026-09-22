import type { iconImportFormats } from "../constants/icon-import-formats.constant.js";

/**
 * @description Closed built-in icon source format accepted by Import.
 */
export type IconImportFormatType =
  (typeof iconImportFormats)[keyof typeof iconImportFormats];
