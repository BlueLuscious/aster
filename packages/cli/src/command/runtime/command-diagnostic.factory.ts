import type {
  AsterCommandDiagnosticCategoryType,
  AsterCommandDiagnosticCodeType,
  AsterCommandDiagnosticType,
} from "../types/index.js";

/**
 * @description Constructs isolated immutable command diagnostics at runtime boundaries.
 */
export class CommandDiagnosticFactory {
  /**
   * @description Creates one canonical deeply frozen diagnostic.
   * @param category - Stable responsibility family of the failure.
   * @param code - Stable Aster-owned diagnostic identifier.
   * @param message - Deterministic explanation without native exception text.
   * @param related - Optional ordered serialisable related values.
   * @returns Isolated immutable command diagnostic.
   */
  create(
    category: AsterCommandDiagnosticCategoryType,
    code: AsterCommandDiagnosticCodeType,
    message: string,
    related?: readonly string[],
  ): AsterCommandDiagnosticType {
    const acceptedRelated =
      related === undefined ? undefined : Object.freeze([...related]);

    return Object.freeze({
      category,
      code,
      message,
      ...(acceptedRelated === undefined
        ? {}
        : { related: acceptedRelated }),
    });
  }
}
