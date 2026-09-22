import type { IconDefinition } from "@luscious-garden/aster-core";

/**
 * @description Accepted definition and provenance required for editable TypeScript emission.
 */
export interface IconModuleEmissionRequest {
  /**
   * @description Complete portable definition to serialise.
   */
  readonly definition: IconDefinition;

  /**
   * @description Non-empty canonical logical sources informing the definition.
   */
  readonly sourceIds: readonly string[];
}
