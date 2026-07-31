import {
  iconDirections,
  iconNodeKinds,
  iconRtlPolicies,
  iconTechnicalPresentation,
  type IconNodeType,
  type IconPoint,
  type IconPresentation,
} from "@aster/core";
import { SvgRenderError } from "../../error/index.js";
import { svgMarkupSchema } from "../constants/svg-markup-schema.constant.js";
import type { ISvgRenderContext } from "../contracts/internal/index.js";
import type { SvgMarkupType } from "../types/index.js";

/**
 * @description Serialises one accepted render context into deterministic complete SVG markup.
 */
export class SvgMarkupSerialiser {
  /**
   * @description Characters that cannot enter an XML 1.0 markup value.
   */
  readonly #invalidCharacterPattern = new RegExp(svgMarkupSchema.invalidCharacterPatternSource, "u");

  /**
   * @description Produces complete markup with canonical element and attribute ordering.
   * @param context - Accepted immutable SVG render context.
   * @returns Complete deterministic standalone SVG markup.
   */
  serialise(context: ISvgRenderContext): SvgMarkupType {
    const { definition } = context;
    const rootAttributes = [
      this.#attribute("xmlns", "http://www.w3.org/2000/svg"),
      this.#attribute(
        "viewBox",
        [
          definition.viewBox.minX,
          definition.viewBox.minY,
          definition.viewBox.width,
          definition.viewBox.height,
        ]
          .map((value) => this.#number(value))
          .join(" "),
      ),
      this.#attribute("width", this.#number(context.width)),
      this.#attribute("height", this.#number(context.height)),
      ...(context.colour === undefined
        ? []
        : [this.#attribute("color", context.colour)]),
      ...(context.decorative
        ? [
            this.#attribute("aria-hidden", "true"),
            this.#attribute("focusable", "false"),
          ]
        : [
            this.#attribute("role", "img"),
            this.#attribute("aria-label", context.accessibleName ?? ""),
          ]),
    ].join("");
    const title =
      context.title === undefined
        ? ""
        : `<title>${this.#text(context.title)}</title>`;
    const geometry = definition.nodes
      .map((node, index) => this.#node(node, index, context))
      .join("");
    const content =
      context.direction === iconDirections[1] &&
      definition.metadata.rtl === iconRtlPolicies[0]
        ? `${title}<g transform="${this.#mirrorTransform(context)}">${geometry}</g>`
        : `${title}${geometry}`;

    return `<svg${rootAttributes}>${content}</svg>`;
  }

  /**
   * @description Serialises one portable geometry node with effective presentation.
   * @param node - Canonical portable geometry node.
   * @param index - Paint-order index used by deterministic failure paths.
   * @param context - Accepted render context owning presentation precedence.
   * @returns One compact self-closing geometry element.
   */
  #node(
    node: IconNodeType,
    index: number,
    context: ISvgRenderContext,
  ): string {
    const presentation = this.#presentation(context, node);
    const presentationAttributes = this.#presentationAttributes(presentation);

    switch (node.kind) {
      case iconNodeKinds.path:
        return `<path${this.#attribute("d", node.data, `definition.nodes[${String(index)}].data`)}${presentationAttributes}/>`;
      case iconNodeKinds.circle:
        return `<circle${this.#attribute("cx", this.#number(node.cx))}${this.#attribute("cy", this.#number(node.cy))}${this.#attribute("r", this.#number(node.radius))}${presentationAttributes}/>`;
      case iconNodeKinds.ellipse:
        return `<ellipse${this.#attribute("cx", this.#number(node.cx))}${this.#attribute("cy", this.#number(node.cy))}${this.#attribute("rx", this.#number(node.radiusX))}${this.#attribute("ry", this.#number(node.radiusY))}${presentationAttributes}/>`;
      case iconNodeKinds.rectangle:
        return `<rect${this.#attribute("x", this.#number(node.x))}${this.#attribute("y", this.#number(node.y))}${this.#attribute("width", this.#number(node.width))}${this.#attribute("height", this.#number(node.height))}${node.radiusX === undefined ? "" : this.#attribute("rx", this.#number(node.radiusX))}${node.radiusY === undefined ? "" : this.#attribute("ry", this.#number(node.radiusY))}${presentationAttributes}/>`;
      case iconNodeKinds.line:
        return `<line${this.#attribute("x1", this.#number(node.x1))}${this.#attribute("y1", this.#number(node.y1))}${this.#attribute("x2", this.#number(node.x2))}${this.#attribute("y2", this.#number(node.y2))}${presentationAttributes}/>`;
      case iconNodeKinds.polyline:
        return `<polyline${this.#attribute("points", this.#points(node.points))}${presentationAttributes}/>`;
      case iconNodeKinds.polygon:
        return `<polygon${this.#attribute("points", this.#points(node.points))}${presentationAttributes}/>`;
      default:
        throw new SvgRenderError(
          `definition.nodes[${String(index)}].kind`,
          "expected a supported portable geometry node",
        );
    }
  }

  /**
   * @description Resolves complete node presentation according to accepted precedence.
   * @param context - Accepted render context owning resolved icon defaults.
   * @param node - Canonical node carrying optional explicit presentation.
   * @returns Complete effective presentation.
   */
  #presentation(
    context: ISvgRenderContext,
    node: IconPresentation,
  ): Readonly<Required<IconPresentation>> {
    const effective = {
      ...iconTechnicalPresentation,
      ...context.definition.metadata.presentation.defaults,
      ...node,
      ...context.presentationOverrides,
    };

    return Object.freeze({
      fill: effective.fill,
      fillRule: effective.fillRule,
      stroke: effective.stroke,
      strokeWidth: effective.strokeWidth,
      strokeLineCap: effective.strokeLineCap,
      strokeLineJoin: effective.strokeLineJoin,
      strokeMiterLimit: effective.strokeMiterLimit,
      opacity: effective.opacity,
      fillOpacity: effective.fillOpacity,
      strokeOpacity: effective.strokeOpacity,
    });
  }

  /**
   * @description Serialises complete presentation in canonical attribute order.
   * @param presentation - Complete effective portable presentation.
   * @returns Ordered SVG presentation attributes.
   */
  #presentationAttributes(
    presentation: Readonly<Required<IconPresentation>>,
  ): string {
    return [
      this.#attribute("fill", presentation.fill),
      this.#attribute("fill-rule", presentation.fillRule),
      this.#attribute("stroke", presentation.stroke),
      this.#attribute("stroke-width", this.#number(presentation.strokeWidth)),
      this.#attribute("stroke-linecap", presentation.strokeLineCap),
      this.#attribute("stroke-linejoin", presentation.strokeLineJoin),
      this.#attribute(
        "stroke-miterlimit",
        this.#number(presentation.strokeMiterLimit),
      ),
      this.#attribute("opacity", this.#number(presentation.opacity)),
      this.#attribute("fill-opacity", this.#number(presentation.fillOpacity)),
      this.#attribute("stroke-opacity", this.#number(presentation.strokeOpacity)),
    ].join("");
  }

  /**
   * @description Serialises one point sequence using canonical ASCII separators.
   * @param points - Canonical ordered portable coordinate pairs.
   * @returns Flat deterministic SVG points value.
   */
  #points(points: readonly IconPoint[]): string {
    return points
      .flatMap((point) => [this.#number(point.x), this.#number(point.y)])
      .join(" ");
  }

  /**
   * @description Computes the accepted horizontal reflection matrix for RTL geometry.
   * @param context - Accepted render context containing definition direction policy.
   * @returns Escaped matrix attribute with a canonical translation.
   */
  #mirrorTransform(context: ISvgRenderContext): string {
    const translation =
      2 * context.definition.viewBox.minX + context.definition.viewBox.width;

    return `matrix(-1 0 0 1 ${this.#number(translation)} 0)`;
  }

  /**
   * @description Serialises one finite number without locale dependence or negative zero.
   * @param value - Canonical finite numeric value.
   * @returns ECMAScript numeric string.
   */
  #number(value: number): string {
    return String(Object.is(value, -0) ? 0 : value);
  }

  /**
   * @description Serialises one escaped double-quoted SVG attribute.
   * @param name - Canonical SVG attribute name.
   * @param value - Accepted attribute value.
   * @param path - Logical source path used if the value cannot enter XML.
   * @returns Leading-space attribute markup.
   */
  #attribute(
    name: string,
    value: string,
    path = "target.attribute",
  ): string {
    if (this.#invalidCharacterPattern.test(value)) {
      throw new SvgRenderError(path, "contains a character unsupported by XML");
    }

    return ` ${name}="${this.#attributeText(value)}"`;
  }

  /**
   * @description Escapes accepted SVG attribute text.
   * @param value - Accepted unescaped attribute value.
   * @returns Escaped attribute text.
   */
  #attributeText(value: string): string {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("\t", "&#9;")
      .replaceAll("\n", "&#10;")
      .replaceAll("\r", "&#13;");
  }

  /**
   * @description Escapes accepted SVG text-node content.
   * @param value - Accepted unescaped text.
   * @returns Escaped text-node content.
   */
  #text(value: string): string {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }
}
