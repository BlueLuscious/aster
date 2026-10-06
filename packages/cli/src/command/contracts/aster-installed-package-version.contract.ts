/**
 * @description Explicit installed package-version evidence supplied by an execution host.
 */
export interface AsterInstalledPackageVersion {
  /** @description Exact published public package identity. */
  readonly name: string;

  /** @description Version declared by the installed package manifest. */
  readonly version: string;
}
