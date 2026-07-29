import type { IconPaintType, IconPresentation } from "@aster/core";
import type { ISvgSyntaxElement } from "../../parser/contracts/internal/svg-syntax-element.contract.js";
import { svgPaintSchema } from "../../shared/constants/svg-paint-schema.constant.js";
import { svgPresentationAttributeSchema } from "../../shared/constants/svg-presentation-attribute-schema.constant.js";
import { svgPresentationValueKinds } from "../../shared/constants/svg-presentation-value-kinds.constant.js";
import { BuildContractError } from "../../shared/runtime/build-contract.error.js";
import { SvgNumberParser } from "../../validation/runtime/svg-number.parser.js";

/**
 * @description Resolves accepted inherited SVG presentation into portable node fields.
 */
export class SvgPresentationNormaliser {
  /**
   * @description Strict finite SVG number parser.
   */
  readonly #numberParser = new SvgNumberParser();

  /**
   * @description Accepted short hexadecimal paint grammar.
   */
  readonly #shortHexPattern = new RegExp(
    svgPaintSchema.shortHexPatternSource,
    "iu",
  );

  /**
   * @description Accepted long hexadecimal paint grammar.
   */
  readonly #longHexPattern = new RegExp(
    svgPaintSchema.longHexPatternSource,
    "iu",
  );

  /**
   * @description Resolves one element's accepted presentation over its inherited values.
   * @param element - Safe validated syntax element.
   * @param inherited - Presentation inherited from structural ancestors.
   * @returns Frozen canonical portable presentation.
   */
  normalise(
    element: ISvgSyntaxElement,
    inherited: IconPresentation,
  ): IconPresentation {
    const presentation: Record<string, unknown> = { ...inherited };

    for (const attribute of element.attributes) {
      const schema = this.#schema(attribute.localName);

      if (schema === undefined) {
        continue;
      }

      switch (schema.valueKind) {
        case svgPresentationValueKinds.paint:
          presentation[schema.field] = this.#paint(attribute.value);
          break;
        case svgPresentationValueKinds.enumeration:
          presentation[schema.field] = attribute.value;
          break;
        case svgPresentationValueKinds.number:
          presentation[schema.field] = this.#number(attribute.value);
          break;
      }
    }

    return Object.freeze(presentation) as IconPresentation;
  }

  /**
   * @description Resolves one accepted presentation schema entry without widening its field types.
   * @param localName - Namespace-free SVG attribute name.
   * @returns Matching immutable schema entry, or `undefined` when unsupported.
   */
  #schema(
    localName: string,
  ):
    | (typeof svgPresentationAttributeSchema)[keyof typeof svgPresentationAttributeSchema]
    | undefined {
    if (!Object.hasOwn(svgPresentationAttributeSchema, localName)) {
      return undefined;
    }

    return svgPresentationAttributeSchema[
      localName as keyof typeof svgPresentationAttributeSchema
    ];
  }

  /**
   * @description Canonicalises one accepted portable paint.
   * @param value - Validated authored paint.
   * @returns Canonical portable paint.
   */
  #paint(value: string): IconPaintType {
    if ((svgPaintSchema.keywords as readonly string[]).includes(value)) {
      return value as IconPaintType;
    }

    if (this.#shortHexPattern.test(value)) {
      const [red, green, blue] = value.slice(1).toLowerCase();
      return `#${red}${red}${green}${green}${blue}${blue}`;
    }

    if (this.#longHexPattern.test(value)) {
      return value.toLowerCase() as IconPaintType;
    }

    throw new BuildContractError(
      "validatedPresentation",
      "paint is not valid normalisation input",
    );
  }

  /**
   * @description Recovers one finite number already guaranteed by technical validation.
   * @param value - Validated authored numeric value.
   * @returns Canonical finite number.
   */
  #number(value: string): number {
    const parsed = this.#numberParser.parse(value);

    if (parsed === undefined) {
      throw new BuildContractError(
        "validatedPresentation",
        "numeric presentation is not valid normalisation input",
      );
    }

    return parsed;
  }
}
