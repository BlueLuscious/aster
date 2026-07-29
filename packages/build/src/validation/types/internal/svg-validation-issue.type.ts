import type {
  DiagnosticRelatedContext,
  SourceSpan,
} from "../../../diagnostic/contracts/index.js";
import type { TCollectionRuleSeverity } from "./collection-rule-severity.type.js";

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
        | "duplicate-identity"
        | "empty-geometry"
        | "identity-disagreement"
        | "invalid-geometry"
        | "invalid-path-data"
        | "invalid-presentation"
        | "invalid-view-box"
        | "unsupported-attribute";

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
        | "collection-bounds"
        | "collection-complexity"
        | "collection-grid"
        | "collection-stroke"
        | "collection-view-box";

      /**
       * @description Accepted collection authority over this occurrence.
       */
      readonly severity: TCollectionRuleSeverity;
    }
);
