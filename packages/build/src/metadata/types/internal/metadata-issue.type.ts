import type { CanonicalTextSource } from "../../../source/contracts/index.js";
import type { metadataIssueKinds } from "../../constants/metadata-issue-kinds.constant.js";

/**
 * @description Stable internal evidence for one expected metadata source failure.
 */
export type TMetadataIssue =
  | {
      /**
       * @description Malformed JSON discriminator.
       */
      readonly kind: typeof metadataIssueKinds.malformedJson;

      /**
       * @description Canonical metadata source.
       */
      readonly source: CanonicalTextSource;

      /**
       * @description Whether syntax or accepted resource limits caused rejection.
       */
      readonly reason: "syntax" | "resource";
    }
  | {
      /**
       * @description Duplicate object-key discriminator.
       */
      readonly kind: typeof metadataIssueKinds.duplicateKey;

      /**
       * @description Canonical metadata source.
       */
      readonly source: CanonicalTextSource;

      /**
       * @description Duplicate decoded key.
       */
      readonly subject: string;

      /**
       * @description Inclusive duplicate-key token offset.
       */
      readonly startOffset: number;

      /**
       * @description Exclusive duplicate-key token offset.
       */
      readonly endOffset: number;
    }
  | {
      /**
       * @description Unknown field discriminator.
       */
      readonly kind: typeof metadataIssueKinds.unknownField;

      /**
       * @description Canonical metadata source.
       */
      readonly source: CanonicalTextSource;

      /**
       * @description Unknown logical metadata field path.
       */
      readonly subject: string;
    }
  | {
      /**
       * @description Unsupported schema-version discriminator.
       */
      readonly kind: typeof metadataIssueKinds.unsupportedVersion;

      /**
       * @description Canonical metadata source.
       */
      readonly source: CanonicalTextSource;

      /**
       * @description Observable unsupported version representation.
       */
      readonly subject: string;
    }
  | {
      /**
       * @description Acquired and decoded identity disagreement discriminator.
       */
      readonly kind: typeof metadataIssueKinds.identityDisagreement;

      /**
       * @description Canonical metadata source.
       */
      readonly source: CanonicalTextSource;

      /**
       * @description Logical identity field that disagreed.
       */
      readonly subject: string;
    }
  | {
      /**
       * @description Invalid metadata value discriminator.
       */
      readonly kind: typeof metadataIssueKinds.invalidValue;

      /**
       * @description Canonical metadata source.
       */
      readonly source: CanonicalTextSource;

      /**
       * @description Logical metadata value path that violated its contract.
       */
      readonly subject: string;
    };
