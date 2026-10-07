import type { asterPackageVersionSources } from "../constants/aster-package-version-sources.constant.js";

/**
 * @description Provenance of one installed Aster package-version query.
 */
export type AsterPackageVersionSourceType =
  typeof asterPackageVersionSources[keyof typeof asterPackageVersionSources];
