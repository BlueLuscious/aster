import {
  iconDirections,
  iconPaintSchema,
  iconPresentationOverrideOrder,
  type IconDefinition,
  type IconDirectionType,
  type IconPaintType,
  type IconPresentation,
  type IconPresentationOverrideType,
  type IconRenderOptions,
} from "@aster/core";
import { SvgRenderError } from "../../error/index.js";
import { svgRenderOptionsSchema } from "../constants/svg-render-options-schema.constant.js";
import type { ISvgRenderContext } from "../contracts/internal/index.js";
import { SvgXmlCharacterValidator } from "./svg-xml-character.validator.js";

/**
 * @description Validates portable render options and resolves one immutable SVG render context.
 */
export class SvgRenderOptionsNormaliser {
  /**
   * @description Accepted short hexadecimal paint grammar.
   */
  readonly #shortHexPattern = new RegExp(iconPaintSchema.shortHexPatternSource, "iu");

  /**
   * @description Accepted long hexadecimal paint grammar.
   */
  readonly #longHexPattern = new RegExp(iconPaintSchema.longHexPatternSource, "iu");

  /**
   * @description XML 1.0 character authority shared by accepted option text and serialisation.
   */
  readonly #characterValidator = new SvgXmlCharacterValidator();

  /**
   * @description Validates options and resolves viewport, presentation, accessibility, and direction.
   * @param definition - Canonical portable definition.
   * @param value - Optional untrusted render options at the public runtime boundary.
   * @returns Frozen accepted render context.
   */
  normalise(
    definition: IconDefinition,
    value: IconRenderOptions | undefined,
  ): ISvgRenderContext {
    const options =
      value === undefined
        ? Object.freeze({})
        : this.#exactFields(this.#record(value, "options"));

    const size =
      "size" in options
        ? this.#number(options.size, "options.size", true)
        : undefined;
    const colour =
      "colour" in options
        ? this.#paint(options.colour, "options.colour", false)
        : undefined;
    const fill =
      "fill" in options
        ? this.#paint(options.fill, "options.fill", true)
        : undefined;
    const stroke =
      "stroke" in options
        ? this.#paint(options.stroke, "options.stroke", true)
        : undefined;
    const strokeWidth =
      "strokeWidth" in options
        ? this.#number(options.strokeWidth, "options.strokeWidth", false)
        : undefined;
    const label =
      "label" in options ? this.#text(options.label, "options.label") : undefined;
    const title =
      "title" in options ? this.#text(options.title, "options.title") : undefined;
    const decorative =
      "decorative" in options
        ? this.#boolean(options.decorative, "options.decorative")
        : label === undefined && title === undefined;
    const direction =
      "direction" in options
        ? this.#direction(options.direction, "options.direction")
        : iconDirections[0];
    const accessibleName = label ?? title;

    if (decorative && accessibleName !== undefined) {
      throw new SvgRenderError(
        "options.decorative",
        "cannot hide supplied accessibility content",
      );
    }

    if (!decorative && accessibleName === undefined) {
      throw new SvgRenderError(
        "options.decorative",
        "semantic output requires a label or title",
      );
    }

    const policy = definition.metadata.presentation;
    if (
      size !== undefined &&
      policy.minimumSize !== undefined &&
      size < policy.minimumSize
    ) {
      throw new SvgRenderError(
        "options.size",
        `cannot be smaller than icon minimum ${String(policy.minimumSize)}`,
      );
    }

    const overridesByCapability = {
      fill,
      stroke,
      strokeWidth,
    } satisfies Readonly<Record<IconPresentationOverrideType, unknown>>;

    for (const capability of iconPresentationOverrideOrder) {
      this.#authoriseOverride(
        capability,
        overridesByCapability[capability],
        policy.overrides,
      );
    }

    const presentationOverrides: IconPresentation = Object.freeze({
      ...(fill === undefined ? {} : { fill }),
      ...(stroke === undefined ? {} : { stroke }),
      ...(strokeWidth === undefined ? {} : { strokeWidth }),
    });
    const width = size ?? policy.defaultSize ?? definition.viewBox.width;
    const height = size ?? policy.defaultSize ?? definition.viewBox.height;

