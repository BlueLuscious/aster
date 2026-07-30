/**
 * @description Canonical publication metadata required by one generated collection package.
 */
export interface IGeneratedPackageMetadata {
  /**
   * @description Canonical npm package name.
   */
  readonly name: string;

  /**
   * @description Canonical semantic package version.
   */
  readonly version: string;

  /**
   * @description Human-readable package purpose.
   */
  readonly description: string;

  /**
   * @description Licence expression copied to `package.json#license`.
   */
  readonly licence: string;
}
