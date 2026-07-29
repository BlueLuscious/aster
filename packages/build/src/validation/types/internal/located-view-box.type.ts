import type { IconViewBox } from "@aster/core";
import type { SourceSpan } from "../../../diagnostic/contracts/index.js";

/**
 * @description Technically valid portable coordinate system and its exact authored evidence.
 */
export type TLocatedViewBox = {
  /**
   * @description Parsed coordinate system using the canonical Core contract.
   */
  readonly value: IconViewBox;

  /**
   * @description Exact source span of the complete authored viewBox value.
   */
  readonly span: SourceSpan;
};
