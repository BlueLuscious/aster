import type { IconDefinition } from "@aster/core";
import type { AsterExportSubjectType } from "../aster-export-subject.type.js";

/**
 * @description Internal exact catalogue selection prepared for deterministic SVG rendering.
 */
export type TExportSelection = Readonly<{
  /**
   * @description Exact provider that supplied the accepted definitions.
   */
  catalogue: string;

  /**
   * @description Selected portable value family.
   */
  subject: AsterExportSubjectType;

  /**
   * @description Canonical textual identity requested by the caller.
   */
  identity: string;

  /**
   * @description Canonically ordered isolated definitions selected for rendering.
   */
  definitions: readonly IconDefinition[];
}>;

