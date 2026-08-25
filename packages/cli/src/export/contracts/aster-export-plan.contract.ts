import type { exportTargets } from "../constants/export-targets.constant.js";
import type { AsterExportSubjectType } from "../types/aster-export-subject.type.js";
import type { AsterExportArtefact } from "./aster-export-artefact.contract.js";

/**
 * @description Complete host-neutral SVG export result before any optional host effect.
 */
export interface AsterExportPlan {
  /**
   * @description Target renderer used to produce every retained artefact.
   */
  readonly target: typeof exportTargets.svg;

  /**
   * @description Portable value family selected by the command.
   */
  readonly subject: AsterExportSubjectType;

  /**
   * @description Exact catalogue provider that supplied the selected definitions.
   */
  readonly catalogue: string;

  /**
   * @description Canonical textual identity selected by the command.
   */
  readonly identity: string;

  /**
   * @description Canonically ordered complete artefacts produced atomically by planning.
   */
  readonly artefacts: readonly AsterExportArtefact[];
}
