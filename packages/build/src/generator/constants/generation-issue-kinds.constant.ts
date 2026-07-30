/**
 * @description Immutable issue discriminators owned by generation planning.
 */
export const generationIssueKinds = Object.freeze({
  duplicateIdentity: "duplicate-identity",
  outputOwnership: "output-ownership",
  reservedSubpath: "reserved-subpath",
  symbolCollision: "symbol-collision",
} as const);
