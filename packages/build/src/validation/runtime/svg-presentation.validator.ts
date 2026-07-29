import type { ISvgSyntaxElement } from "../../parser/contracts/internal/svg-syntax-element.contract.js";
import { svgPaintSchema } from "../../shared/constants/svg-paint-schema.constant.js";
import { svgPresentationAttributeSchema } from "../../shared/constants/svg-presentation-attribute-schema.constant.js";
import { svgSourceElementSchema } from "../../shared/constants/svg-source-element-schema.constant.js";
import type { TSvgPresentationValidation } from "../types/internal/svg-presentation-validation.type.js";
import { SvgNumberParser } from "./svg-number.parser.js";
import { SvgValidationDiagnosticFactory } from "./svg-validation-diagnostic.factory.js";

/**
 * @description Validates the closed portable subset of authored SVG presentation attributes.
 */
export class SvgPresentationValidator {
  /**
   * @description Stable validation diagnostic authority.
   */
  readonly #diagnosticFactory = new SvgValidationDiagnosticFactory();

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
   * @description Determines whether one attribute belongs to portable presentation.
   * @param localName - Namespace-free attribute name.
   * @returns Whether the presentation validator owns the attribute.
   */
  supportsAttribute(localName: string): boolean {
    return Object.hasOwn(svgPresentationAttributeSchema, localName);
  }

  /**
   * @description Validates every supported presentation attribute on one element.
   * @param sourceId - Canonical logical SVG source identifier.
   * @param element - Located safe SVG syntax element.
   * @returns Presentation diagnostics and explicit valid stroke widths.
   */
  inspect(
    sourceId: string,
    element: ISvgSyntaxElement,
  ): TSvgPresentationValidation {
    const diagnostics = [];
    const strokeWidths = [];

    for (const attribute of element.attributes) {
      const schema = this.#schema(attribute.localName);

      if (schema === undefined) {
        continue;
      }

      const numeric = this.#numberParser.parse(attribute.value);
      let valid: boolean;

      switch (schema.valueKind) {
        case "paint":
          valid = this.#validPaint(attribute.value);
          break;
        case "enumeration":
          valid = (schema.acceptedValues as readonly string[]).includes(
            attribute.value,
          );
          break;
        case "number":
          valid =
            numeric !== undefined &&
            this.#validNumber(numeric, schema.numericDomain);
          break;
      }

      if (
        valid &&
        !schema.inherited &&
        this.#elementSchema(element.localName)?.role !== "primitive"
      ) {
        valid = false;
      }

      if (
        valid &&
        schema.collectStrokeWidth &&
        numeric !== undefined
      ) {
        strokeWidths.push({
          value: numeric,
          span: attribute.valueSpan,
        });
      }

      if (!valid) {
        diagnostics.push(
          this.#diagnosticFactory.create({
            kind: "invalid-presentation",
            sourceId,
            span: attribute.valueSpan,
          }),
        );
      }
    }

    return Object.freeze({
      diagnostics: Object.freeze(diagnostics),
      strokeWidths: Object.freeze(
        strokeWidths.map((entry) => Object.freeze(entry)),
      ),
    });
  }

  /**
   * @description Resolves one accepted source-element schema entry.
   * @param localName - Namespace-free SVG element name.
   * @returns Matching immutable schema entry, or `undefined` when unsupported.
   */
  #elementSchema(
    localName: string,
  ):
    | (typeof svgSourceElementSchema)[keyof typeof svgSourceElementSchema]
    | undefined {
    if (!Object.hasOwn(svgSourceElementSchema, localName)) {
      return undefined;
    }

    return svgSourceElementSchema[
      localName as keyof typeof svgSourceElementSchema
    ];
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
   * @description Validates one parsed number against its schema-owned numeric domain.
   * @param value - Parsed finite SVG number.
   * @param domain - Closed numeric domain declared by the presentation schema.
   * @returns Whether the number belongs to the declared domain.
   */
  #validNumber(
    value: number,
    domain: "non-negative" | "opacity" | "positive",
  ): boolean {
    switch (domain) {
      case "non-negative":
        return value >= 0;
      case "opacity":
        return value >= 0 && value <= 1;
      case "positive":
        return value > 0;
    }
  }

  /**
   * @description Determines whether one authored paint belongs to the closed portable colour set.
   * @param value - Exact authored paint value.
   * @returns Whether the paint is accepted.
   */
  #validPaint(value: string): boolean {
    return (
      (svgPaintSchema.keywords as readonly string[]).includes(value) ||
      this.#shortHexPattern.test(value) ||
      this.#longHexPattern.test(value)
    );
  }
}
