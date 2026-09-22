import type { IconPresentation } from "../contracts/index.js";
import type { IconPaintType } from "../types/index.js";
import { IconDefinitionError } from "../../shared/runtime/icon-definition.error.js";
import { IconValueValidator } from "../../shared/runtime/icon-value.validator.js";
import { iconPaintSchema } from "../constants/icon-paint-schema.constant.js";
import { iconPresentationEnumerations } from "../constants/icon-presentation-enumerations.constant.js";
import { iconPresentationFields } from "../constants/icon-presentation-fields.constant.js";

/**
 * @description Validates and canonicalises explicit portable presentation.
 */
export class IconPresentationNormaliser {
  /**
   * @description Primitive authored-value validator.
   */
  readonly #validator = new IconValueValidator();

  /**
   * @description Accepted short hexadecimal paint grammar.
   */
  readonly #shortHexPattern = new RegExp(
    iconPaintSchema.shortHexPatternSource,
    "iu",
  );

  /**
   * @description Accepted long hexadecimal paint grammar.
   */
  readonly #longHexPattern = new RegExp(
    iconPaintSchema.longHexPatternSource,
    "iu",
  );

  /**
   * @description Produces one frozen presentation object in canonical field order.
   * @param value - Unknown authored presentation object.
   * @param path - Logical object path.
   * @returns Frozen canonical presentation.
   */
  normalise(value: unknown, path: string): IconPresentation {
    const record = this.#validator.record(value, path);
    this.#validator.exactFields(record, iconPresentationFields, path);

    const fill =
      "fill" in record ? this.#normalisePaint(record.fill, `${path}.fill`) : undefined;
    const fillRule =
      "fillRule" in record
        ? this.#normaliseEnumeration(
            record.fillRule,
            iconPresentationEnumerations.fillRule,
            `${path}.fillRule`,
          )
        : undefined;
    const stroke =
      "stroke" in record
        ? this.#normalisePaint(record.stroke, `${path}.stroke`)
        : undefined;
    const strokeWidth =
      "strokeWidth" in record
        ? this.#validator.nonNegativeNumber(record.strokeWidth, `${path}.strokeWidth`)
        : undefined;
    const strokeLineCap =
      "strokeLineCap" in record
        ? this.#normaliseEnumeration(
            record.strokeLineCap,
            iconPresentationEnumerations.strokeLineCap,
            `${path}.strokeLineCap`,
          )
        : undefined;
    const strokeLineJoin =
      "strokeLineJoin" in record
        ? this.#normaliseEnumeration(
            record.strokeLineJoin,
            iconPresentationEnumerations.strokeLineJoin,
            `${path}.strokeLineJoin`,
          )
        : undefined;
    const strokeMiterLimit =
      "strokeMiterLimit" in record
        ? this.#validator.positiveNumber(
            record.strokeMiterLimit,
            `${path}.strokeMiterLimit`,
          )
        : undefined;
    const opacity =
      "opacity" in record
        ? this.#validator.opacity(record.opacity, `${path}.opacity`)
        : undefined;
    const fillOpacity =
      "fillOpacity" in record
        ? this.#validator.opacity(record.fillOpacity, `${path}.fillOpacity`)
        : undefined;
    const strokeOpacity =
      "strokeOpacity" in record
        ? this.#validator.opacity(record.strokeOpacity, `${path}.strokeOpacity`)
        : undefined;

    return Object.freeze({
      ...(fill === undefined ? {} : { fill }),
      ...(fillRule === undefined ? {} : { fillRule }),
      ...(stroke === undefined ? {} : { stroke }),
      ...(strokeWidth === undefined ? {} : { strokeWidth }),
      ...(strokeLineCap === undefined ? {} : { strokeLineCap }),
      ...(strokeLineJoin === undefined ? {} : { strokeLineJoin }),
      ...(strokeMiterLimit === undefined ? {} : { strokeMiterLimit }),
      ...(opacity === undefined ? {} : { opacity }),
      ...(fillOpacity === undefined ? {} : { fillOpacity }),
      ...(strokeOpacity === undefined ? {} : { strokeOpacity }),
    });
  }

  /**
   * @description Canonicalises one closed portable paint.
   * @param value - Unknown authored paint.
   * @param path - Logical value path.
   * @returns Canonical portable paint.
   */
  #normalisePaint(value: unknown, path: string): IconPaintType {
    if (
      typeof value === "string" &&
      (iconPaintSchema.keywords as readonly string[]).includes(value)
    ) {
      return value as IconPaintType;
    }

    if (typeof value === "string" && this.#shortHexPattern.test(value)) {
      const [red, green, blue] = value.slice(1).toLowerCase();
      return `#${red}${red}${green}${green}${blue}${blue}`;
    }

    if (typeof value === "string" && this.#longHexPattern.test(value)) {
      return value.toLowerCase() as IconPaintType;
    }

    throw new IconDefinitionError(path, "expected a closed portable paint");
  }

  /**
   * @description Accepts one value from a closed string sequence.
   * @typeParam Value - Accepted string union.
   * @param value - Unknown authored value.
   * @param accepted - Closed accepted sequence.
   * @param path - Logical value path.
   * @returns Accepted union member.
   */
  #normaliseEnumeration<Value extends string>(
    value: unknown,
    accepted: readonly Value[],
    path: string,
  ): Value {
    if (typeof value !== "string" || !accepted.includes(value as Value)) {
      throw new IconDefinitionError(path, `expected one of ${accepted.join(", ")}`);
    }

    return value as Value;
  }
}
