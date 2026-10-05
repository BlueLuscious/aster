import type { asterInstalledPackageNames } from "../constants/aster-installed-package-names.constant.js";

/**
 * @description Closed selector for one installed public Aster package.
 */
export type AsterInstalledPackageSelectorType = keyof typeof asterInstalledPackageNames;
