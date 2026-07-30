/**
 * @description Deterministically derived names for one generated portable definition.
 */
export type TGeneratedIconName = {
  /**
   * @description Stable slash-separated logical identity key.
   */
  readonly identityKey: string;

  /**
   * @description Valid exported TypeScript definition identifier.
   */
  readonly symbol: string;

  /**
   * @description Generated-root-relative TypeScript module path.
   */
  readonly modulePath: string;

  /**
   * @description Public collection-package subpath.
   */
  readonly publicSubpath: string;

  /**
   * @description Manifest key relative to the collection package.
   */
  readonly manifestKey: string;
};
