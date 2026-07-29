import type { SourceDiagnostic } from "../../diagnostic/contracts/index.js";
import type { ISvgSyntaxElement } from "../../parser/contracts/internal/svg-syntax-element.contract.js";
import type { TLocatedBounds } from "../types/internal/located-bounds.type.js";
import type { TLocatedNumber } from "../types/internal/located-number.type.js";
import type { TSvgGeometryValidation } from "../types/internal/svg-geometry-validation.type.js";
import type { TSvgPrimitiveValidation } from "../types/internal/svg-primitive-validation.type.js";
import { SvgBasicShapeValidator } from "./svg-basic-shape.validator.js";
import { SvgPathValidator } from "./svg-path.validator.js";
import { SvgPointSequenceValidator } from "./svg-point-sequence.validator.js";
import { SvgPresentationValidator } from "./svg-presentation.validator.js";
import { SvgValidationDiagnosticFactory } from "./svg-validation-diagnostic.factory.js";

/**
 * @description Composes supported primitive and presentation validators over one SVG hierarchy.
 */
export class SvgGeometryValidator {
  /**
   * @description Stable validation diagnostic authority.
   */
  readonly #diagnosticFactory = new SvgValidationDiagnosticFactory();

  /**
   * @description Closed portable presentation authority.
   */
  readonly #presentationValidator = new SvgPresentationValidator();

  /**
   * @description Circle, ellipse, rectangle, and line validity authority.
   */
  readonly #basicShapeValidator = new SvgBasicShapeValidator();

  /**
   * @description Path source validity authority.
   */
  readonly #pathValidator = new SvgPathValidator();

  /**
   * @description Polyline and polygon source validity authority.
   */
  readonly #pointSequenceValidator = new SvgPointSequenceValidator();

  /**
   * @description Geometry attributes accepted for each supported primitive.
   */
  readonly #geometryAttributes = new Map<string, readonly string[]>([
    ["path", ["d"]],
    ["circle", ["cx", "cy", "r"]],
    ["ellipse", ["cx", "cy", "rx", "ry"]],
    ["rect", ["x", "y", "width", "height", "rx", "ry"]],
    ["line", ["x1", "y1", "x2", "y2"]],
    ["polyline", ["points"]],
    ["polygon", ["points"]],
  ]);

  /**
   * @description Validates one complete safe parser document hierarchy.
   * @param sourceId - Canonical logical SVG source identifier.
   * @param root - Sole safe SVG syntax root.
   * @returns Blocking diagnostics and safely computed collection metrics.
   */
  inspect(
    sourceId: string,
    root: ISvgSyntaxElement,
  ): TSvgGeometryValidation {
    const diagnostics: SourceDiagnostic[] = [];
    const gridValues: TLocatedNumber[] = [];
    const strokeWidths: TLocatedNumber[] = [];
    const bounds: TLocatedBounds[] = [];
    let primitiveCount = 0;
    let pathCommandCount = 0;

    /**
     * @description Visits one safe syntax element and its children in exact source order.
     * @param element - Current located safe syntax element.
     * @returns Nothing.
     */
    const visit = (element: ISvgSyntaxElement): void => {
      const presentation = this.#presentationValidator.inspect(
        sourceId,
        element,
      );
      diagnostics.push(...presentation.diagnostics);
      strokeWidths.push(...presentation.strokeWidths);
      diagnostics.push(...this.#unsupportedAttributes(sourceId, element));

      if (element.localName !== "svg" && element.localName !== "g") {
        primitiveCount += 1;
        const primitive = this.#inspectPrimitive(sourceId, element);
        diagnostics.push(...primitive.diagnostics);
        gridValues.push(...primitive.gridValues);
        bounds.push(...primitive.bounds);
        pathCommandCount += primitive.pathCommandCount;
      }

      for (const child of element.children) {
        visit(child);
      }
    };

    visit(root);

    if (primitiveCount === 0) {
      diagnostics.push(
        this.#diagnosticFactory.create({
          kind: "empty-geometry",
          sourceId,
          span: root.span,
        }),
      );
    }

    return Object.freeze({
      diagnostics: Object.freeze(diagnostics),
      primitiveCount,
      pathCommandCount,
      gridValues: Object.freeze(gridValues),
      strokeWidths: Object.freeze(strokeWidths),
      bounds: Object.freeze(bounds),
    });
  }

  /**
   * @description Reports attributes outside the accepted root, group, geometry, and presentation sets.
   * @param sourceId - Canonical logical SVG source identifier.
   * @param element - Located safe syntax element.
   * @returns Blocking unsupported-attribute diagnostics.
   */
  #unsupportedAttributes(
    sourceId: string,
    element: ISvgSyntaxElement,
  ): readonly SourceDiagnostic[] {
    const geometry = this.#geometryAttributes.get(element.localName) ?? [];
    const accepted = new Set(geometry);

    if (element.localName === "svg") {
      accepted.add("viewBox");
      accepted.add("xmlns");
    }

    return element.attributes
      .filter(
        (attribute) =>
          !accepted.has(attribute.localName) &&
          !this.#presentationValidator.supportsAttribute(
            attribute.localName,
          ),
      )
      .map((attribute) =>
        this.#diagnosticFactory.create({
          kind: "unsupported-attribute",
          sourceId,
          span: attribute.nameSpan,
        }),
      );
  }

  /**
   * @description Delegates one supported primitive to its concrete geometry-family validator.
   * @param sourceId - Canonical logical SVG source identifier.
   * @param element - Located supported primitive.
   * @returns Blocking diagnostics and safely computed primitive facts.
   */
  #inspectPrimitive(
    sourceId: string,
    element: ISvgSyntaxElement,
  ): TSvgPrimitiveValidation {
    switch (element.localName) {
      case "path":
        return this.#pathValidator.inspect(sourceId, element);
      case "polyline":
      case "polygon":
        return this.#pointSequenceValidator.inspect(sourceId, element);
      default:
        return this.#basicShapeValidator.inspect(sourceId, element);
    }
  }
}
