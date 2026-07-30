/**
 * @description Strict JSON inspection result retaining duplicate-key source evidence.
 */
export type TJsonInspection =
  | {
      /**
       * @description Accepted JSON discriminator.
       */
      readonly accepted: true;

      /**
       * @description Parsed plain JSON value.
       */
      readonly value: unknown;
    }
  | {
      /**
       * @description Rejected JSON discriminator.
       */
      readonly accepted: false;

      /**
       * @description Whether syntax or accepted resource limits caused rejection.
       */
      readonly reason: "syntax" | "resource";
    }
  | {
      /**
       * @description Duplicate-key rejection discriminator.
       */
      readonly accepted: false;

      /**
       * @description Duplicate decoded object key.
       */
      readonly duplicateKey: string;

      /**
       * @description Inclusive UTF-16 offset of the duplicate key token.
       */
      readonly startOffset: number;

      /**
       * @description Exclusive UTF-16 offset of the duplicate key token.
       */
      readonly endOffset: number;
    };
