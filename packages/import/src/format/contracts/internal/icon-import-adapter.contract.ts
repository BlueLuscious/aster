import type { IconImportDraft } from "../../../adoption/contracts/index.js";
import type { DiagnosticResultType } from "../../../diagnostic/types/index.js";
import type { IconImportSourceType } from "../../../source/types/index.js";
import type { IconImportFormatType } from "../../types/index.js";

/**
 * @description Internal format adapter converting one exact acquired source into a neutral draft.
 * @typeParam Source - Source contract owned by the adapter's exact format.
 */
export interface IIconImportAdapter<
  Source extends IconImportSourceType = IconImportSourceType,
> {
  /**
   * @description Exact built-in source format owned by the adapter.
   */
  readonly format: IconImportFormatType;

  /**
   * @description Inspects one accepted format source without host effects.
   * @param source - Exact source contract owned by this adapter.
   * @returns Complete neutral draft or blocking source diagnostics.
   */
  inspect(source: Source): DiagnosticResultType<IconImportDraft>;
}
