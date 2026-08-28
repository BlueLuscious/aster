import type {
  IconNodeType,
  IconPoint,
  IconPresentation,
} from "@aster/core";
import type { ISvgSyntaxElement } from "../../parser/contracts/internal/svg-syntax-element.contract.js";
import { svgSourceAttributeNames } from "../../shared/constants/svg-source-attribute-names.constant.js";
import { svgSourceElementNames } from "../../shared/constants/svg-source-element-names.constant.js";
import { SvgImportError } from "../../shared/runtime/svg-import.error.js";
import { SvgNumberParser } from "../../shared/runtime/svg-number.parser.js";
import { SvgPathDataNormaliser } from "./svg-path-data.normaliser.js";

/**
 * @description Converts one supported validated SVG primitive into explicit portable geometry.
 */
export class SvgPrimitiveNormaliser {
  /**
   * @description Strict finite SVG number and sequence parser.
   */
  readonly #numberParser = new SvgNumberParser();

  /**
   * @description Deterministic validated path-data normaliser.
   */
  readonly #pathNormaliser = new SvgPathDataNormaliser();

  /**
   * @description Normalises one supported primitive without changing its geometry kind.
   * @param element - Safe validated primitive syntax.
   * @param presentation - Fully resolved portable presentation.
   * @returns Explicit portable geometry node.
   */
  normalise(
    element: ISvgSyntaxElement,
    presentation: IconPresentation,
  ): IconNodeType {
    switch (element.localName) {
      case svgSourceElementNames.path:
        return {
          kind: svgSourceElementNames.path,
          data: this.#pathNormaliser.normalise(
            this.#required(element, svgSourceAttributeNames.pathData),
          ),
          ...presentation,
        };
      case svgSourceElementNames.circle:
        return {
          kind: svgSourceElementNames.circle,
          cx: this.#number(element, svgSourceAttributeNames.centreX, 0),
          cy: this.#number(element, svgSourceAttributeNames.centreY, 0),
          radius: this.#number(element, svgSourceAttributeNames.radius),
          ...presentation,
        };
      case svgSourceElementNames.ellipse:
        return {
          kind: svgSourceElementNames.ellipse,
          cx: this.#number(element, svgSourceAttributeNames.centreX, 0),
          cy: this.#number(element, svgSourceAttributeNames.centreY, 0),
          radiusX: this.#number(element, svgSourceAttributeNames.radiusX),
          radiusY: this.#number(element, svgSourceAttributeNames.radiusY),
          ...presentation,
        };
      case svgSourceElementNames.rectangle:
        return this.#rect(element, presentation);
      case svgSourceElementNames.line:
        return {
          kind: svgSourceElementNames.line,
          x1: this.#number(element, svgSourceAttributeNames.x1, 0),
          y1: this.#number(element, svgSourceAttributeNames.y1, 0),
          x2: this.#number(element, svgSourceAttributeNames.x2, 0),
          y2: this.#number(element, svgSourceAttributeNames.y2, 0),
          ...presentation,
        };
      case svgSourceElementNames.polyline:
      case svgSourceElementNames.polygon:
        return {
          kind: element.localName,
          points: this.#points(element),
          ...presentation,
        };
      default:
        throw new SvgImportError(
          "validatedPrimitive",
          "element kind is not valid normalisation input",
        );
    }
  }

  /**
   * @description Normalises rectangle geometry with only its authored optional radii.
   * @param element - Safe validated rectangle syntax.
   * @param presentation - Fully resolved portable presentation.
   * @returns Explicit portable rectangle node.
   */
  #rect(
    element: ISvgSyntaxElement,
    presentation: IconPresentation,
  ): IconNodeType {
    const authoredRadiusX = this.#optionalNumber(
      element,
      svgSourceAttributeNames.radiusX,
    );
    const authoredRadiusY = this.#optionalNumber(
      element,
      svgSourceAttributeNames.radiusY,
    );
    const radiusX = authoredRadiusX ?? authoredRadiusY;
    const radiusY = authoredRadiusY ?? authoredRadiusX;

    return {
      kind: svgSourceElementNames.rectangle,
      x: this.#number(element, svgSourceAttributeNames.x, 0),
      y: this.#number(element, svgSourceAttributeNames.y, 0),
      width: this.#number(element, svgSourceAttributeNames.width),
      height: this.#number(element, svgSourceAttributeNames.height),
      ...(radiusX === undefined ? {} : { radiusX }),
      ...(radiusY === undefined ? {} : { radiusY }),
      ...presentation,
    };
  }

  /**
   * @description Converts an accepted point sequence into explicit coordinate pairs.
   * @param element - Safe validated polyline or polygon syntax.
   * @returns Ordered portable points.
   */
  #points(element: ISvgSyntaxElement): readonly IconPoint[] {
    const values = this.#numberParser.parseSequence(
      this.#required(element, svgSourceAttributeNames.points),
    );

    if (values === undefined || values.length % 2 !== 0) {
      throw new SvgImportError(
        "validatedPoints",
        "point sequence is not valid normalisation input",
      );
    }

    const points: IconPoint[] = [];

    for (let index = 0; index < values.length; index += 2) {
      points.push(
        Object.freeze({
          x: values[index] ?? 0,
          y: values[index + 1] ?? 0,
        }),
      );
    }

    return Object.freeze(points);
  }

  /**
   * @description Reads one required or defaulted finite geometry number.
   * @param element - Safe validated geometry syntax.
   * @param name - Namespace-free SVG attribute name.
   * @param fallback - SVG default used only when the attribute is absent.
   * @returns Canonical finite number.
   */
  #number(
    element: ISvgSyntaxElement,
    name: string,
    fallback?: number,
  ): number {
    const value = this.#optionalNumber(element, name);

    if (value !== undefined) {
      return value;
    }

    if (fallback !== undefined) {
      return fallback;
    }

    throw new SvgImportError(
      `validatedPrimitive.${name}`,
      "required numeric geometry is unavailable",
    );
  }

  /**
   * @description Reads one optional finite geometry number.
   * @param element - Safe validated geometry syntax.
   * @param name - Namespace-free SVG attribute name.
   * @returns Canonical finite number, or `undefined` when absent.
   */
  #optionalNumber(
    element: ISvgSyntaxElement,
    name: string,
  ): number | undefined {
    const attribute = element.attributes.find(
      (candidate) => candidate.localName === name,
    );

    if (attribute === undefined) {
      return undefined;
    }

    const parsed = this.#numberParser.parse(attribute.value);

    if (parsed === undefined) {
      throw new SvgImportError(
        `validatedPrimitive.${name}`,
        "numeric geometry is not valid normalisation input",
      );
    }

    return parsed;
  }

  /**
   * @description Reads one required authored attribute.
   * @param element - Safe validated geometry syntax.
   * @param name - Namespace-free SVG attribute name.
   * @returns Exact validated attribute value.
   */
  #required(element: ISvgSyntaxElement, name: string): string {
    const attribute = element.attributes.find(
      (candidate) => candidate.localName === name,
    );

    if (attribute === undefined) {
      throw new SvgImportError(
        `validatedPrimitive.${name}`,
        "required attribute is unavailable",
      );
    }

    return attribute.value;
  }
}
