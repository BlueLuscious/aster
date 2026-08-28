import type { IconImportFormatType } from "../../format/types/index.js";

/**
 * @description Stable acquired-source evidence retained by an imported draft.
 */
export interface IconImportProvenance {
  /**
   * @description Exact built-in format that produced the draft.
   */
  readonly format: IconImportFormatType;

  /**
   * @description Stable host-owned logical source identifier.
   */
  readonly sourceId: string;
}
