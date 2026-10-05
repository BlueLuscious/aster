/**
 * @description Validated identity and version read from one installed public package manifest.
 */
export interface IInstalledPackageVersion {
  /**
   * @description Exact published package identity.
   */
  readonly name: string;

  /**
   * @description Version declared by the resolved installed manifest.
   */
  readonly version: string;
}
