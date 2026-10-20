import type {
  IconDefinition,
  IconDirectionType,
  IconPaintType,
  IconPresentation,
} from "@luscious-garden/aster-core";

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
   * @description Canonical root colour context, explicitly undefined when absent.
   */
  readonly colour: IconPaintType | undefined;

  /**
   * @description Canonical caller presentation values authorised by the icon policy.
   */
  readonly presentationOverrides: IconPresentation;

  /**
   * @description Whether the result must remain absent from the accessibility tree.
   */
  readonly decorative: boolean;

  /**
   * @description Sole effective accessible name, explicitly undefined for decorative output.
   */
  readonly accessibleName: string | undefined;

  /**
   * @description Target-native title content, explicitly undefined when absent.
   */
  readonly title: string | undefined;

  /**
   * @description Explicit logical direction used to apply portable RTL policy.
   */
  readonly direction: IconDirectionType;
}
