import type { generationIssueKinds } from "../../constants/generation-issue-kinds.constant.js";

/**
 * @description Internal stable evidence for one blocking generation-planning issue.
 */
export type TGenerationIssue =
  | {
      /**
       * @description Duplicate portable logical identity discriminator.
       */
      readonly kind: typeof generationIssueKinds.duplicateIdentity;

      /**
       * @description Canonical source responsible for the repeated identity.
       */
      readonly sourceId: string;

      /**
       * @description Repeated slash-separated logical identity.
       */
      readonly identityKey: string;

      /**
       * @description Canonical source responsible for the first identity occurrence.
       */
      readonly relatedSourceId: string;
    }
  | {
      /**
       * @description Unowned output replacement discriminator.
       */
      readonly kind: typeof generationIssueKinds.outputOwnership;

      /**
       * @description Existing generated-root-relative output path.
       */
      readonly sourceId: string;

      /**
       * @description Planned path occupied by an unowned file.
       */
      readonly path: string;
    }
  | {
      /**
       * @description Reserved package subpath discriminator.
       */
      readonly kind: typeof generationIssueKinds.reservedSubpath;

      /**
       * @description Canonical source responsible for the reserved subpath.
       */
      readonly sourceId: string;

      /**
       * @description Reserved package subpath.
       */
      readonly subpath: string;
    }
  | {
      /**
       * @description Generated TypeScript symbol collision discriminator.
       */
      readonly kind: typeof generationIssueKinds.symbolCollision;

      /**
       * @description Canonical source responsible for the colliding symbol.
       */
      readonly sourceId: string;

      /**
       * @description Repeated generated TypeScript identifier.
       */
      readonly symbol: string;

      /**
       * @description Canonical source responsible for the first symbol occurrence.
       */
      readonly relatedSourceId: string;
    };
