import type { ISvgSyntaxElement } from "../../parser/contracts/internal/svg-syntax-element.contract.js";
import { svgSourceAttributeNames } from "../../shared/constants/svg-source-attribute-names.constant.js";
import { SvgPathDataInspector } from "../../shared/runtime/svg-path-data.inspector.js";
import type { TSvgPrimitiveValidation } from "../types/internal/svg-primitive-validation.type.js";
import { svgValidationIssueKinds } from "../constants/svg-validation-issue-kinds.constant.js";
import { SvgValidationDiagnosticFactory } from "./svg-validation-diagnostic.factory.js";

/**
 * @description Validates authored path source without normalising or rewriting its geometry.
 */
export class SvgPathValidator {
  /**
   * @description Accepted path-data grammar authority.
   */
  readonly #inspector = new SvgPathDataInspector();

  /**
   * @description Stable validation diagnostic authority.
   */
  readonly #diagnosticFactory = new SvgValidationDiagnosticFactory();

  /**
   * @description Validates one supported path element.
   * @param sourceId - Canonical logical SVG source identifier.
   * @param element - Located path element.
   * @returns Blocking diagnostics and safely computed path advisory facts.
   */
  inspect(
    sourceId: string,
    element: ISvgSyntaxElement,
  ): TSvgPrimitiveValidation {
    const attribute = element.attributes.find(
      (candidate) =>
        candidate.localName === svgSourceAttributeNames.pathData,
    );

    if (attribute === undefined) {
      return this.#invalid(sourceId, element.nameSpan);
    }

    const inspection = this.#inspector.inspect(attribute.value);

    if (!inspection.valid || !inspection.hasDrawingOperation) {
      return this.#invalid(sourceId, attribute.valueSpan);
    }

    return Object.freeze({
      diagnostics: Object.freeze([]),
      pathCommandCount: inspection.commandCount,
      gridValues: Object.freeze(
        inspection.gridValues.map((value) =>
          Object.freeze({ value, span: attribute.valueSpan }),
        ),
      ),
      bounds: Object.freeze([]),
    });
  }

  /**
   * @description Creates one malformed path primitive result.
   * @param sourceId - Canonical logical SVG source identifier.
   * @param span - Exact malformed source evidence.
   * @returns Frozen blocking primitive result without advisory facts.
   */
  #invalid(
    sourceId: string,
    span: ISvgSyntaxElement["span"],
  ): TSvgPrimitiveValidation {
    return Object.freeze({
      diagnostics: Object.freeze([
        this.#diagnosticFactory.create({
          kind: svgValidationIssueKinds.invalidPathData,
          sourceId,
          span,
        }),
      ]),
      pathCommandCount: 0,
      gridValues: Object.freeze([]),
      bounds: Object.freeze([]),
    });
  }
}
