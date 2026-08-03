import type { AsterCommandResultType } from "../../command/types/index.js";

/**
 * @description Renders one structured result as a stable unstyled JSON document.
 */
export class JsonOutputPresenter {
  /**
   * @description Serialises one closed command result without terminal decoration.
   * @param result - Immutable JSON-serialisable command result.
   * @returns One compact JSON document without a final newline.
   */
  present(result: AsterCommandResultType): string {
    return JSON.stringify(result);
  }
}
