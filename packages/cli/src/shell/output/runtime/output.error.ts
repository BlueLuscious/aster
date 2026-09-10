import type { TOutputErrorKind } from "../types/internal/output-error-kind.type.js";

/**
 * @description Sanitised private output-host failure translated at the shell boundary.
 */
export class OutputError extends Error {
  /**
   * @description Stable output-conflict or operation-failure discriminator.
   */
  readonly kind: TOutputErrorKind;

  /**
   * @description Creates one sanitised output-host error.
   * @param kind - Stable private failure family.
   * @param message - Shell-owned failure description without native details.
   */
  constructor(kind: TOutputErrorKind, message: string) {
    super(message);
    this.name = "OutputError";
    this.kind = kind;
  }
}
