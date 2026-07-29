import type { IconPresentation } from "@aster/core";

/**
 * @description Immutable source-to-portable schema for every accepted SVG presentation attribute.
 */
export const svgPresentationAttributeSchema = Object.freeze({
  fill: Object.freeze({
    field: "fill",
    valueKind: "paint",
    inherited: true,
    collectStrokeWidth: false,
  }),
  "fill-rule": Object.freeze({
    field: "fillRule",
    valueKind: "enumeration",
    acceptedValues: Object.freeze(["nonzero", "evenodd"] as const),
    inherited: true,
    collectStrokeWidth: false,
  }),
  stroke: Object.freeze({
    field: "stroke",
    valueKind: "paint",
    inherited: true,
    collectStrokeWidth: false,
  }),
  "stroke-width": Object.freeze({
    field: "strokeWidth",
    valueKind: "number",
    numericDomain: "non-negative",
    inherited: true,
    collectStrokeWidth: true,
  }),
  "stroke-linecap": Object.freeze({
    field: "strokeLineCap",
    valueKind: "enumeration",
    acceptedValues: Object.freeze(["butt", "round", "square"] as const),
    inherited: true,
    collectStrokeWidth: false,
  }),
  "stroke-linejoin": Object.freeze({
    field: "strokeLineJoin",
    valueKind: "enumeration",
    acceptedValues: Object.freeze(["miter", "round", "bevel"] as const),
    inherited: true,
    collectStrokeWidth: false,
  }),
  "stroke-miterlimit": Object.freeze({
    field: "strokeMiterLimit",
    valueKind: "number",
    numericDomain: "positive",
    inherited: true,
    collectStrokeWidth: false,
  }),
  opacity: Object.freeze({
    field: "opacity",
    valueKind: "number",
    numericDomain: "opacity",
    inherited: false,
    collectStrokeWidth: false,
  }),
  "fill-opacity": Object.freeze({
    field: "fillOpacity",
    valueKind: "number",
    numericDomain: "opacity",
    inherited: true,
    collectStrokeWidth: false,
  }),
  "stroke-opacity": Object.freeze({
    field: "strokeOpacity",
    valueKind: "number",
    numericDomain: "opacity",
    inherited: true,
    collectStrokeWidth: false,
  }),
}) satisfies Readonly<
  Record<
    string,
    Readonly<
      {
        readonly field: keyof IconPresentation;
        readonly inherited: boolean;
        readonly collectStrokeWidth: boolean;
      } & (
        | {
            readonly valueKind: "paint";
          }
        | {
            readonly valueKind: "enumeration";
            readonly acceptedValues: readonly string[];
          }
        | {
            readonly valueKind: "number";
            readonly numericDomain:
              | "non-negative"
              | "opacity"
              | "positive";
          }
      )
    >
  >
>;
