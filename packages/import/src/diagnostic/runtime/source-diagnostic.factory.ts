import type { SourceDiagnostic } from "../contracts/index.js";
import type { DiagnosticCodeType } from "../types/index.js";
import type { TSourceDiagnosticInput } from "../types/internal/source-diagnostic-input.type.js";
import { IconImportError } from "../../error/index.js";
import { ImportValueValidator } from "../../shared/runtime/import-value.validator.js";
import { SourceIdValidator } from "../../source/runtime/source-id.validator.js";
import { diagnosticCodePolicy } from "../constants/diagnostic-code-policy.constant.js";
import { DiagnosticMessageNormaliser } from "./diagnostic-message.normaliser.js";
import { DiagnosticRelatedContextFactory } from "./diagnostic-related-context.factory.js";
import { SourceSpanFactory } from "./source-span.factory.js";

/**
 * @description Validates and deeply freezes stable Aster-owned diagnostics.
 */
export class SourceDiagnosticFactory {
  /**
   * @description Primitive Import value validator.
   */
  readonly #validator = new ImportValueValidator();

  /**
   * @description Strict logical source identifier validator.
   */
  readonly #sourceIdValidator = new SourceIdValidator();

  /**
   * @description Source span construction authority.
   */
  readonly #spanFactory = new SourceSpanFactory();

  /**
   * @description Related-context construction authority.
   */
  readonly #relatedFactory = new DiagnosticRelatedContextFactory();

  /**
   * @description Stable diagnostic-message normaliser.
   */
  readonly #messageNormaliser = new DiagnosticMessageNormaliser();

  /**
   * @description Creates one canonical immutable diagnostic.
   * @remarks Required evidence must be own data. Inherited optional context is absent rather than
   * trusted source evidence; aggregation observes the same own-field rule without rebuilding values.
   * @param value - Internal occurrence-specific diagnostic input.
   * @returns Deeply frozen canonical diagnostic.
   */
  create(value: TSourceDiagnosticInput): SourceDiagnostic {
    const path = "diagnostic";
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(
      record,
      ["code", "message", "sourceId", "span", "related"],
      path,
    );
    const code = this.#validateCode(
      Object.hasOwn(record, "code") ? record.code : undefined,
      `${path}.code`,
    );
    const policy = diagnosticCodePolicy[code];
    const message = this.#messageNormaliser.normalise(
      Object.hasOwn(record, "message") ? record.message : undefined,
      `${path}.message`,
    );
    const sourceId = this.#sourceIdValidator.validate(
      Object.hasOwn(record, "sourceId") ? record.sourceId : undefined,
      `${path}.sourceId`,
    );
    const span =
      Object.hasOwn(record, "span")
        ? this.#spanFactory.create(record.span, `${path}.span`)
        : undefined;
    const related =
      Object.hasOwn(record, "related")
        ? this.#relatedFactory.createSequence(
            record.related,
            `${path}.related`,
          )
        : undefined;

    return Object.freeze({
      code,
      severity: policy.severity,
      category: policy.category,
      message,
      sourceId,
      ...(span === undefined ? {} : { span }),
      ...(related === undefined ? {} : { related }),
    });
  }

  /**
   * @description Accepts one code owned by the complete diagnostic policy.
   * @param value - Unknown diagnostic code.
   * @param path - Logical code path.
   * @returns Accepted diagnostic code.
   */
  #validateCode(
    value: unknown,
    path: string,
  ): DiagnosticCodeType {
    if (
      typeof value !== "string" ||
      !Object.hasOwn(diagnosticCodePolicy, value)
    ) {
      throw new IconImportError(
        path,
        "expected a known Aster diagnostic code",
      );
    }

    return value as DiagnosticCodeType;
  }
}
