import type { AsterCliLocationStatusType } from "../types/aster-cli-location-status.type.js";

/**
 * @description Opt-in host evidence identifying the CLI module that actually ran.
 */
export interface AsterCliLocationEvidence {
  /** @description Absolute path of the executed CLI entrypoint module. */
  readonly entrypoint: string;

  /** @description Comparison with the current project's direct CLI, when possible. */
  readonly projectCli: AsterCliLocationStatusType;
}
