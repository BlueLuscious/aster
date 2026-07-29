import type { ISvgSyntaxElement } from "../../parser/contracts/internal/svg-syntax-element.contract.js";
import { svgSourceAttributeNames } from "../../shared/constants/svg-source-attribute-names.constant.js";
import { svgSourceElementNames } from "../../shared/constants/svg-source-element-names.constant.js";
import type { TSvgPrimitiveValidation } from "../types/internal/svg-primitive-validation.type.js";
import { svgValidationIssueKinds } from "../constants/svg-validation-issue-kinds.constant.js";
import { SvgNumberParser } from "./svg-number.parser.js";
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
   * @description Validates one supported point-sequence element and computes exact bounds.
   * @param sourceId - Canonical logical SVG source identifier.
   * @param element - Located polyline or polygon element.
   * @returns Blocking diagnostics and safely computed advisory facts.
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
        gridValues: Object.freeze([]),
        bounds: Object.freeze([]),
      });
    }

    const horizontal = values.filter((_, index) => index % 2 === 0);
    const vertical = values.filter((_, index) => index % 2 === 1);

    return Object.freeze({
      diagnostics: Object.freeze([]),
      pathCommandCount: 0,
      gridValues: Object.freeze(
        values.map((value) =>
          Object.freeze({ value, span: attribute.valueSpan }),
        ),
      ),
      bounds: Object.freeze([
        Object.freeze({
          minX: Math.min(...horizontal),
          minY: Math.min(...vertical),
          maxX: Math.max(...horizontal),
          maxY: Math.max(...vertical),
          span: element.span,
        }),
      ]),
    });
  }
}
