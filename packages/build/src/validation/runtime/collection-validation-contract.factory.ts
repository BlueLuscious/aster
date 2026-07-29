import type { ICollectionBoundsRule } from "../contracts/internal/collection-bounds-rule.contract.js";
import type { ICollectionComplexityRule } from "../contracts/internal/collection-complexity-rule.contract.js";
import type { ICollectionGridRule } from "../contracts/internal/collection-grid-rule.contract.js";
import type { ICollectionStrokeRule } from "../contracts/internal/collection-stroke-rule.contract.js";
import type { ICollectionValidationContract } from "../contracts/internal/collection-validation-contract.contract.js";
import type { ICollectionViewBoxRule } from "../contracts/internal/collection-view-box-rule.contract.js";
import type { TCollectionRuleSeverity } from "../types/internal/collection-rule-severity.type.js";
import { diagnosticSeverities } from "../../diagnostic/constants/diagnostic-severities.constant.js";
import { BuildContractError } from "../../shared/runtime/build-contract.error.js";
import { BuildValueValidator } from "../../shared/runtime/build-value.validator.js";
import { SourceIdentityNormaliser } from "../../source/runtime/source-identity.normaliser.js";

/**
 * @description Validates, clones, and freezes collection-owned visual validation authority.
 */
export class CollectionValidationContractFactory {
  /**
   * @description Primitive build-value validator.
   */
  readonly #validator = new BuildValueValidator();

  /**
   * @description Canonical collection-identity authority.
   */
  readonly #identityNormaliser = new SourceIdentityNormaliser();

