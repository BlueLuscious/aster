import type { SourceDiagnostic } from "../../../../diagnostic/contracts/index.js";
import type { ISvgSyntaxElement } from "../../parser/contracts/internal/svg-syntax-element.contract.js";
import { svgNumericDomains } from "../../shared/constants/svg-numeric-domains.constant.js";
import { svgSourceAttributeNames } from "../../shared/constants/svg-source-attribute-names.constant.js";
import { svgSourceElementNames } from "../../shared/constants/svg-source-element-names.constant.js";
import { svgSourceElementSchema } from "../../shared/constants/svg-source-element-schema.constant.js";
import type { TLocatedBounds } from "../types/internal/located-bounds.type.js";
import type { TLocatedNumber } from "../types/internal/located-number.type.js";
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
   * @returns Blocking diagnostics and safely computed advisory facts.
   */
  inspect(
    sourceId: string,
    element: ISvgSyntaxElement,
  ): TSvgPrimitiveValidation {
    const diagnostics: SourceDiagnostic[] = [];
    const gridValues: TLocatedNumber[] = [];
    const bounds: TLocatedBounds[] = [];

    switch (element.localName) {
      case svgSourceElementNames.circle:
        this.#circle(
          sourceId,
          element,
          diagnostics,
          gridValues,
          bounds,
        );
        break;
      case svgSourceElementNames.ellipse:
        this.#ellipse(
          sourceId,
          element,
          diagnostics,
          gridValues,
          bounds,
        );
        break;
      case svgSourceElementNames.rectangle:
        this.#rectangle(
          sourceId,
          element,
          diagnostics,
          gridValues,
          bounds,
        );
        break;
      case svgSourceElementNames.line:
        this.#line(
          sourceId,
          element,
          diagnostics,
          gridValues,
          bounds,
        );
        break;
    }

    return Object.freeze({
      diagnostics: Object.freeze(diagnostics),
      pathCommandCount: 0,
      gridValues: Object.freeze(
        gridValues.map((entry) => Object.freeze(entry)),
      ),
      bounds: Object.freeze(bounds.map((entry) => Object.freeze(entry))),
    });
  }

  /**
   * @description Validates circle values and computes exact bounds.
   * @param sourceId - Canonical logical SVG source identifier.
   * @param element - Located circle element.
   * @param diagnostics - Shared blocking diagnostic accumulator.
   * @param gridValues - Shared valid authored-value accumulator.
   * @param bounds - Shared exact-bounds accumulator.
   * @returns Nothing.
   */
  #circle(
    sourceId: string,
    element: ISvgSyntaxElement,
    diagnostics: SourceDiagnostic[],
    gridValues: TLocatedNumber[],
    bounds: TLocatedBounds[],
  ): void {
    const cx = this.#numberReader.read(
      sourceId,
      element,
      svgSourceAttributeNames.centreX,
      svgNumericDomains.finite,
      false,
      diagnostics,
      gridValues,
    );
    const cy = this.#numberReader.read(
      sourceId,
      element,
      svgSourceAttributeNames.centreY,
      svgNumericDomains.finite,
      false,
      diagnostics,
      gridValues,
    );
    const radius = this.#numberReader.read(
      sourceId,
      element,
      svgSourceAttributeNames.radius,
      svgNumericDomains.positive,
      true,
      diagnostics,
      gridValues,
    );
    const centreX = this.#resolved(
      element,
      svgSourceAttributeNames.centreX,
      cx,
      0,
    );
    const centreY = this.#resolved(
      element,
      svgSourceAttributeNames.centreY,
      cy,
      0,
    );

    if (
      radius !== undefined &&
      centreX !== undefined &&
      centreY !== undefined
    ) {
      bounds.push({
        minX: centreX - radius.value,
        minY: centreY - radius.value,
        maxX: centreX + radius.value,
        maxY: centreY + radius.value,
        span: element.span,
      });
    }
  }

  /**
   * @description Validates ellipse values and computes exact bounds.
   * @param sourceId - Canonical logical SVG source identifier.
   * @param element - Located ellipse element.
   * @param diagnostics - Shared blocking diagnostic accumulator.
   * @param gridValues - Shared valid authored-value accumulator.
   * @param bounds - Shared exact-bounds accumulator.
   * @returns Nothing.
   */
  #ellipse(
    sourceId: string,
    element: ISvgSyntaxElement,
    diagnostics: SourceDiagnostic[],
    gridValues: TLocatedNumber[],
    bounds: TLocatedBounds[],
  ): void {
    const cx = this.#numberReader.read(
      sourceId,
      element,
      svgSourceAttributeNames.centreX,
      svgNumericDomains.finite,
      false,
      diagnostics,
      gridValues,
    );
    const cy = this.#numberReader.read(
      sourceId,
      element,
      svgSourceAttributeNames.centreY,
      svgNumericDomains.finite,
      false,
      diagnostics,
      gridValues,
    );
    const radiusX = this.#numberReader.read(
      sourceId,
      element,
      svgSourceAttributeNames.radiusX,
      svgNumericDomains.positive,
      true,
      diagnostics,
      gridValues,
    );
    const radiusY = this.#numberReader.read(
      sourceId,
      element,
      svgSourceAttributeNames.radiusY,
      svgNumericDomains.positive,
      true,
      diagnostics,
      gridValues,
    );
    const centreX = this.#resolved(
      element,
      svgSourceAttributeNames.centreX,
      cx,
      0,
    );
    const centreY = this.#resolved(
      element,
      svgSourceAttributeNames.centreY,
      cy,
      0,
    );

    if (
      radiusX !== undefined &&
      radiusY !== undefined &&
      centreX !== undefined &&
      centreY !== undefined
    ) {
      bounds.push({
        minX: centreX - radiusX.value,
        minY: centreY - radiusY.value,
        maxX: centreX + radiusX.value,
        maxY: centreY + radiusY.value,
        span: element.span,
      });
    }
  }

  /**
   * @description Validates rectangle values and computes exact bounds.
   * @param sourceId - Canonical logical SVG source identifier.
   * @param element - Located rectangle element.
   * @param diagnostics - Shared blocking diagnostic accumulator.
   * @param gridValues - Shared valid authored-value accumulator.
   * @param bounds - Shared exact-bounds accumulator.
   * @returns Nothing.
   */
  #rectangle(
    sourceId: string,
    element: ISvgSyntaxElement,
    diagnostics: SourceDiagnostic[],
    gridValues: TLocatedNumber[],
    bounds: TLocatedBounds[],
  ): void {
    const x = this.#numberReader.read(
      sourceId,
      element,
      svgSourceAttributeNames.x,
      svgNumericDomains.finite,
      false,
      diagnostics,
      gridValues,
    );
    const y = this.#numberReader.read(
      sourceId,
      element,
      svgSourceAttributeNames.y,
      svgNumericDomains.finite,
      false,
      diagnostics,
      gridValues,
    );
    const width = this.#numberReader.read(
      sourceId,
      element,
      svgSourceAttributeNames.width,
      svgNumericDomains.positive,
      true,
      diagnostics,
      gridValues,
    );
    const height = this.#numberReader.read(
      sourceId,
      element,
      svgSourceAttributeNames.height,
      svgNumericDomains.positive,
      true,
      diagnostics,
      gridValues,
    );
    this.#numberReader.read(
      sourceId,
      element,
      svgSourceAttributeNames.radiusX,
      svgNumericDomains.nonNegative,
      false,
      diagnostics,
      gridValues,
    );
    this.#numberReader.read(
      sourceId,
      element,
      svgSourceAttributeNames.radiusY,
      svgNumericDomains.nonNegative,
      false,
      diagnostics,
      gridValues,
    );
    const minimumX = this.#resolved(
      element,
      svgSourceAttributeNames.x,
      x,
      0,
    );
    const minimumY = this.#resolved(
      element,
      svgSourceAttributeNames.y,
      y,
      0,
    );

    if (
      width !== undefined &&
      height !== undefined &&
      minimumX !== undefined &&
      minimumY !== undefined
    ) {
      bounds.push({
        minX: minimumX,
        minY: minimumY,
        maxX: minimumX + width.value,
        maxY: minimumY + height.value,
        span: element.span,
      });
    }
  }

  /**
   * @description Validates line values and computes exact bounds.
   * @param sourceId - Canonical logical SVG source identifier.
   * @param element - Located line element.
   * @param diagnostics - Shared blocking diagnostic accumulator.
   * @param gridValues - Shared valid authored-value accumulator.
   * @param bounds - Shared exact-bounds accumulator.
   * @returns Nothing.
   */
  #line(
    sourceId: string,
    element: ISvgSyntaxElement,
    diagnostics: SourceDiagnostic[],
    gridValues: TLocatedNumber[],
    bounds: TLocatedBounds[],
  ): void {
    const names =
      svgSourceElementSchema[svgSourceElementNames.line].attributes;
    const located = names.map((name) =>
      this.#numberReader.read(
        sourceId,
        element,
        name,
        svgNumericDomains.finite,
        false,
        diagnostics,
        gridValues,
      ),
    );
    const values = located.map((entry, index) =>
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

    bounds.push({
      minX: Math.min(x1, x2),
      minY: Math.min(y1, y2),
      maxX: Math.max(x1, x2),
      maxY: Math.max(y1, y2),
      span: element.span,
    });
  }

  /**
   * @description Resolves an authored value or its SVG default without masking malformed input.
   * @param element - Located geometry element.
   * @param name - Namespace-free attribute name.
   * @param located - Valid parsed authored value when available.
   * @param fallback - SVG default used only when the attribute is absent.
   * @returns Resolved value, or `undefined` when a present attribute was malformed.
   */
  #resolved(
    element: ISvgSyntaxElement,
    name: string,
    located: TLocatedNumber | undefined,
    fallback: number,
  ): number | undefined {
    const present = element.attributes.some(
      (attribute) => attribute.localName === name,
    );
    return present ? located?.value : fallback;
  }
}
