import type { installedAsterPackages } from "../../constants/installed-aster-packages.constant.js";

/**
 * @description Closed selector for one public package resolved by the standalone CLI.
 */
export type TInstalledPackageSelector = (typeof installedAsterPackages)[number]["selector"];
