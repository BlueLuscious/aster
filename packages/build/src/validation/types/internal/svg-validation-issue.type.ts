import type {
  DiagnosticRelatedContext,
  SourceSpan,
} from "../../../diagnostic/contracts/index.js";
import type { TCollectionRuleSeverity } from "./collection-rule-severity.type.js";
import type { svgValidationIssueKinds } from "../../constants/svg-validation-issue-kinds.constant.js";

/**
 * @description Internal semantic evidence mapped to one stable validation diagnostic.
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
} & (
  | {
      /**
       * @description Universal syntax or technical issue family.
       */
      readonly kind:
        | typeof svgValidationIssueKinds.duplicateIdentity
        | typeof svgValidationIssueKinds.emptyGeometry
        | typeof svgValidationIssueKinds.identityDisagreement
        | typeof svgValidationIssueKinds.invalidGeometry
        | typeof svgValidationIssueKinds.invalidPathData
        | typeof svgValidationIssueKinds.invalidPresentation
        | typeof svgValidationIssueKinds.invalidViewBox
        | typeof svgValidationIssueKinds.unsupportedAttribute;

      /**
       * @description Additional deterministic collision evidence when required.
       */
      readonly related?: readonly DiagnosticRelatedContext[];
    }
  | {
      /**
       * @description Collection-owned visual issue family.
       */
      readonly kind:
        | typeof svgValidationIssueKinds.collectionBounds
        | typeof svgValidationIssueKinds.collectionComplexity
        | typeof svgValidationIssueKinds.collectionGrid
        | typeof svgValidationIssueKinds.collectionStroke
        | typeof svgValidationIssueKinds.collectionViewBox;

      /**
       * @description Accepted collection authority over this occurrence.
       */
      readonly severity: TCollectionRuleSeverity;
    }
);
