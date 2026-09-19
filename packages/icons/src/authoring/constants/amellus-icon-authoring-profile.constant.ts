import type {
  IconPresentationPolicy,
  IconViewBox,
} from "@aster/core";

/**
 * @description Immutable visual authoring profile shared by icons curated for Amellus.
 * @remarks The profile describes intrinsic icon input and is never applied or overridden by the
 * collection definition at composition time.
 */
export const amellusIconAuthoringProfile = Object.freeze({
  /** @description Canonical coordinate system used to author Amellus icon artwork. */
  viewBox: Object.freeze({
    /** @description Horizontal origin of the canonical coordinate system. */
    minX: 0,
    /** @description Vertical origin of the canonical coordinate system. */
    minY: 0,
    /** @description Width of the canonical coordinate system. */
    width: 24,
    /** @description Height of the canonical coordinate system. */
    height: 24,
  }) satisfies IconViewBox,
  /** @description Presentation and size policy authored into each Amellus icon definition. */
  presentation: Object.freeze({
    /** @description Default portable presentation inherited by authored icon nodes. */
    defaults: Object.freeze({
      /** @description Default paint applied to node interiors. */
      fill: "none",
      /** @description Default stroke resolved from the consumer's current colour. */
      stroke: "currentColor",
      /** @description Default stroke width in canonical icon coordinates. */
      strokeWidth: 1.5,
      /** @description Default shape used at the ends of open strokes. */
      strokeLineCap: "round",
      /** @description Default shape used where stroke segments meet. */
      strokeLineJoin: "round",
    }),
    /** @description Ordered presentation overrides accepted from consumers. */
    overrides: Object.freeze([]),
    /** @description Preferred consumer-facing size for Amellus artwork. */
    defaultSize: 24,
    /** @description Smallest consumer-facing size recommended for Amellus artwork. */
    minimumSize: 16,
  }) satisfies IconPresentationPolicy,
});
