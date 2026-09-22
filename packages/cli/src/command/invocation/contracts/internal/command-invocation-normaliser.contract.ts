import type {
  AsterCommandInvocationType,
  AsterCommandNameType,
} from "../../../types/index.js";
import type { TAcceptanceResult } from "../../../types/internal/acceptance-result.type.js";

/**
 * @description Internal acceptance boundary for one explicitly composed command invocation family.
 */
export interface ICommandInvocationNormaliser {
  /**
   * @description Command identity owned by this normaliser.
   */
  readonly command: AsterCommandNameType;

  /**
   * @description Accepts one candidate invocation belonging to the owned command family.
   * @param value - Candidate structured invocation.
   * @returns Canonical immutable invocation or structured usage rejection.
   */
  normalise(value: unknown): TAcceptanceResult<AsterCommandInvocationType>;
}
