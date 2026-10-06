import { asterInstalledPackageNames } from "../constants/aster-installed-package-names.constant.js";
import type { AsterInstalledPackageSelectorType } from "../types/aster-installed-package-selector.type.js";

/**
 * @description Recognises one public package selector without coercing untrusted values.
 * @param value - Candidate package selector.
 * @returns Whether the value names an accepted public Aster package.
 */
export function isAsterInstalledPackageSelector(
  value: unknown,
): value is AsterInstalledPackageSelectorType {
  return typeof value === "string" && Object.hasOwn(asterInstalledPackageNames, value);
}
