import type { IGenerationEntry } from "../../contracts/internal/generation-entry.contract.js";
import type { TGeneratedIconName } from "./generated-icon-name.type.js";

/**
 * @description One generation entry paired with all deterministically derived names.
 */
export type TGenerationCandidate = {
  /**
   * @description Portable definition and canonical provenance.
   */
  readonly entry: IGenerationEntry;

  /**
   * @description Derived identity, symbol, module, subpath, and manifest names.
   */
  readonly name: TGeneratedIconName;
};
