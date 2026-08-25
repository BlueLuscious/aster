import type { IconRenderOptions } from "@aster/core";

/**
 * @description Portable render values applied uniformly by icon and collection export.
 */
export type AsterExportOptionsType = Readonly<
  Pick<
    IconRenderOptions,
    "size" | "colour" | "fill" | "stroke" | "strokeWidth" | "direction"
  >
>;

