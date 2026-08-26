import type { AsterExportArtefact } from "../../../export/contracts/index.js";

/**
 * @description Validated mapping from one logical export artefact to its staged host path.
 */
export type TExportOutputEntry = Readonly<{
  /**
   * @description Complete immutable artefact supplied by the headless export plan.
   */
  artefact: AsterExportArtefact;

  /**
   * @description Absolute destination contained by the private staging root.
   */
  destination: string;

  /**
   * @description Absolute parent directory required by the destination.
   */
  parent: string;
}>;
