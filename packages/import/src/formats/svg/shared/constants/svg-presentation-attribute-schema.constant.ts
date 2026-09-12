import type { IconPresentation } from "@aster/core";
import type { TSvgPresentationNumericDomain } from "../types/internal/svg-presentation-numeric-domain.type.js";
import { svgNumericDomains } from "./svg-numeric-domains.constant.js";
import { svgPresentationValueKinds } from "./svg-presentation-value-kinds.constant.js";
import { svgSourceAttributeNames } from "./svg-source-attribute-names.constant.js";

/**
 * @description Immutable source-to-portable schema for every accepted SVG presentation attribute.
 */
export const svgPresentationAttributeSchema = Object.freeze({
  /** @description Validation schema for the SVG fill presentation attribute. */
  [svgSourceAttributeNames.fill]: Object.freeze({
    /** @description Portable presentation field populated by this SVG attribute. */
    field: "fill",
    /** @description Value grammar used to validate this SVG attribute. */
    valueKind: svgPresentationValueKinds.paint,
    /** @description Whether the SVG attribute may be inherited from a structural ancestor. */
    inherited: true,
  }),
  /** @description Validation schema for the SVG fill rule presentation attribute. */
  [svgSourceAttributeNames.fillRule]: Object.freeze({
    /** @description Portable presentation field populated by this SVG attribute. */
    field: "fillRule",
    /** @description Value grammar used to validate this SVG attribute. */
    valueKind: svgPresentationValueKinds.enumeration,
    /** @description Closed values accepted for this SVG editor attribute. */
    acceptedValues: Object.freeze(["nonzero", "evenodd"] as const),
    /** @description Whether the SVG attribute may be inherited from a structural ancestor. */
    inherited: true,
  }),
  /** @description Validation schema for the SVG stroke presentation attribute. */
  [svgSourceAttributeNames.stroke]: Object.freeze({
    /** @description Portable presentation field populated by this SVG attribute. */
    field: "stroke",
    /** @description Value grammar used to validate this SVG attribute. */
    valueKind: svgPresentationValueKinds.paint,
    /** @description Whether the SVG attribute may be inherited from a structural ancestor. */
    inherited: true,
  }),
  /** @description Validation schema for the SVG stroke width presentation attribute. */
  [svgSourceAttributeNames.strokeWidth]: Object.freeze({
    /** @description Portable presentation field populated by this SVG attribute. */
    field: "strokeWidth",
    /** @description Value grammar used to validate this SVG attribute. */
    valueKind: svgPresentationValueKinds.number,
    /** @description Numeric domain applied when validating this SVG attribute. */
    numericDomain: svgNumericDomains.nonNegative,
    /** @description Whether the SVG attribute may be inherited from a structural ancestor. */
    inherited: true,
  }),
  /** @description Validation schema for the SVG stroke line cap presentation attribute. */
  [svgSourceAttributeNames.strokeLineCap]: Object.freeze({
    /** @description Portable presentation field populated by this SVG attribute. */
    field: "strokeLineCap",
    /** @description Value grammar used to validate this SVG attribute. */
    valueKind: svgPresentationValueKinds.enumeration,
    /** @description Closed values accepted for this SVG editor attribute. */
    acceptedValues: Object.freeze(["butt", "round", "square"] as const),
    /** @description Whether the SVG attribute may be inherited from a structural ancestor. */
    inherited: true,
  }),
  /** @description Validation schema for the SVG stroke line join presentation attribute. */
  [svgSourceAttributeNames.strokeLineJoin]: Object.freeze({
    /** @description Portable presentation field populated by this SVG attribute. */
    field: "strokeLineJoin",
    /** @description Value grammar used to validate this SVG attribute. */
    valueKind: svgPresentationValueKinds.enumeration,
    /** @description Closed values accepted for this SVG editor attribute. */
    acceptedValues: Object.freeze(["miter", "round", "bevel"] as const),
    /** @description Whether the SVG attribute may be inherited from a structural ancestor. */
    inherited: true,
  }),
  /** @description Validation schema for the SVG stroke miter limit presentation attribute. */
  [svgSourceAttributeNames.strokeMiterLimit]: Object.freeze({
    /** @description Portable presentation field populated by this SVG attribute. */
    field: "strokeMiterLimit",
    /** @description Value grammar used to validate this SVG attribute. */
    valueKind: svgPresentationValueKinds.number,
    /** @description Numeric domain applied when validating this SVG attribute. */
    numericDomain: svgNumericDomains.positive,
    /** @description Whether the SVG attribute may be inherited from a structural ancestor. */
    inherited: true,
  }),
  /** @description Validation schema for the SVG opacity presentation attribute. */
  [svgSourceAttributeNames.opacity]: Object.freeze({
    /** @description Portable presentation field populated by this SVG attribute. */
    field: "opacity",
    /** @description Value grammar used to validate this SVG attribute. */
    valueKind: svgPresentationValueKinds.number,
    /** @description Numeric domain applied when validating this SVG attribute. */
    numericDomain: svgNumericDomains.opacity,
    /** @description Whether the SVG attribute may be inherited from a structural ancestor. */
    inherited: false,
  }),
  /** @description Validation schema for the SVG fill opacity presentation attribute. */
  [svgSourceAttributeNames.fillOpacity]: Object.freeze({
    /** @description Portable presentation field populated by this SVG attribute. */
    field: "fillOpacity",
    /** @description Value grammar used to validate this SVG attribute. */
    valueKind: svgPresentationValueKinds.number,
    /** @description Numeric domain applied when validating this SVG attribute. */
    numericDomain: svgNumericDomains.opacity,
    /** @description Whether the SVG attribute may be inherited from a structural ancestor. */
    inherited: true,
  }),
  /** @description Validation schema for the SVG stroke opacity presentation attribute. */
  [svgSourceAttributeNames.strokeOpacity]: Object.freeze({
    /** @description Portable presentation field populated by this SVG attribute. */
    field: "strokeOpacity",
    /** @description Value grammar used to validate this SVG attribute. */
    valueKind: svgPresentationValueKinds.number,
    /** @description Numeric domain applied when validating this SVG attribute. */
    numericDomain: svgNumericDomains.opacity,
    /** @description Whether the SVG attribute may be inherited from a structural ancestor. */
    inherited: true,
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
