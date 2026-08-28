import type { SourceDiagnostic } from "../contracts/index.js";
import type {
  DiagnosticCategoryType,
  DiagnosticCodeType,
  DiagnosticSeverityType,
} from "../types/index.js";
import { IconImportError } from "../../error/index.js";
import { ImportValueValidator } from "../../shared/runtime/import-value.validator.js";
import { SourceIdNormaliser } from "../../source/runtime/source-id.normaliser.js";
import { diagnosticCategories } from "../constants/diagnostic-categories.constant.js";
import { diagnosticCodes } from "../constants/diagnostic-codes.constant.js";
import { diagnosticSeverities } from "../constants/diagnostic-severities.constant.js";
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
   * @param value - Unknown diagnostic value.
   * @returns Deeply frozen canonical diagnostic.
   */
  create(value: unknown): SourceDiagnostic {
    const path = "diagnostic";
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(
      record,
      ["code", "severity", "category", "message", "sourceId", "span", "related"],
      path,
    );
    const category = this.#normaliseCategory(
      record.category,
      `${path}.category`,
    );
    const code = this.#normaliseCode(record.code, category, `${path}.code`);
    const severity = this.#normaliseSeverity(
      record.severity,
      `${path}.severity`,
    );
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
      severity,
      category,
      message,
      sourceId,
      ...(span === undefined ? {} : { span }),
      ...(related === undefined ? {} : { related }),
    });
  }

  /**
   * @description Accepts one closed diagnostic category.
   * @param value - Unknown category.
   * @param path - Logical category path.
   * @returns Accepted category.
   */
  #normaliseCategory(
    value: unknown,
    path: string,
  ): DiagnosticCategoryType {
    if (
      typeof value !== "string" ||
      !Object.hasOwn(diagnosticCategories, value)
    ) {
      throw new IconImportError(
        path,
        `expected one of ${Object.values(diagnosticCategories).join(", ")}`,
      );
    }

    return diagnosticCategories[
      value as keyof typeof diagnosticCategories
    ];
  }

  /**
   * @description Accepts one known code whose category matches its diagnostic authority.
   * @param value - Unknown diagnostic code.
   * @param category - Accepted diagnostic category.
   * @param path - Logical code path.
   * @returns Accepted diagnostic code.
   */
  #normaliseCode(
    value: unknown,
    category: DiagnosticCategoryType,
    path: string,
  ): DiagnosticCodeType {
    if (
      typeof value !== "string" ||
      !Object.values(diagnosticCodes).includes(value as DiagnosticCodeType) ||
      !value.startsWith(`ASTER-${category.toUpperCase()}-`)
    ) {
      throw new IconImportError(
        path,
        "expected a known Aster code matching the diagnostic category",
      );
    }

    return value as DiagnosticCodeType;
  }

  /**
   * @description Accepts one closed diagnostic severity.
   * @param value - Unknown severity.
   * @param path - Logical severity path.
   * @returns Accepted severity.
   */
  #normaliseSeverity(
    value: unknown,
    path: string,
  ): DiagnosticSeverityType {
    if (
      typeof value !== "string" ||
      !Object.hasOwn(diagnosticSeverities, value)
    ) {
      throw new IconImportError(
        path,
        `expected one of ${Object.values(diagnosticSeverities).join(", ")}`,
      );
    }

    return diagnosticSeverities[
      value as keyof typeof diagnosticSeverities
    ];
  }
}