    return Object.freeze({
      definition,
      width,
      height,
      ...(colour === undefined ? {} : { colour }),
      presentationOverrides,
      decorative,
      ...(accessibleName === undefined ? {} : { accessibleName }),
      ...(title === undefined ? {} : { title }),
      direction,
    });
  }

  /**
   * @description Accepts one plain closed options object.
   * @param value - Unknown candidate value.
   * @param path - Logical value path.
   * @returns Candidate record.
   */
  #record(value: unknown, path: string): Record<string, unknown> {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new SvgRenderError(path, "expected a plain object");
    }

    const prototype = Object.getPrototypeOf(value) as unknown;
    if (prototype !== Object.prototype && prototype !== null) {
      throw new SvgRenderError(path, "expected a plain object");
    }

    return value as Record<string, unknown>;
  }

  /**
   * @description Captures own enumerable data fields from the exact portable option schema.
   * @param value - Candidate option record.
   * @returns Frozen isolated option values safe for subsequent normalisation.
   */
  #exactFields(
    value: Record<string, unknown>,
  ): Readonly<Record<string, unknown>> {
    const accepted: Record<string, unknown> = {};

    for (const field of Reflect.ownKeys(value)) {
      if (typeof field !== "string") {
        throw new SvgRenderError("options", "expected string fields");
      }

      if (!(svgRenderOptionsSchema.fields as readonly string[]).includes(field)) {
        throw new SvgRenderError(`options.${field}`, "unexpected field");
      }

      const descriptor = Object.getOwnPropertyDescriptor(value, field);
      if (
        descriptor === undefined ||
        !descriptor.enumerable ||
        !("value" in descriptor)
      ) {
        throw new SvgRenderError(
          `options.${field}`,
          "expected an enumerable data field",
        );
      }

      accepted[field] = descriptor.value;
    }

    return Object.freeze(accepted);
  }

  /**
   * @description Accepts one finite positive or non-negative numeric option.
   * @param value - Unknown numeric candidate.
   * @param path - Logical value path.
   * @param positive - Whether zero must be rejected.
   * @returns Canonical finite number.
   */
  #number(
    value: unknown,
    path: string,
    positive: boolean,
  ): number {
    if (
      typeof value !== "number" ||
      !Number.isFinite(value) ||
      (positive ? value <= 0 : value < 0)
    ) {
      throw new SvgRenderError(
        path,
        positive
          ? "expected a positive finite number"
          : "expected a non-negative finite number",
      );
    }

    return Object.is(value, -0) ? 0 : value;
  }

  /**
   * @description Accepts and canonicalises one portable paint option.
   * @param value - Unknown paint candidate.
   * @param path - Logical value path.
   * @param allowNone - Whether the no-paint keyword is valid at this position.
   * @returns Canonical portable paint.
   */
  #paint(
    value: unknown,
    path: string,
    allowNone: boolean,
  ): IconPaintType {
    if (value === iconPaintSchema.keywords[0]) {
      if (allowNone) {
        return value;
      }

      throw new SvgRenderError(path, "cannot use none as a colour context");
    }

    if (value === iconPaintSchema.keywords[1]) {
      return value;
    }

    if (typeof value === "string" && this.#shortHexPattern.test(value)) {
      const red = value[1];
      const green = value[2];
      const blue = value[3];

      if (red !== undefined && green !== undefined && blue !== undefined) {
        return `#${red}${red}${green}${green}${blue}${blue}`.toLowerCase() as IconPaintType;
      }
    }

    if (typeof value === "string" && this.#longHexPattern.test(value)) {
      return value.toLowerCase() as IconPaintType;
    }

    throw new SvgRenderError(path, "expected a closed portable paint");
  }

  /**
   * @description Accepts trimmed non-empty compact option text.
   * @param value - Unknown text candidate.
   * @param path - Logical value path.
   * @returns Canonical option text.
   */
  #text(value: unknown, path: string): string {
    if (typeof value !== "string") {
      throw new SvgRenderError(path, "expected non-empty text");
    }

    const text = value.trim();
    if (text.length === 0) {
      throw new SvgRenderError(path, "expected non-empty text");
    }

    this.#characterValidator.validate(text, path);

    return text;
  }

  /**
   * @description Accepts one boolean option.
   * @param value - Unknown boolean candidate.
   * @param path - Logical value path.
   * @returns Accepted boolean.
   */
  #boolean(value: unknown, path: string): boolean {
    if (typeof value !== "boolean") {
      throw new SvgRenderError(path, "expected a boolean");
    }

    return value;
  }

  /**
   * @description Accepts one explicit portable direction.
   * @param value - Unknown direction candidate.
   * @param path - Logical value path.
   * @returns Accepted direction.
   */
  #direction(value: unknown, path: string): IconDirectionType {
    if (
      typeof value !== "string" ||
      !(iconDirections as readonly string[]).includes(value)
    ) {
      throw new SvgRenderError(
        path,
        `expected one of ${iconDirections.join(", ")}`,
      );
    }

    return value as IconDirectionType;
  }

  /**
   * @description Ensures a supplied presentation override is allowed by the icon policy.
   * @param capability - Closed presentation capability.
   * @param value - Optional supplied override value.
   * @param allowed - Canonical capabilities authorised by the icon policy.
   * @returns Nothing.
   */
  #authoriseOverride(
    capability: IconPresentationOverrideType,
    value: unknown,
    allowed: readonly IconPresentationOverrideType[],
  ): void {
    if (value !== undefined && !allowed.includes(capability)) {
      throw new SvgRenderError(
        `options.${capability}`,
        "icon policy does not permit this override",
      );
    }
  }
}
