import type { ISvgSyntaxElement } from "../../parser/contracts/internal/svg-syntax-element.contract.js";
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
   * @description Closed accepted SVG presentation attribute names.
   */
  readonly #attributes = new Set([
    "fill",
    "fill-rule",
    "stroke",
    "stroke-width",
    "stroke-linecap",
    "stroke-linejoin",
    "stroke-miterlimit",
    "opacity",
    "fill-opacity",
    "stroke-opacity",
  ]);

  /**
   * @description Determines whether one attribute belongs to portable presentation.
   * @param localName - Namespace-free attribute name.
   * @returns Whether the presentation validator owns the attribute.
   */
  supportsAttribute(localName: string): boolean {
    return this.#attributes.has(localName);
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
      if (!this.supportsAttribute(attribute.localName)) {
        continue;
      }

      const numeric = this.#numberParser.parse(attribute.value);
      let valid = true;

      switch (attribute.localName) {
        case "fill":
        case "stroke":
          valid = this.#validPaint(attribute.value);
          break;
        case "fill-rule":
          valid = ["nonzero", "evenodd"].includes(attribute.value);
          break;
        case "stroke-linecap":
          valid = ["butt", "round", "square"].includes(attribute.value);
          break;
        case "stroke-linejoin":
          valid = ["miter", "round", "bevel"].includes(attribute.value);
          break;
        case "stroke-width":
          valid = numeric !== undefined && numeric >= 0;

          if (valid && numeric !== undefined) {
            strokeWidths.push({
              value: numeric,
              span: attribute.valueSpan,
            });
          }
          break;
        case "stroke-miterlimit":
          valid = numeric !== undefined && numeric > 0;
          break;
        case "opacity":
        case "fill-opacity":
        case "stroke-opacity":
          valid = numeric !== undefined && numeric >= 0 && numeric <= 1;
          break;
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
   * @description Determines whether one authored paint belongs to the closed portable colour set.
   * @param value - Exact authored paint value.
   * @returns Whether the paint is accepted.
   */
  #validPaint(value: string): boolean {
    return (
      value === "none" ||
      value === "currentColor" ||
      /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/iu.test(value)
    );
  }
}
