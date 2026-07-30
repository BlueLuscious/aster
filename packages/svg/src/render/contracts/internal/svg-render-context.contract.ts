import type {
  IconDefinition,
  IconDirectionType,
  IconPaintType,
  IconPresentation,
} from "@aster/core";

/**
 * @description Accepted immutable values required to serialise one complete SVG result.
 */
export interface ISvgRenderContext {
  /**
   * @description Canonical portable definition isolated by the Core construction boundary.
   */
  readonly definition: IconDefinition;

  /**
   * @description Positive effective viewport width.
   */
  readonly width: number;

  /**
   * @description Positive effective viewport height.
   */
  readonly height: number;

  /**
   * @description Optional canonical colour context emitted on the SVG root.
   */
  readonly colour?: IconPaintType;

  /**
   * @description Canonical caller presentation values authorised by collection policy.
   */
  readonly presentationOverrides: IconPresentation;

  /**
   * @description Whether the result must remain absent from the accessibility tree.
   */
  readonly decorative: boolean;

  /**
   * @description Sole effective accessible name for semantic output.
   */
  readonly accessibleName?: string;

  /**
   * @description Optional target-native title content.
   */
  readonly title?: string;

  /**
   * @description Explicit logical direction used to apply portable RTL policy.
   */
  readonly direction: IconDirectionType;
}
