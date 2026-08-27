import type { IconRenderOptions } from "@aster/core";
import type { AsterExportOptionsType } from "./aster-export-options.type.js";

/**
 * @description Portable render values accepted when exporting one exact icon.
 */
export type AsterIconExportOptionsType = Readonly<
  AsterExportOptionsType & Pick<IconRenderOptions, "label" | "title">
>;

