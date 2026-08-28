import type { SourceSpan } from "../../../../../diagnostic/contracts/index.js";
import type { svgValidationIssueKinds } from "../../constants/svg-validation-issue-kinds.constant.js";

/**
 * @description Internal semantic evidence mapped to one stable technical SVG diagnostic.
 */
export type TSvgValidationIssue = {
  /**
   * @description Canonical logical source owning the primary evidence.
   */
  readonly sourceId: string;

  /**
   * @description Trustworthy source evidence when available.
   */
  readonly span?: SourceSpan;

  /**
   * @description Universal syntax or technical issue family.
   */
  readonly kind:
    (typeof svgValidationIssueKinds)[keyof typeof svgValidationIssueKinds];
};
