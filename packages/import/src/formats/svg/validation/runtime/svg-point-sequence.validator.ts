import type { ISvgSyntaxElement } from "../../parser/contracts/internal/svg-syntax-element.contract.js";
import { svgSourceAttributeNames } from "../../shared/constants/svg-source-attribute-names.constant.js";
import { svgSourceElementNames } from "../../shared/constants/svg-source-element-names.constant.js";
import { SvgNumberParser } from "../../shared/runtime/svg-number.parser.js";
import type { TSvgPrimitiveValidation } from "../types/internal/svg-primitive-validation.type.js";
import { svgValidationIssueKinds } from "../constants/svg-validation-issue-kinds.constant.js";
import { SvgValidationDiagnosticFactory } from "./svg-validation-diagnostic.factory.js";

/**
 * @description Validates authored polyline and polygon point sequences.
 */
export class SvgPointSequenceValidator {
  /**
   * @description Strict finite SVG number-sequence parser.
   */
  readonly #numberParser = new SvgNumberParser();

  /**
   * @description Stable validation diagnostic authority.
   */
  readonly #diagnosticFactory = new SvgValidationDiagnosticFactory();

  /**
   * @description Validates one supported point-sequence element.
   * @param sourceId - Canonical logical SVG source identifier.
   * @param element - Located polyline or polygon element.
   * @returns Blocking diagnostics for the point sequence.
   */
  inspect(
    sourceId: string,
    element: ISvgSyntaxElement,
  ): TSvgPrimitiveValidation {
    const attribute = element.attributes.find(
      (candidate) =>
        candidate.localName === svgSourceAttributeNames.points,
    );
    const values =
      attribute === undefined
        ? undefined
        : this.#numberParser.parseSequence(attribute.value);
    const minimumPoints =
      element.localName === svgSourceElementNames.polygon ? 3 : 2;

    if (
      attribute === undefined ||
      values === undefined ||
      values.length % 2 !== 0 ||
      values.length < minimumPoints * 2
    ) {
      return Object.freeze({
        diagnostics: Object.freeze([
          this.#diagnosticFactory.create({
            kind: svgValidationIssueKinds.invalidGeometry,
            sourceId,
            span: attribute?.valueSpan ?? element.nameSpan,
          }),
        ]),
        pathCommandCount: 0,
      });
    }

    return Object.freeze({
      diagnostics: Object.freeze([]),
      pathCommandCount: 0,
    });
  }
}
