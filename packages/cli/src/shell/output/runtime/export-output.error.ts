import type { TExportOutputErrorKind } from "../types/internal/export-output-error-kind.type.js";

/**
 * @description Sanitised private failure raised while validating or publishing an output tree.
 */
export class ExportOutputError extends Error {
  /**
   * @description Stable output failure family used by the shell diagnostic adapter.
   */
  readonly kind: TExportOutputErrorKind;

  /**
   * @description Creates one sanitised output error without retaining native exception details.
   * @param kind - Stable output failure family.
   * @param message - Stable shell-owned explanation.
   */
  constructor(kind: TExportOutputErrorKind, message: string) {
    super(message);
    this.name = "ExportOutputError";
    this.kind = kind;
  }
}
