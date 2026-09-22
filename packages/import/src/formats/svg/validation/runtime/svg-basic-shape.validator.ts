import type { SourceDiagnostic } from "../../../../diagnostic/contracts/index.js";
import type { ISvgSyntaxElement } from "../../parser/contracts/internal/svg-syntax-element.contract.js";
import { svgNumericDomains } from "../../shared/constants/svg-numeric-domains.constant.js";
import { svgSourceAttributeNames } from "../../shared/constants/svg-source-attribute-names.constant.js";
import { svgSourceElementNames } from "../../shared/constants/svg-source-element-names.constant.js";
import { svgSourceElementSchema } from "../../shared/constants/svg-source-element-schema.constant.js";
import type { TSvgPrimitiveValidation } from "../types/internal/svg-primitive-validation.type.js";
import { svgValidationIssueKinds } from "../constants/svg-validation-issue-kinds.constant.js";
import { SvgGeometryNumberReader } from "./svg-geometry-number.reader.js";
import { SvgValidationDiagnosticFactory } from "./svg-validation-diagnostic.factory.js";

/**
 * @description Validates circle, ellipse, rectangle, and line source geometry.
 */
export class SvgBasicShapeValidator {
  /**
   * @description Shared geometry-number policy.
   */
  readonly #numberReader = new SvgGeometryNumberReader();

  /**
   * @description Stable validation diagnostic authority.
   */
  readonly #diagnosticFactory = new SvgValidationDiagnosticFactory();

  /**
   * @description Validates one supported basic-shape element.
   * @param sourceId - Canonical logical SVG source identifier.
   * @param element - Located circle, ellipse, rectangle, or line element.
   * @returns Blocking diagnostics for the supported shape.
   */
  inspect(
    sourceId: string,
    element: ISvgSyntaxElement,
  ): TSvgPrimitiveValidation {
    const diagnostics: SourceDiagnostic[] = [];

    switch (element.localName) {
      case svgSourceElementNames.circle:
        this.#circle(sourceId, element, diagnostics);
        break;
      case svgSourceElementNames.ellipse:
        this.#ellipse(sourceId, element, diagnostics);
        break;
      case svgSourceElementNames.rectangle:
        this.#rectangle(sourceId, element, diagnostics);
        break;
      case svgSourceElementNames.line:
        this.#line(sourceId, element, diagnostics);
        break;
    }

    return Object.freeze({
      diagnostics: Object.freeze(diagnostics),
      pathCommandCount: 0,
    });
  }

