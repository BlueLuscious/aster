import {
  iconDirections,
  iconPaintSchema,
  type IconDirectionType,
  type IconPaintType,
} from "@aster/core";
import { commandDiagnosticSchema } from "../../command/constants/command-diagnostic-schema.constant.js";
import { CommandDiagnosticFactory } from "../../command/runtime/command-diagnostic.factory.js";
import type { TAcceptanceResult } from "../../command/types/internal/acceptance-result.type.js";
import type {
  AsterExportOptionsType,
  AsterIconExportOptionsType,
} from "../types/index.js";

/**
 * @description Accepts and isolates the closed portable options available to SVG export.
 */
export class ExportOptionsNormaliser {
  /**
   * @description Immutable diagnostic constructor for rejected option records.
   */
  readonly #diagnostics = new CommandDiagnosticFactory();

  /**
   * @description Canonical short hexadecimal paint grammar.
   */
  readonly #shortHexPattern = new RegExp(iconPaintSchema.shortHexPatternSource, "u");

  /**
   * @description Canonical long hexadecimal paint grammar.
   */
  readonly #longHexPattern = new RegExp(iconPaintSchema.longHexPatternSource, "u");

  /**
   * @description Accepts optional common or icon-specific export options.
   * @param value - Candidate options value.
   * @param present - Whether the invocation owns an options field.
   * @param accessible - Whether label and title fields are accepted.
   * @returns Canonical frozen options, no value when absent, or structured rejection.
   */
  normalise(
    value: unknown,
    present: boolean,
    accessible: boolean,
  ): TAcceptanceResult<
    AsterExportOptionsType | AsterIconExportOptionsType | undefined
  > {
    if (!present) {
      return Object.freeze({ accepted: true, value: undefined });
    }

    if (!this.#isRecord(value)) {
      return this.#invalid("expected export options to be an object");
    }

    const acceptedFields = [
      "size",
      "colour",
      "fill",
      "stroke",
      "strokeWidth",
      "direction",
      ...(accessible ? ["label", "title"] : []),
    ];

    if (!Object.keys(value).every((field) => acceptedFields.includes(field))) {
      return this.#invalid("export options contain an unknown field");
    }

    if (
      !this.#optionalNumber(value, "size", (number) => number > 0) ||
      !this.#optionalNumber(value, "strokeWidth", (number) => number >= 0) ||
      !this.#optionalPaint(value, "colour", false) ||
      !this.#optionalPaint(value, "fill", true) ||
      !this.#optionalPaint(value, "stroke", true) ||
      !this.#optionalDirection(value) ||
      !this.#optionalText(value, "label") ||
      !this.#optionalText(value, "title")
    ) {
      return this.#invalid("export options contain an invalid value");
    }

    const options: AsterExportOptionsType | AsterIconExportOptionsType = {
      ...(Object.hasOwn(value, "size") ? { size: value.size as number } : {}),
      ...(Object.hasOwn(value, "colour")
        ? { colour: value.colour as IconPaintType }
        : {}),
      ...(Object.hasOwn(value, "fill")
        ? { fill: value.fill as IconPaintType }
        : {}),
      ...(Object.hasOwn(value, "stroke")
        ? { stroke: value.stroke as IconPaintType }
        : {}),
      ...(Object.hasOwn(value, "strokeWidth")
        ? { strokeWidth: value.strokeWidth as number }
        : {}),
      ...(Object.hasOwn(value, "direction")
        ? { direction: value.direction as IconDirectionType }
        : {}),
      ...(Object.hasOwn(value, "label")
        ? { label: (value.label as string).trim() }
        : {}),
      ...(Object.hasOwn(value, "title")
        ? { title: (value.title as string).trim() }
        : {}),
    };

    return Object.freeze({ accepted: true, value: Object.freeze(options) });
  }

  /**
   * @description Determines whether an optional finite number satisfies its field domain.
   * @param value - Candidate options record.
   * @param field - Numeric field to inspect.
   * @param accept - Field-specific numeric domain predicate.
   * @returns Whether the absent or present value is accepted.
   */
  #optionalNumber(
    value: Record<string, unknown>,
    field: string,
    accept: (number: number) => boolean,
  ): boolean {
    if (!Object.hasOwn(value, field)) {
      return true;
    }

    const number = value[field];
    return typeof number === "number" && Number.isFinite(number) && accept(number);
  }

  /**
   * @description Determines whether an optional value belongs to the portable paint grammar.
   * @param value - Candidate options record.
   * @param field - Paint field to inspect.
   * @param none - Whether the `none` paint keyword is accepted.
   * @returns Whether the absent or present paint is accepted.
   */
  #optionalPaint(
    value: Record<string, unknown>,
    field: string,
    none: boolean,
  ): boolean {
    if (!Object.hasOwn(value, field)) {
      return true;
    }

    const paint = value[field];
    return typeof paint === "string" && (
      paint === iconPaintSchema.keywords[1] ||
      (none && paint === iconPaintSchema.keywords[0]) ||
      this.#shortHexPattern.test(paint) ||
      this.#longHexPattern.test(paint)
    );
  }

  /**
   * @description Determines whether an optional direction is one canonical portable value.
   * @param value - Candidate options record.
   * @returns Whether the absent or present direction is accepted.
   */
  #optionalDirection(value: Record<string, unknown>): boolean {
    return !Object.hasOwn(value, "direction") || (
      typeof value.direction === "string" &&
      (iconDirections as readonly string[]).includes(value.direction)
    );
  }

  /**
   * @description Determines whether an optional text value is non-empty after trimming.
   * @param value - Candidate options record.
   * @param field - Text field to inspect.
   * @returns Whether the absent or present text is accepted.
   */
  #optionalText(value: Record<string, unknown>, field: string): boolean {
    return !Object.hasOwn(value, field) || (
      typeof value[field] === "string" && value[field].trim().length > 0
    );
  }

  /**
   * @description Creates one structured usage rejection for malformed export options.
   * @param message - Deterministic explanation of the violated option contract.
   * @returns Immutable rejected acceptance result.
   */
  #invalid<Value>(message: string): TAcceptanceResult<Value> {
    return Object.freeze({
      accepted: false,
      diagnostic: this.#diagnostics.create(
        commandDiagnosticSchema.categories.usage,
        commandDiagnosticSchema.codes.usage,
        message,
      ),
    });
  }

  /**
   * @description Determines whether a candidate is a non-null string-keyed record.
   * @param value - Candidate value.
   * @returns Whether own fields can be inspected.
   */
  #isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
}
