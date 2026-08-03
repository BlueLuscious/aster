import type { AsterCommandDiagnosticCategoryType } from "./aster-command-diagnostic-category.type.js";
import type { AsterCommandDiagnosticCodeType } from "./aster-command-diagnostic-code.type.js";

/**
 * @description Immutable serialisable evidence for one expected command failure.
 */
export type AsterCommandDiagnosticType = Readonly<{
  /**
   * @description Stable Aster-owned diagnostic identifier.
   */
  code: AsterCommandDiagnosticCodeType;

  /**
   * @description Stable responsibility family of the failure.
   */
  category: AsterCommandDiagnosticCategoryType;

  /**
   * @description Concise deterministic explanation without native exception text.
   */
  message: string;

  /**
   * @description Optional ordered serialisable values related to the failure.
   */
  related?: readonly string[];
}>;