  /**
   * @description Validates circle values.
   * @param sourceId - Canonical logical SVG source identifier.
   * @param element - Located circle element.
   * @param diagnostics - Shared blocking diagnostic accumulator.
   * @returns Nothing.
   */
  #circle(
    sourceId: string,
    element: ISvgSyntaxElement,
    diagnostics: SourceDiagnostic[],
  ): void {
    this.#numberReader.read(
      sourceId,
      element,
      svgSourceAttributeNames.centreX,
      svgNumericDomains.finite,
      false,
      diagnostics,
    );
    this.#numberReader.read(
      sourceId,
      element,
      svgSourceAttributeNames.centreY,
      svgNumericDomains.finite,
      false,
      diagnostics,
    );
    this.#numberReader.read(
      sourceId,
      element,
      svgSourceAttributeNames.radius,
      svgNumericDomains.positive,
      true,
      diagnostics,
    );
  }

  /**
   * @description Validates ellipse values.
   * @param sourceId - Canonical logical SVG source identifier.
   * @param element - Located ellipse element.
   * @param diagnostics - Shared blocking diagnostic accumulator.
   * @returns Nothing.
   */
  #ellipse(
    sourceId: string,
    element: ISvgSyntaxElement,
    diagnostics: SourceDiagnostic[],
  ): void {
    this.#numberReader.read(
      sourceId,
      element,
      svgSourceAttributeNames.centreX,
      svgNumericDomains.finite,
      false,
      diagnostics,
    );
    this.#numberReader.read(
      sourceId,
      element,
      svgSourceAttributeNames.centreY,
      svgNumericDomains.finite,
      false,
      diagnostics,
    );
    this.#numberReader.read(
      sourceId,
      element,
      svgSourceAttributeNames.radiusX,
      svgNumericDomains.positive,
      true,
      diagnostics,
    );
    this.#numberReader.read(
      sourceId,
      element,
      svgSourceAttributeNames.radiusY,
      svgNumericDomains.positive,
      true,
      diagnostics,
    );
  }

  /**
   * @description Validates rectangle values.
   * @param sourceId - Canonical logical SVG source identifier.
   * @param element - Located rectangle element.
   * @param diagnostics - Shared blocking diagnostic accumulator.
   * @returns Nothing.
   */
  #rectangle(
    sourceId: string,
    element: ISvgSyntaxElement,
    diagnostics: SourceDiagnostic[],
  ): void {
    this.#numberReader.read(
      sourceId,
      element,
      svgSourceAttributeNames.x,
      svgNumericDomains.finite,
      false,
      diagnostics,
    );
    this.#numberReader.read(
      sourceId,
      element,
      svgSourceAttributeNames.y,
      svgNumericDomains.finite,
      false,
      diagnostics,
    );
    this.#numberReader.read(
      sourceId,
      element,
      svgSourceAttributeNames.width,
      svgNumericDomains.positive,
      true,
      diagnostics,
    );
    this.#numberReader.read(
      sourceId,
      element,
      svgSourceAttributeNames.height,
      svgNumericDomains.positive,
      true,
      diagnostics,
    );
    this.#numberReader.read(
      sourceId,
      element,
      svgSourceAttributeNames.radiusX,
      svgNumericDomains.nonNegative,
      false,
      diagnostics,
    );
    this.#numberReader.read(
      sourceId,
      element,
      svgSourceAttributeNames.radiusY,
      svgNumericDomains.nonNegative,
      false,
      diagnostics,
    );
  }

  /**
   * @description Validates line values and rejects degenerate geometry.
   * @param sourceId - Canonical logical SVG source identifier.
   * @param element - Located line element.
   * @param diagnostics - Shared blocking diagnostic accumulator.
   * @returns Nothing.
   */
  #line(
    sourceId: string,
    element: ISvgSyntaxElement,
    diagnostics: SourceDiagnostic[],
  ): void {
    const names =
      svgSourceElementSchema[svgSourceElementNames.line].attributes;
    const authored = names.map((name) =>
      this.#numberReader.read(
        sourceId,
        element,
        name,
        svgNumericDomains.finite,
        false,
        diagnostics,
      ),
    );
    const values = authored.map((entry, index) =>
      this.#resolved(element, names[index] ?? "", entry, 0),
    );
    const [x1, y1, x2, y2] = values;

    if (
      x1 === undefined ||
      y1 === undefined ||
      x2 === undefined ||
      y2 === undefined
    ) {
      return;
    }

    if (x1 === x2 && y1 === y2) {
      diagnostics.push(
        this.#diagnosticFactory.create({
          kind: svgValidationIssueKinds.invalidGeometry,
          sourceId,
          span: element.span,
        }),
      );
      return;
    }
  }

  /**
   * @description Resolves an authored value or its SVG default without masking malformed input.
   * @param element - Located geometry element.
   * @param name - Namespace-free attribute name.
   * @param value - Valid parsed authored value when available.
   * @param fallback - SVG default used only when the attribute is absent.
   * @returns Resolved value, or `undefined` when a present attribute was malformed.
   */
  #resolved(
    element: ISvgSyntaxElement,
    name: string,
    value: number | undefined,
    fallback: number,
  ): number | undefined {
    const present = element.attributes.some(
      (attribute) => attribute.localName === name,
    );
    return present ? value : fallback;
  }
}
