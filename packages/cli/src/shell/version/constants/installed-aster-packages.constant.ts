import { asterInstalledPackageNames } from "../../../command/constants/aster-installed-package-names.constant.js";

/**
 * @description Ordered public package identities resolved from one installed Aster CLI.
 */
export const installedAsterPackages = Object.freeze(
  Object.entries(asterInstalledPackageNames).map(([selector, name]) =>
    Object.freeze({
      /** @description Closed public package selector. */
      selector,
      /** @description Corresponding published package identity. */
      name,
    })
  ),
);
