import type { IconIdentity } from "@aster/core";
import type { iconImportFormats } from "../../format/constants/icon-import-formats.constant.js";

/**
 * @description Exact decoded SVG text acquired and identified by an external host.
 */
export interface SvgIconImportSource {
  /**
   * @description Built-in SVG format discriminator.
   */
  readonly format: typeof iconImportFormats.svg;

  /**
   * @description Stable host-owned logical source identifier using `/` separators.
   */
  readonly sourceId: string;

  /**
   * @description Portable identity established independently from source markup.
   */
  readonly identity: IconIdentity;

  /**
   * @description Exact decoded SVG text without newline normalisation.
   */
  readonly content: string;
}
