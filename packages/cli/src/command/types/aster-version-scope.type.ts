import type { asterVersionScopes } from "../constants/aster-version-scopes.constant.js";
import type { AsterInstalledPackageSelectorType } from "./aster-installed-package-selector.type.js";

/**
 * @description One public package selector or the complete installed public package family.
 */
export type AsterVersionScopeType =
  | AsterInstalledPackageSelectorType
  | typeof asterVersionScopes.all;