  /**
   * @description Creates one accepted immutable collection validation contract.
   * @param value - Unknown collection-rule configuration.
   * @returns Deeply frozen accepted collection authority.
   */
  create(value: unknown): ICollectionValidationContract {
    const path = "collectionContract";
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(
      record,
      ["collection", "viewBox", "stroke", "grid", "bounds", "complexity"],
      path,
    );
    const collection = this.#identityNormaliser.normaliseCollection(
      record.collection,
      `${path}.collection`,
    );
    const viewBox =
      "viewBox" in record
        ? this.#createViewBoxRule(record.viewBox, `${path}.viewBox`)
        : undefined;
    const stroke =
      "stroke" in record
        ? this.#createStrokeRule(record.stroke, `${path}.stroke`)
        : undefined;
    const grid =
      "grid" in record
        ? this.#createGridRule(record.grid, `${path}.grid`)
        : undefined;
    const bounds =
      "bounds" in record
        ? this.#createBoundsRule(record.bounds, `${path}.bounds`)
        : undefined;
    const complexity =
      "complexity" in record
        ? this.#createComplexityRule(
            record.complexity,
            `${path}.complexity`,
          )
        : undefined;

    if (
      viewBox !== undefined &&
      bounds !== undefined &&
      (bounds.inset[0] + bounds.inset[2] >= viewBox.expected.width ||
        bounds.inset[1] + bounds.inset[3] >= viewBox.expected.height)
    ) {
      throw new BuildContractError(
        `${path}.bounds.inset`,
        "expected a positive safe area inside the configured viewBox",
      );
    }

    return Object.freeze({
      collection,
      ...(viewBox === undefined ? {} : { viewBox }),
      ...(stroke === undefined ? {} : { stroke }),
      ...(grid === undefined ? {} : { grid }),
      ...(bounds === undefined ? {} : { bounds }),
      ...(complexity === undefined ? {} : { complexity }),
    });
  }

  /**
   * @description Creates one expected viewBox rule.
   * @param value - Unknown rule value.
   * @param path - Logical rule path.
   * @returns Frozen accepted viewBox rule.
   */
  #createViewBoxRule(
    value: unknown,
    path: string,
  ): ICollectionViewBoxRule {
    const record = this.#ruleRecord(value, path, ["expected", "severity"]);
    const expectedPath = `${path}.expected`;
    const input = this.#validator.record(record.expected, expectedPath);
    this.#validator.exactFields(
      input,
      ["minX", "minY", "width", "height"],
      expectedPath,
    );
    const expected = Object.freeze({
      minX: this.#validator.finiteNumber(
        input.minX,
        `${expectedPath}.minX`,
      ),
      minY: this.#validator.finiteNumber(
        input.minY,
        `${expectedPath}.minY`,
      ),
      width: this.#validator.positiveNumber(
        input.width,
        `${expectedPath}.width`,
      ),
      height: this.#validator.positiveNumber(
        input.height,
        `${expectedPath}.height`,
      ),
    });

    return Object.freeze({
      expected,
      severity: this.#severity(record.severity, `${path}.severity`),
    });
  }

  /**
   * @description Creates one accepted source-stroke rule.
   * @param value - Unknown rule value.
   * @param path - Logical rule path.
   * @returns Frozen accepted stroke rule.
   */
  #createStrokeRule(
    value: unknown,
    path: string,
  ): ICollectionStrokeRule {
    const record = this.#ruleRecord(value, path, [
      "acceptedWidths",
      "severity",
    ]);
    const widths = this.#validator
      .array(record.acceptedWidths, `${path}.acceptedWidths`)
      .map((width, index) =>
        this.#validator.nonNegativeNumber(
          width,
          `${path}.acceptedWidths[${index}]`,
        ),
      );

    if (widths.length === 0) {
      throw new BuildContractError(
        `${path}.acceptedWidths`,
        "expected at least one width",
      );
    }

    if (new Set(widths).size !== widths.length) {
      throw new BuildContractError(
        `${path}.acceptedWidths`,
        "expected duplicate-free widths",
      );
    }

    widths.sort((left, right) => left - right);

    return Object.freeze({
      acceptedWidths: Object.freeze(widths),
      severity: this.#severity(record.severity, `${path}.severity`),
    });
  }

  /**
   * @description Creates one construction-grid rule.
   * @param value - Unknown rule value.
   * @param path - Logical rule path.
   * @returns Frozen accepted grid rule.
   */
  #createGridRule(value: unknown, path: string): ICollectionGridRule {
    const record = this.#ruleRecord(value, path, ["step", "severity"]);

    return Object.freeze({
      step: this.#validator.positiveNumber(record.step, `${path}.step`),
      severity: this.#severity(record.severity, `${path}.severity`),
    });
  }

  /**
   * @description Creates one nominal safe-area rule.
   * @param value - Unknown rule value.
   * @param path - Logical rule path.
   * @returns Frozen accepted bounds rule.
   */
  #createBoundsRule(
    value: unknown,
    path: string,
  ): ICollectionBoundsRule {
    const record = this.#ruleRecord(value, path, ["inset", "severity"]);
    const input = this.#validator.array(record.inset, `${path}.inset`);

    if (input.length !== 4) {
      throw new BuildContractError(
        `${path}.inset`,
        "expected exactly four numbers",
      );
    }

    const inset = Object.freeze(
      input.map((entry, index) =>
        this.#validator.nonNegativeNumber(
          entry,
          `${path}.inset[${index}]`,
        ),
      ),
    ) as readonly [number, number, number, number];

    return Object.freeze({
      inset,
      severity: this.#severity(record.severity, `${path}.severity`),
    });
  }

  /**
   * @description Creates one provisional complexity rule.
   * @param value - Unknown rule value.
   * @param path - Logical rule path.
   * @returns Frozen accepted complexity rule.
   */
  #createComplexityRule(
    value: unknown,
    path: string,
  ): ICollectionComplexityRule {
    const record = this.#ruleRecord(value, path, [
      "maxPrimitives",
      "maxPathCommands",
      "severity",
    ]);

    return Object.freeze({
      maxPrimitives: this.#validator.integer(
        record.maxPrimitives,
        1,
        `${path}.maxPrimitives`,
      ),
      maxPathCommands: this.#validator.integer(
        record.maxPathCommands,
        1,
        `${path}.maxPathCommands`,
      ),
      severity: this.#severity(record.severity, `${path}.severity`),
    });
  }

  /**
   * @description Accepts one closed plain rule object.
   * @param value - Unknown rule value.
   * @param path - Logical rule path.
   * @param fields - Closed accepted field sequence.
   * @returns Accepted mutable input record.
   */
  #ruleRecord(
    value: unknown,
    path: string,
    fields: readonly string[],
  ): Record<string, unknown> {
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(record, fields, path);
    return record;
  }

  /**
   * @description Accepts one collection-rule authority.
   * @param value - Unknown severity value.
   * @param path - Logical severity path.
   * @returns Accepted warning or error authority.
   */
  #severity(value: unknown, path: string): TCollectionRuleSeverity {
    if (
      typeof value !== "string" ||
      !Object.hasOwn(diagnosticSeverities, value)
    ) {
      throw new BuildContractError(
        path,
        `expected one of ${Object.values(diagnosticSeverities).join(", ")}`,
      );
    }

    return diagnosticSeverities[
      value as keyof typeof diagnosticSeverities
    ];
  }
}
