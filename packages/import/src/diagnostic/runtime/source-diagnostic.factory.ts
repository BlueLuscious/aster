import type { SourceDiagnostic } from "../contracts/index.js";
import type { DiagnosticCodeType } from "../types/index.js";
import type { TSourceDiagnosticInput } from "../types/internal/source-diagnostic-input.type.js";
import { IconImportError } from "../../error/index.js";
import { ImportValueValidator } from "../../shared/runtime/import-value.validator.js";
import { SourceIdNormaliser } from "../../source/runtime/source-id.normaliser.js";
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
   * @description Logical source identifier normaliser.
   */
  readonly #sourceIdNormaliser = new SourceIdNormaliser();

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
    const code = this.#normaliseCode(record.code, `${path}.code`);
    const policy = diagnosticCodePolicy[code];
    const message = this.#messageNormaliser.normalise(
      record.message,
      `${path}.message`,
    );
    const sourceId = this.#sourceIdNormaliser.normalise(
      record.sourceId,
      `${path}.sourceId`,
    );
    const span =
      "span" in record
        ? this.#spanFactory.create(record.span, `${path}.span`)
        : undefined;
    const related =
      "related" in record
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
  #normaliseCode(
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
