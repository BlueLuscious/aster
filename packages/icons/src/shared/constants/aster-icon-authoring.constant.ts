import type {
  IconPresentationPolicy,
  IconViewBox,
} from "@aster/core";

/**
 * @description Immutable authoring defaults shared by canonical Aster icon definitions.
 */
export const asterIconAuthoring = Object.freeze({
  /** @description Canonical namespace assigned to every Aster-authored icon identity. */
  namespace: "aster",
  /** @description Licence identifier shared by the canonical Aster icon catalogue. */
  licence: "ISC",
  /** @description Attribution recorded by every canonical Aster icon definition. */
  attribution: "BlueLuscious",
  /** @description Canonical coordinate system used to author Aster icons. */
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
  /** @description Shared rendering policy applied by canonical Aster icons. */
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
    /** @description Ordered presentation overrides applied after the shared defaults. */
    overrides: Object.freeze([]),
    /** @description Preferred consumer-facing icon size. */
    defaultSize: 24,
    /** @description Smallest consumer-facing size recommended by the collection. */
    minimumSize: 16,
  }) satisfies IconPresentationPolicy,
});
