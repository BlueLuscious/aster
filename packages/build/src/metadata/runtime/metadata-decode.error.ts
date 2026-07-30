import type { metadataIssueKinds } from "../constants/metadata-issue-kinds.constant.js";

/**
 * @description Internal control-flow error for one expected semantic metadata rejection.
 */
export class MetadataDecodeError extends TypeError {
  /**
   * @description Stable metadata issue family.
   */
  readonly kind:
    | typeof metadataIssueKinds.identityDisagreement
    | typeof metadataIssueKinds.invalidValue
    | typeof metadataIssueKinds.unknownField
    | typeof metadataIssueKinds.unsupportedVersion;

  /**
   * @description Observable logical field or rejected value.
   */
  readonly subject: string;

  /**
   * @description Creates one expected semantic metadata rejection.
   * @param kind - Stable metadata issue family.
   * @param subject - Observable logical field or rejected value.
   */
  constructor(
    kind: MetadataDecodeError["kind"],
    subject: string,
  ) {
    super(`Metadata source rejected at ${subject}.`);
    this.name = "MetadataDecodeError";
    this.kind = kind;
    this.subject = subject;
  }
}
