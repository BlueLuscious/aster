import type {
  CollectionIdentity,
  IconIdentity,
  IconMetadata,
  IconNodeType,
  IconViewBox,
} from "@aster/core";
import type { SvgMarkupType } from "@aster/svg";

/**
 * @description Immutable portable and rendered evidence for one reviewed icon.
 */
export interface AsterReviewIconEvidence {
  /**
   * @description Stable portable icon identity.
   */
  readonly identity: IconIdentity;

  /**
   * @description Complete accepted portable icon metadata.
   */
  readonly metadata: IconMetadata;

  /**
   * @description Logical coordinate system used by the reviewed geometry.
   */
  readonly viewBox: IconViewBox;

  /**
   * @description Number of geometry nodes retained by the canonical definition.
   */
  readonly nodeCount: number;

  /**
   * @description Canonically ordered unique primitive families used by the icon.
   */
  readonly primitiveKinds: readonly IconNodeType["kind"][];

  /**
   * @description Canonically ordered collections retaining the icon.
   */
  readonly memberships: readonly CollectionIdentity[];

  /**
   * @description Complete deterministic decorative SVG markup produced by `@aster/svg`.
   */
  readonly markup: SvgMarkupType;
}
