/**
 * @description Immutable private protocol shared by module-import probe instrumentation.
 */
export const moduleImportProbe = Object.freeze({
  /** @description Process-global symbol key used to retain evaluated module URLs. */
  evaluationSymbolKey: "aster.tooling.module-evaluations",
});
