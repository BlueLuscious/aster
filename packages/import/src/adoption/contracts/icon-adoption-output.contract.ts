import type { IconDefinition } from "@aster/core";
import type { IconImportDraft } from "./icon-import-draft.contract.js";
import type { IconModuleOutput } from "./icon-module-output.contract.js";

/**
 * @description Complete reviewable result of one successful adoption.
 */
export interface IconAdoptionOutput {
  /**
   * @description Metadata-free evidence produced from the acquired source.
   */
  readonly draft: IconImportDraft;

  /**
   * @description Complete immutable portable definition.
   */
  readonly definition: IconDefinition;

  /**
   * @description Editable canonical TypeScript hand-off.
   */
  readonly module: IconModuleOutput;
}
