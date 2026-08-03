import type { AsterCommandNameType } from "../types/index.js";

/**
 * @description Immutable host-neutral help metadata for one Aster command.
 */
export interface AsterCommandDescriptor {
  /**
   * @description Stable command identity used for deterministic dispatch.
   */
  readonly name: AsterCommandNameType;

  /**
   * @description Concise command responsibility independent of terminal formatting.
   */
  readonly summary: string;

  /**
   * @description Ordered accepted usage forms without the executable prefix.
   */
  readonly usage: readonly string[];
}
