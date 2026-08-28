import type { IconPresentation } from "@aster/core";
import type { TSvgPresentationNumericDomain } from "../types/internal/svg-presentation-numeric-domain.type.js";
import { svgNumericDomains } from "./svg-numeric-domains.constant.js";
import { svgPresentationValueKinds } from "./svg-presentation-value-kinds.constant.js";
import { svgSourceAttributeNames } from "./svg-source-attribute-names.constant.js";

/**
 * @description Immutable source-to-portable schema for every accepted SVG presentation attribute.
 */
export const svgPresentationAttributeSchema = Object.freeze({
  [svgSourceAttributeNames.fill]: Object.freeze({
    field: "fill",
    valueKind: svgPresentationValueKinds.paint,
    inherited: true,
    collectStrokeWidth: false,
  }),
  [svgSourceAttributeNames.fillRule]: Object.freeze({
    field: "fillRule",
    valueKind: svgPresentationValueKinds.enumeration,
    acceptedValues: Object.freeze(["nonzero", "evenodd"] as const),
    inherited: true,
    collectStrokeWidth: false,
  }),
  [svgSourceAttributeNames.stroke]: Object.freeze({
    field: "stroke",
    valueKind: svgPresentationValueKinds.paint,
    inherited: true,
    collectStrokeWidth: false,
  }),
  [svgSourceAttributeNames.strokeWidth]: Object.freeze({
    field: "strokeWidth",
    valueKind: svgPresentationValueKinds.number,
    numericDomain: svgNumericDomains.nonNegative,
    inherited: true,
    collectStrokeWidth: true,
  }),
  [svgSourceAttributeNames.strokeLineCap]: Object.freeze({
    field: "strokeLineCap",
    valueKind: svgPresentationValueKinds.enumeration,
    acceptedValues: Object.freeze(["butt", "round", "square"] as const),
    inherited: true,
    collectStrokeWidth: false,
  }),
  [svgSourceAttributeNames.strokeLineJoin]: Object.freeze({
    field: "strokeLineJoin",
    valueKind: svgPresentationValueKinds.enumeration,
    acceptedValues: Object.freeze(["miter", "round", "bevel"] as const),
    inherited: true,
    collectStrokeWidth: false,
  }),
  [svgSourceAttributeNames.strokeMiterLimit]: Object.freeze({
    field: "strokeMiterLimit",
    valueKind: svgPresentationValueKinds.number,
    numericDomain: svgNumericDomains.positive,
    inherited: true,
    collectStrokeWidth: false,
  }),
  [svgSourceAttributeNames.opacity]: Object.freeze({
    field: "opacity",
    valueKind: svgPresentationValueKinds.number,
    numericDomain: svgNumericDomains.opacity,
    inherited: false,
    collectStrokeWidth: false,
  }),
  [svgSourceAttributeNames.fillOpacity]: Object.freeze({
    field: "fillOpacity",
    valueKind: svgPresentationValueKinds.number,
    numericDomain: svgNumericDomains.opacity,
    inherited: true,
    collectStrokeWidth: false,
  }),
  [svgSourceAttributeNames.strokeOpacity]: Object.freeze({
    field: "strokeOpacity",
    valueKind: svgPresentationValueKinds.number,
    numericDomain: svgNumericDomains.opacity,
    inherited: true,
    collectStrokeWidth: false,
  }),
}) satisfies Readonly<
  Record<
    string,
    Readonly<
      {
        /**
         * @description Portable presentation field produced from the source attribute.
         */
        readonly field: keyof IconPresentation;

        /**
         * @description Whether structural ancestors may provide the attribute value.
         */
        readonly inherited: boolean;

        /**
         * @description Whether accepted values contribute explicit collection stroke evidence.
         */
        readonly collectStrokeWidth: boolean;
      } & (
        | {
            /**
             * @description Discriminator selecting closed portable paint validation.
             */
            readonly valueKind: typeof svgPresentationValueKinds.paint;
          }
        | {
            /**
             * @description Discriminator selecting closed enumeration validation.
             */
            readonly valueKind: typeof svgPresentationValueKinds.enumeration;

            /**
             * @description Exact authored values accepted for the portable field.
             */
            readonly acceptedValues: readonly string[];
          }
        | {
            /**
             * @description Discriminator selecting finite numeric validation.
             */
            readonly valueKind: typeof svgPresentationValueKinds.number;

            /**
             * @description Numeric domain enforced for the portable field.
             */
            readonly numericDomain: TSvgPresentationNumericDomain;
          }
      )
    >
  >
>;
