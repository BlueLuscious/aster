/**
 * @description Private icon-removal invocation and interrupted-operation boundaries.
 */
export const catalogueIconRemoval = Object.freeze({
  /** @description Contributor command, never a public Aster executable command. */
  command: "pnpm --dir packages/icons run remove:icon",
  /** @description Exclusive marker reserved for a cooperating removal application. */
  lockName: ".aster-icon-removal.lock",
  /** @description Reserved substring identifying source publication evidence requiring inspection. */
  stageMarker: ".aster-icon-removal-",
});
