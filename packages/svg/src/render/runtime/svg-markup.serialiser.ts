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
import type { ISvgRenderContext } from "../contracts/internal/index.js";
import type { SvgMarkupType } from "../types/index.js";
import { SvgNumberSerialiser } from "./svg-number.serialiser.js";
import { SvgPathDataSerialiser } from "./svg-path-data.serialiser.js";
import { SvgXmlCharacterValidator } from "./svg-xml-character.validator.js";

/**
 * @description Serialises one accepted render context into deterministic complete SVG markup.
 */
export class SvgMarkupSerialiser {
  /**
   * @description XML 1.0 character authority applied before escaping target values.
   */
  readonly #characterValidator = new SvgXmlCharacterValidator();

  /**
   * @description Canonical SVG number serialiser.
   */
  readonly #numberSerialiser = new SvgNumberSerialiser();

  /**
   * @description Structured portable path serialiser.
   */
  readonly #pathDataSerialiser = new SvgPathDataSerialiser();

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
          .map((value) => this.#numberSerialiser.serialise(value))
          .join(" "),
      ),
      this.#attribute(
        "width",
        this.#numberSerialiser.serialise(context.width),
      ),
      this.#attribute(
        "height",
        this.#numberSerialiser.serialise(context.height),
      ),
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
        : `<title>${this.#text(context.title, "options.title")}</title>`;
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
        return `<path${this.#attribute(
          "d",
          this.#pathDataSerialiser.serialise(
            node.commands,
            `definition.nodes[${String(index)}].commands`,
          ),
        )}${presentationAttributes}/>`;
      case iconNodeKinds.circle:
        return `<circle${this.#attribute("cx", this.#numberSerialiser.serialise(node.cx))}${this.#attribute("cy", this.#numberSerialiser.serialise(node.cy))}${this.#attribute("r", this.#numberSerialiser.serialise(node.radius))}${presentationAttributes}/>`;
      case iconNodeKinds.ellipse:
        return `<ellipse${this.#attribute("cx", this.#numberSerialiser.serialise(node.cx))}${this.#attribute("cy", this.#numberSerialiser.serialise(node.cy))}${this.#attribute("rx", this.#numberSerialiser.serialise(node.radiusX))}${this.#attribute("ry", this.#numberSerialiser.serialise(node.radiusY))}${presentationAttributes}/>`;
      case iconNodeKinds.rectangle:
        return `<rect${this.#attribute("x", this.#numberSerialiser.serialise(node.x))}${this.#attribute("y", this.#numberSerialiser.serialise(node.y))}${this.#attribute("width", this.#numberSerialiser.serialise(node.width))}${this.#attribute("height", this.#numberSerialiser.serialise(node.height))}${node.radiusX === undefined ? "" : this.#attribute("rx", this.#numberSerialiser.serialise(node.radiusX))}${node.radiusY === undefined ? "" : this.#attribute("ry", this.#numberSerialiser.serialise(node.radiusY))}${presentationAttributes}/>`;
      case iconNodeKinds.line:
        return `<line${this.#attribute("x1", this.#numberSerialiser.serialise(node.x1))}${this.#attribute("y1", this.#numberSerialiser.serialise(node.y1))}${this.#attribute("x2", this.#numberSerialiser.serialise(node.x2))}${this.#attribute("y2", this.#numberSerialiser.serialise(node.y2))}${presentationAttributes}/>`;
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
      this.#attribute(
        "stroke-width",
        this.#numberSerialiser.serialise(presentation.strokeWidth),
      ),
      this.#attribute("stroke-linecap", presentation.strokeLineCap),
      this.#attribute("stroke-linejoin", presentation.strokeLineJoin),
      this.#attribute(
        "stroke-miterlimit",
        this.#numberSerialiser.serialise(presentation.strokeMiterLimit),
      ),
      this.#attribute(
        "opacity",
        this.#numberSerialiser.serialise(presentation.opacity),
      ),
      this.#attribute(
        "fill-opacity",
        this.#numberSerialiser.serialise(presentation.fillOpacity),
      ),
      this.#attribute(
        "stroke-opacity",
        this.#numberSerialiser.serialise(presentation.strokeOpacity),
      ),
    ].join("");
  }

  /**
   * @description Serialises one point sequence using canonical ASCII separators.
   * @param points - Canonical ordered portable coordinate pairs.
   * @returns Flat deterministic SVG points value.
   */
  #points(points: readonly IconPoint[]): string {
    return points
      .flatMap((point) => [
        this.#numberSerialiser.serialise(point.x),
        this.#numberSerialiser.serialise(point.y),
      ])
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

    return `matrix(-1 0 0 1 ${this.#numberSerialiser.serialise(translation)} 0)`;
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
    this.#characterValidator.validate(value, path);

    return ` ${name}="${this.#attributeText(value)}"`;
  }

  /**
   * @description Escapes accepted SVG attribute text.
   * @param value - Accepted unescaped attribute value.
   * @returns Escaped attribute text.
   */
  #attributeText(value: string): string {
    let escaped = "";
    let segmentStart = 0;

    for (let index = 0; index < value.length; index += 1) {
      let replacement: string | undefined;

      switch (value.charCodeAt(index)) {
        case 0x26: // &
          replacement = "&amp;";
          break;
        case 0x3c: // <
          replacement = "&lt;";
          break;
        case 0x3e: // >
          replacement = "&gt;";
          break;
        case 0x22: // "
          replacement = "&quot;";
          break;
        case 0x09: // Tab
          replacement = "&#9;";
          break;
        case 0x0a: // Line feed
          replacement = "&#10;";
          break;
        case 0x0d: // Carriage return
          replacement = "&#13;";
          break;
      }

      if (replacement === undefined) {
        continue;
      }

      escaped += value.slice(segmentStart, index) + replacement;
      segmentStart = index + 1;
    }

    return segmentStart === 0
      ? value
      : escaped + value.slice(segmentStart);
  }

  /**
   * @description Escapes accepted SVG text-node content.
   * @param value - Accepted unescaped text.
   * @param path - Logical source path reported for unsupported content.
   * @returns Escaped text-node content.
   */
  #text(value: string, path: string): string {
    this.#characterValidator.validate(value, path);

    return value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }
}
