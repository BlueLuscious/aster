/**
 * @description Immutable discriminators for expected metadata source failures.
 */
export const metadataIssueKinds = Object.freeze({
  duplicateKey: "duplicate-key",
  identityDisagreement: "identity-disagreement",
  invalidValue: "invalid-value",
  malformedJson: "malformed-json",
  unknownField: "unknown-field",
  unsupportedVersion: "unsupported-version",
} as const);
